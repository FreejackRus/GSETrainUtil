# 🚂 GSE Train Utility

Система управления заявками на обслуживание железнодорожного оборудования GSE (Ground Support Equipment).

## 📋 Описание

GSE Train Utility - это полнофункциональное веб-приложение для управления заявками на техническое обслуживание и ремонт оборудования железнодорожного транспорта. Система обеспечивает полный жизненный цикл заявок от создания до завершения работ с детальным документированием процесса.

### ✨ Основные возможности

- 🔐 **Аутентификация и авторизация** - система ролей (администратор, инженер)
- 📝 **Управление заявками** - создание, редактирование, отслеживание статуса
- 💾 **Черновики заявок** - сохранение незавершенных заявок
- 📊 **Отчетность** - журнал выполненных работ и статистика
- 🚂 **Управление поездами и вагонами** - учет подвижного состава
- 🔧 **Управление оборудованием** - каталог и статус оборудования
- 📱 **Адаптивный интерфейс** - работа на различных устройствах
- 📸 **Загрузка фотографий** - документирование состояния оборудования
- 📁 **Управление файлами** - загрузка и получение файлов
- 📄 **Генерация PDF отчетов** - автоматическое создание документации
- 📋 **Импорт данных из Excel** - массовая загрузка справочной информации

## 🏗️ Архитектура системы

Проект построен по принципам **Feature-Sliced Design** и включает:

### Frontend (React + TypeScript + Vite)
- **React 19** с TypeScript для типобезопасности
- **Material-UI v7** для современного пользовательского интерфейса
- **Vite 7** для быстрой разработки и сборки
- **Axios** для HTTP-запросов к API
- **React Router v7** для навигации
- **Emotion** для стилизации компонентов

### Backend (Node.js + Express + Prisma)
- **Express.js 5** для создания REST API
- **Prisma ORM 6.12** для работы с базой данных PostgreSQL
- **JWT** для аутентификации пользователей
- **bcrypt** для безопасного хеширования паролей
- **CORS** для кросс-доменных запросов
- **Multer** для загрузки файлов
- **jsPDF** для генерации PDF документов
- **XLSX** для работы с Excel файлами

### База данных (PostgreSQL)
Нормализованная структура включает:
- **Пользователи и роли** - система авторизации
- **Заявки** - основная бизнес-логика
- **Оборудование** - каталог с фотографиями
- **Поезда и вагоны** - подвижной состав
- **Справочники** - типы работ, локации, статусы
- **Фотографии** - документирование состояния

## 🚀 Полный цикл развертывания

### 📋 Предварительные требования

#### Системные требования
- **Node.js** версия 18.0.0 или выше
- **PostgreSQL** версия 12.0 или выше
- **Git** для клонирования репозитория
- **Yarn** или **npm** для управления пакетами

#### Проверка установленных версий
```bash
node --version    # должно быть >= 18.0.0
npm --version     # или yarn --version
psql --version    # должно быть >= 12.0
git --version
```

### 🗂️ Шаг 1: Клонирование и подготовка проекта

```bash
# Клонирование репозитория
git clone <repository-url>
cd GSETrainUtil

# Установка зависимостей корневого проекта (если есть)
npm install
```

### 🗄️ Шаг 2: Настройка базы данных PostgreSQL

#### Создание базы данных
```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE gse_train_util;

# Создание пользователя (опционально)
CREATE USER gse_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gse_train_util TO gse_user;

# Выход из psql
\q
```

#### Альтернативный способ через pgAdmin
1. Откройте pgAdmin
2. Создайте новую базу данных `gse_train_util`
3. Настройте права доступа

### ⚙️ Шаг 3: Настройка Backend

#### Переход в директорию backend
```bash
cd backend
```

#### Установка зависимостей
```bash
# Используя yarn (рекомендуется)
yarn install

# Или используя npm
npm install
```

#### Настройка переменных окружения
Создайте файл `.env` в папке `backend`:
```env
# База данных
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/gse_train_util?schema=public"

# Безопасность
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# Сервер
PORT=3000
NODE_ENV=development

# Загрузка файлов
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB в байтах
```

#### Инициализация Prisma и базы данных
```bash
# Генерация Prisma Client
npx prisma generate

# Применение миграций (создание таблиц)
npx prisma migrate dev --name init

# Заполнение базы данных начальными данными
npm run seed
```

#### Проверка подключения к базе данных
```bash
# Открытие Prisma Studio для просмотра данных
npx prisma studio
```
Откроется браузер с интерфейсом для просмотра данных по адресу `http://localhost:5555`

#### Запуск backend сервера
```bash
# Запуск в режиме разработки
npm run dev

# Или используя yarn
yarn dev
```

Сервер запустится по адресу: `http://localhost:3000`

### 🎨 Шаг 4: Настройка Frontend

#### Переход в директорию frontend
```bash
cd ../frontend
```

#### Установка зависимостей
```bash
# Используя yarn (рекомендуется)
yarn install

# Или используя npm
npm install
```

#### Настройка переменных окружения (опционально)
Создайте файл `.env` в папке `frontend`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=GSE Train Utility
```

#### Запуск frontend приложения
```bash
# Запуск dev сервера
npm run dev

# Или используя yarn
yarn dev
```

Приложение будет доступно по адресу: `http://localhost:5173`

### 🔧 Шаг 5: Проверка работоспособности

#### Проверка backend
1. Откройте `http://localhost:3000/api/health` (если есть health check)
2. Проверьте логи сервера на наличие ошибок
3. Убедитесь, что Prisma Studio работает

#### Проверка frontend
1. Откройте `http://localhost:5173`
2. Проверьте консоль браузера на наличие ошибок
3. Попробуйте выполнить базовые операции

#### Проверка интеграции
1. Попробуйте войти в систему
2. Создайте тестовую заявку
3. Загрузите фотографию
4. Проверьте сохранение данных в базе

### 📦 Шаг 6: Production развертывание

#### Сборка frontend
```bash
cd frontend
npm run build
```

#### Настройка production backend
```bash
cd backend

# Установка только production зависимостей
npm ci --only=production

# Генерация Prisma Client для production
npx prisma generate

# Применение миграций
npx prisma migrate deploy
```

#### Настройка веб-сервера (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend статические файлы
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API проксирование
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы (загрузки)
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

## 📁 Структура проекта

```
GSETrainUtil/
├── backend/                    # Backend приложение (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controlers/         # Контроллеры API
│   │   ├── middleware/         # Middleware функции (аутентификация, CORS)
│   │   ├── router/            # Основные маршруты
│   │   ├── routes/            # Специфичные маршруты API
│   │   ├── types/             # TypeScript типы и интерфейсы
│   │   ├── utils/             # Утилиты (импорт Excel, генерация PDF)
│   │   ├── pdfFiles/          # Шаблоны PDF документов
│   │   ├── pdfGenerate/       # Генераторы PDF отчетов
│   │   └── server.ts          # Главный файл сервера
│   ├── prisma/
│   │   ├── migrations/        # Миграции базы данных
│   │   ├── schema.prisma      # Схема базы данных Prisma
│   │   └── seed.ts            # Скрипт заполнения начальными данными
│   ├── uploads/               # Директория для загруженных файлов
│   │   ├── equipment/         # Фотографии оборудования
│   │   └── unknown/           # Временные загрузки
│   ├── generated/             # Автогенерированные файлы Prisma
│   └── package.json
├── frontend/                   # Frontend приложение (React + TypeScript + Vite)
│   ├── src/
│   │   ├── app/               # Основная логика приложения
│   │   │   ├── providers/     # Провайдеры контекста
│   │   │   └── store/         # Управление состоянием
│   │   ├── pages/             # Страницы приложения
│   │   │   ├── LoginPage/     # Страница входа
│   │   │   ├── ApplicationsPage/ # Страница заявок
│   │   │   └── ReportsPage/   # Страница отчетов
│   │   ├── widgets/           # Виджеты (крупные компоненты)
│   │   ├── features/          # Функциональные модули
│   │   │   ├── auth/          # Аутентификация
│   │   │   ├── applications/  # Управление заявками
│   │   │   └── reports/       # Отчетность
│   │   ├── entities/          # Бизнес-сущности
│   │   │   ├── user/          # Пользователи
│   │   │   ├── application/   # Заявки
│   │   │   └── equipment/     # Оборудование
│   │   ├── shared/            # Общие компоненты и утилиты
│   │   │   ├── ui/            # UI компоненты
│   │   │   ├── api/           # API клиенты
│   │   │   ├── lib/           # Библиотеки и утилиты
│   │   │   └── config/        # Конфигурация
│   │   └── main.tsx           # Точка входа
│   ├── public/                # Статические файлы
│   │   ├── images/            # Изображения
│   │   └── favicon.ico        # Иконка сайта
│   └── package.json
├── .idea/                     # Настройки IDE
├── LICENSE                    # Лицензия
├── LOGGING_GUIDE.md          # Руководство по логированию
└── README.md                 # Документация проекта
```

## 🔧 Доступные команды

### Backend команды
```bash
# Разработка
npm run dev                    # Запуск в режиме разработки с ts-node
npm run seed                   # Заполнение БД начальными данными
npm run import-excel           # Импорт данных из Excel файлов

# Production
npm run build                  # Сборка TypeScript в JavaScript
npm start                      # Запуск production версии

# База данных
npx prisma studio              # Открыть Prisma Studio (GUI для БД)
npx prisma migrate dev         # Создать и применить новую миграцию
npx prisma migrate deploy      # Применить миграции в production
npx prisma migrate reset       # Сброс БД и повторное применение миграций
npx prisma generate           # Генерация Prisma Client
npx prisma db push            # Синхронизация схемы с БД (без миграций)
npx prisma db seed            # Запуск seed скрипта
```

### Frontend команды
```bash
# Разработка
npm run dev                    # Запуск dev сервера Vite
npm run build                  # Сборка для production
npm run preview               # Предварительный просмотр production сборки
npm run lint                  # Проверка кода ESLint

# Дополнительные
npm run type-check            # Проверка типов TypeScript
npm run format                # Форматирование кода Prettier
```

### Полезные команды для разработки
```bash
# Одновременный запуск frontend и backend
npm run dev:all               # (если настроено в корневом package.json)

# Проверка всего проекта
npm run lint:all              # Линтинг всего кода
npm run test:all              # Запуск всех тестов
npm run build:all             # Сборка всего проекта
```

## 🛠️ Технологический стек

### Frontend
- **React 19** - UI библиотека
- **TypeScript** - типизированный JavaScript
- **Vite** - инструмент сборки
- **Material-UI** - компоненты интерфейса
- **Axios** - HTTP клиент
- **React Router** - маршрутизация

### Backend
- **Node.js** - серверная платформа
- **Express.js** - веб-фреймворк
- **TypeScript** - типизированный JavaScript
- **Prisma** - ORM для работы с БД
- **PostgreSQL** - реляционная база данных
- **JWT** - аутентификация
- **bcrypt** - хеширование паролей

## 🔐 Безопасность

- Пароли хешируются с использованием bcrypt
- JWT токены для аутентификации
- CORS настроен для безопасных кросс-доменных запросов
- Валидация данных на уровне API

## 🔧 Устранение неполадок

### Проблемы с базой данных
```bash
# Если Prisma Client не синхронизирован
npx prisma generate

# Если схема не соответствует БД
npx prisma db push

# Если нужно пересоздать БД
npx prisma migrate reset
npx prisma db seed
```

### Проблемы с зависимостями
```bash
# Очистка кэша npm
npm cache clean --force

# Переустановка зависимостей
rm -rf node_modules package-lock.json
npm install

# Для frontend
cd frontend && rm -rf node_modules package-lock.json && npm install

# Для backend
cd backend && rm -rf node_modules package-lock.json && npm install
```

### Проблемы с портами
```bash
# Проверка занятых портов
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Завершение процесса по PID
taskkill /PID <PID> /F
```

## 🔐 Безопасность

### Переменные окружения
Убедитесь, что все чувствительные данные хранятся в `.env` файлах:

```env
# Backend .env
DATABASE_URL="postgresql://username:password@localhost:5432/gse_train_util"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=production

# Frontend .env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME="GSE Train Utility"
```

### Рекомендации по безопасности
- Используйте сильные пароли для БД
- Регулярно обновляйте зависимости
- Настройте HTTPS для production
- Используйте rate limiting для API
- Настройте CORS правильно

## 📊 Мониторинг и логирование

### Логи приложения
```bash
# Просмотр логов backend
tail -f backend/logs/app.log

# Просмотр логов Nginx (если используется)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Мониторинг производительности
- Используйте PM2 для мониторинга Node.js процессов
- Настройте мониторинг БД PostgreSQL
- Используйте инструменты как Grafana + Prometheus

## 🚀 CI/CD

### GitHub Actions пример
```yaml
name: Deploy GSE Train Utility

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend && npm install
        cd ../frontend && npm install
        
    - name: Run tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
        
    - name: Build
      run: |
        cd frontend && npm run build
        cd ../backend && npm run build
        
    - name: Deploy
      run: |
        # Ваши команды деплоя
```

## 📚 API Документация

### Аутентификация

#### POST /api/auth/login
Вход в систему

**Тело запроса:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Ответ:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "number",
    "username": "string",
    "role": "string"
  }
}
```

#### POST /api/auth/logout
Выход из системы

**Заголовки:**
```
Authorization: Bearer <jwt_token>
```

### Заявки (Requests)

#### GET /api/requests
Получение списка заявок

**Параметры запроса:**
- `page` (optional): номер страницы
- `limit` (optional): количество элементов на странице
- `status` (optional): фильтр по статусу

#### POST /api/requests
Создание новой заявки

**Тело запроса:**
```json
{
  "trainNumber": "string",
  "carriageNumber": "string",
  "equipmentIds": ["number"],
  "description": "string"
}
```

#### PUT /api/requests/:id
Обновление заявки

#### DELETE /api/requests/:id
Удаление заявки

### Оборудование (Equipment)

#### GET /api/equipment
Получение списка оборудования

#### POST /api/equipment
Добавление нового оборудования

#### POST /api/equipment/:id/photos
Загрузка фотографий оборудования

### Отчеты (Reports)

#### GET /api/reports/pdf/:requestId
Генерация PDF отчета по заявке

#### GET /api/reports/excel
Экспорт данных в Excel

## 🤝 Участие в разработке

### Процесс разработки
1. Форкните репозиторий
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Стандарты кода
- Используйте TypeScript для типизации
- Следуйте ESLint правилам
- Пишите тесты для новой функциональности
- Документируйте API изменения

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [Issues](https://github.com/your-repo/GSETrainUtil/issues)
2. Создайте новый Issue с подробным описанием
3. Обратитесь к команде разработки

## 📈 Версионирование

Мы используем [SemVer](http://semver.org/) для версионирования. Доступные версии см. в [tags](https://github.com/your-repo/GSETrainUtil/tags).


---

**Версия:** 1.0.0  
**Последнее обновление:** Август 2025