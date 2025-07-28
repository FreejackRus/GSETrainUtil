-- Миграция для улучшения структуры базы данных
-- Этот скрипт создает новые таблицы и переносит данные из старой структуры

BEGIN;

-- Создание новых справочных таблиц
CREATE TABLE IF NOT EXISTS trains (
    id SERIAL PRIMARY KEY,
    number VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS carriages (
    id SERIAL PRIMARY KEY,
    number VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    train_id INTEGER REFERENCES trains(id),
    UNIQUE(number, train_id)
);

CREATE TABLE IF NOT EXISTS type_work (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS completed_jobs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS current_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- Создание таблицы оборудования с фотографиями
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255),
    mac_address VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    last_service TIMESTAMP,
    carriage_id INTEGER REFERENCES carriages(id)
);

-- Таблица фотографий оборудования
CREATE TABLE IF NOT EXISTS equipment_photos (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) NOT NULL, -- 'carriage', 'equipment', 'serial', 'mac', 'general', 'final'
    photo_path VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Обновленная таблица заявок
CREATE TABLE IF NOT EXISTS requests_new (
    id SERIAL PRIMARY KEY,
    application_number INTEGER UNIQUE NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type_work_id INTEGER REFERENCES type_work(id),
    train_id INTEGER REFERENCES trains(id),
    carriage_id INTEGER REFERENCES carriages(id),
    equipment_id INTEGER REFERENCES equipment(id),
    completed_job_id INTEGER REFERENCES completed_jobs(id),
    current_location_id INTEGER REFERENCES current_locations(id),
    user_id INTEGER REFERENCES users(id),
    count_equipment INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заполнение справочных таблиц из существующих данных
INSERT INTO trains (number)
SELECT DISTINCT "trainNumber" FROM requests
WHERE "trainNumber" IS NOT NULL
ON CONFLICT (number) DO NOTHING;

INSERT INTO type_work (name)
SELECT DISTINCT "typeWork" FROM requests
WHERE "typeWork" IS NOT NULL
ON CONFLICT (name) DO NOTHING;

INSERT INTO completed_jobs (name)
SELECT DISTINCT "completedJob" FROM requests
WHERE "completedJob" IS NOT NULL
ON CONFLICT (name) DO NOTHING;

INSERT INTO current_locations (name)
SELECT DISTINCT "currentLocation" FROM requests
WHERE "currentLocation" IS NOT NULL
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (login, password, role, name)
SELECT DISTINCT 
    COALESCE("userName", 'unknown_' || "userId"::text),
    'temp_password', -- Временный пароль, нужно будет обновить
    COALESCE("userRole", 'user'),
    COALESCE("userName", 'Unknown User')
FROM requests
WHERE "userId" IS NOT NULL
ON CONFLICT (login) DO NOTHING;

-- Создание записей вагонов
INSERT INTO carriages (number, type, train_id)
SELECT DISTINCT 
    r."carriageNumber",
    r."carriageType",
    t.id
FROM requests r
JOIN trains t ON t.number = r."trainNumber"
WHERE r."carriageNumber" IS NOT NULL
ON CONFLICT (number, train_id) DO NOTHING;

-- Создание записей оборудования
INSERT INTO equipment (type, serial_number, mac_address, status, carriage_id)
SELECT DISTINCT
    r."equipmentType",
    r."serialNumber",
    r."macAddress",
    'active', -- Статус по умолчанию
    c.id
FROM requests r
JOIN trains t ON t.number = r."trainNumber"
JOIN carriages c ON c.number = r."carriageNumber" AND c.train_id = t.id
WHERE r."equipmentType" IS NOT NULL;

-- Перенос фотографий в новую структуру
INSERT INTO equipment_photos (equipment_id, photo_type, photo_path)
SELECT 
    e.id,
    'carriage',
    r."carriagePhoto"
FROM requests r
JOIN trains t ON t.number = r."trainNumber"
JOIN carriages c ON c.number = r."carriageNumber" AND c.train_id = t.id
JOIN equipment e ON e.carriage_id = c.id AND e.type = r."equipmentType"
WHERE r."carriagePhoto" IS NOT NULL;

INSERT INTO equipment_photos (equipment_id, photo_type, photo_path)
SELECT 
    e.id,
    'equipment',
    r."equipmentPhoto"
FROM requests r
JOIN trains t ON t.number = r."trainNumber"
JOIN carriages c ON c.number = r."carriageNumber" AND c.train_id = t.id
JOIN equipment e ON e.carriage_id = c.id AND e.type = r."equipmentType"
WHERE r."equipmentPhoto" IS NOT NULL;

-- Аналогично для других типов фотографий...

-- Перенос заявок в новую структуру
INSERT INTO requests_new (
    application_number, application_date, type_work_id, train_id, 
    carriage_id, equipment_id, completed_job_id, current_location_id, 
    user_id, count_equipment, created_at, updated_at
)
SELECT 
    r."applicationNumber",
    r."applicationDate",
    tw.id,
    t.id,
    c.id,
    e.id,
    cj.id,
    cl.id,
    u.id,
    r."countEquipment",
    r."createdAt",
    r."updatedAt"
FROM requests r
JOIN type_work tw ON tw.name = r."typeWork"
JOIN trains t ON t.number = r."trainNumber"
JOIN carriages c ON c.number = r."carriageNumber" AND c.train_id = t.id
JOIN equipment e ON e.carriage_id = c.id AND e.type = r."equipmentType"
JOIN completed_jobs cj ON cj.name = r."completedJob"
JOIN current_locations cl ON cl.name = r."currentLocation"
JOIN users u ON u.login = r."userName";

COMMIT;

-- После успешной миграции можно будет:
-- 1. Переименовать requests в requests_old
-- 2. Переименовать requests_new в requests
-- 3. Удалить старые таблицы после проверки