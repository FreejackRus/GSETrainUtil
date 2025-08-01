# API Архивирования Фотографий

## Обзор

API для архивирования и управления фотографиями в системе GSE Train Util. Все эндпоинты доступны по базовому пути `/api/v1/archive`.

## Эндпоинты

### 1. Архивирование фотографий заявки

**GET** `/api/v1/archive/application/:applicationId`

Создает ZIP-архив всех фотографий для конкретной заявки.

**Параметры:**
- `applicationId` (path) - ID заявки

**Ответ:**
- Возвращает ZIP-файл для скачивания
- Имя файла: `application_{номер_заявки}_{дата}.zip`

**Пример:**
```
GET /api/v1/archive/application/123
```

### 2. Архивирование фотографий за период

**GET** `/api/v1/archive/date-range`

Создает ZIP-архив всех фотографий за указанный период.

**Query параметры:**
- `dateFrom` (string) - Дата начала в формате YYYY-MM-DD
- `dateTo` (string) - Дата окончания в формате YYYY-MM-DD

**Ответ:**
- Возвращает ZIP-файл для скачивания
- Имя файла: `applications_{dateFrom}_to_{dateTo}.zip`

**Пример:**
```
GET /api/v1/archive/date-range?dateFrom=2024-01-01&dateTo=2024-01-31
```

### 3. Информация о хранилище

**GET** `/api/v1/archive/storage-info`

Возвращает информацию о размере хранилища фотографий.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "totalSize": 1048576,
    "totalFiles": 150,
    "folders": 25,
    "sizeFormatted": "1.00 MB"
  }
}
```

### 4. Очистка старых фотографий

**DELETE** `/api/v1/archive/cleanup`

Удаляет старые фотографии для освобождения места.

**Query параметры:**
- `daysOld` (number, optional) - Количество дней (по умолчанию 365)

**Ответ:**
```json
{
  "success": true,
  "message": "Очистка завершена. Удалено 50 файлов, освобождено 10.5 MB",
  "data": {
    "deletedFiles": 50,
    "freedSpace": 11010048,
    "freedSpaceFormatted": "10.5 MB"
  }
}
```

**Пример:**
```
DELETE /api/v1/archive/cleanup?daysOld=180
```

## Структура архива

### Архив заявки
```
application_12345_2024-01-15.zip
├── application_info.json          # Информация о заявке
└── photos/                        # Папка с фотографиями
    ├── carriage_photo_xxx.jpg     # Фото вагона
    ├── general_photo_xxx.jpg      # Общее фото
    ├── final_photo_xxx.jpg        # Финальное фото
    └── equipment/                 # Фото оборудования
        ├── before/
        └── after/
```

### Архив за период
```
applications_2024-01-01_to_2024-01-31.zip
├── summary_info.json              # Сводная информация
├── application_12345/             # Папка заявки 1
│   ├── application_info.json
│   └── photos/
├── application_12346/             # Папка заявки 2
│   ├── application_info.json
│   └── photos/
└── ...
```

## Структура хранения фотографий

Фотографии хранятся в следующей структуре:

```
uploads/
└── {applicationNumber}/
    └── {date}/
        └── {trainNumber}/
            └── {carriageNumber}/
                └── {equipmentName}/
                    ├── before/
                    │   ├── photo1.jpg
                    │   └── photo2.jpg
                    └── after/
                        ├── photo1.jpg
                        └── photo2.jpg
```

## Ошибки

### 400 Bad Request
- Некорректный ID заявки
- Некорректный формат даты
- Дата начала больше даты окончания

### 404 Not Found
- Заявка не найдена
- Фотографии за период не найдены

### 500 Internal Server Error
- Ошибка создания архива
- Ошибка файловой системы
- Ошибка базы данных

## Примеры использования

### JavaScript/TypeScript
```javascript
// Скачать архив заявки
const downloadApplicationArchive = async (applicationId) => {
  const response = await fetch(`/api/v1/archive/application/${applicationId}`);
  const blob = await response.blob();
  
  // Создаем ссылку для скачивания
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `application_${applicationId}_archive.zip`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Получить информацию о хранилище
const getStorageInfo = async () => {
  const response = await fetch('/api/v1/archive/storage-info');
  const data = await response.json();
  console.log(`Размер хранилища: ${data.data.sizeFormatted}`);
};
```

### cURL
```bash
# Скачать архив заявки
curl -O -J "http://localhost:3000/api/v1/archive/application/123"

# Скачать архив за период
curl -O -J "http://localhost:3000/api/v1/archive/date-range?dateFrom=2024-01-01&dateTo=2024-01-31"

# Получить информацию о хранилище
curl "http://localhost:3000/api/v1/archive/storage-info"

# Очистить старые фотографии
curl -X DELETE "http://localhost:3000/api/v1/archive/cleanup?daysOld=180"
```