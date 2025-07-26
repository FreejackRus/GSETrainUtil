import multer from 'multer';
import path from 'path';
import fs from 'fs';

export interface FileStorageParams {
  applicationNumber: string;
  date: string;
  trainNumber: string;
  carriageNumber: string;
  equipmentName: string;
  photoType: 'carriage' | 'equipment' | 'serial' | 'mac' | 'general' | 'final';
}

/**
 * Создает структуру папок для хранения изображений
 * Формат: номер заявки - дата - номер поезда - номер вагона - наименование оборудования - папка с наименованием, к чему фото относится - фото
 */
export const createDirectoryStructure = (params: FileStorageParams): string => {
  const { applicationNumber, date, trainNumber, carriageNumber, equipmentName, photoType } = params;
  
  // Очищаем имена от недопустимых символов для файловой системы
  const sanitize = (str: string) => str.replace(/[<>:"/\\|?*]/g, '_');
  
  const basePath = path.join(
    process.cwd(),
    'uploads',
    sanitize(applicationNumber),
    sanitize(date),
    sanitize(trainNumber),
    sanitize(carriageNumber),
    sanitize(equipmentName)
  );
  
  let photoTypeFolder: string;
  switch (photoType) {
    case 'carriage':
      photoTypeFolder = 'вагон';
      break;
    case 'equipment':
      photoTypeFolder = 'оборудование';
      break;
    case 'serial':
      photoTypeFolder = 'серийный_номер';
      break;
    case 'mac':
      photoTypeFolder = 'mac_адрес';
      break;
    case 'general':
      photoTypeFolder = path.join('оборудование', 'общее_фото');
      break;
    case 'final':
      photoTypeFolder = 'финальное_фото';
      break;
    default:
      photoTypeFolder = 'прочее';
  }
  
  const fullPath = path.join(basePath, photoTypeFolder);
  
  // Создаем директории если они не существуют
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  
  return fullPath;
};

/**
 * Генерирует имя файла с временной меткой
 */
export const generateFileName = (originalName: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${name}_${timestamp}${ext}`;
};

/**
 * Создает конфигурацию multer для загрузки файлов
 */
export const createMulterConfig = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Параметры будут переданы через req.body
      const params: FileStorageParams = {
        applicationNumber: req.body.applicationNumber || 'unknown',
        date: req.body.date || new Date().toISOString().split('T')[0],
        trainNumber: req.body.trainNumber || 'unknown',
        carriageNumber: req.body.carriageNumber || 'unknown',
        equipmentName: req.body.equipmentName || 'unknown',
        photoType: req.body.photoType || 'general'
      };
      
      const uploadPath = createDirectoryStructure(params);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileName = generateFileName(file.originalname);
      cb(null, fileName);
    }
  });

  return multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      // Проверяем, что это изображение
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Только изображения разрешены!'));
      }
    }
  });
};

/**
 * Получает относительный путь к файлу для сохранения в БД
 */
export const getRelativeFilePath = (fullPath: string): string => {
  const uploadsIndex = fullPath.indexOf('uploads');
  if (uploadsIndex !== -1) {
    return fullPath.substring(uploadsIndex).replace(/\\/g, '/');
  }
  return fullPath.replace(/\\/g, '/');
};

/**
 * Создает URL для доступа к файлу
 */
export const createFileUrl = (relativePath: string, baseUrl: string = 'http://localhost:3000'): string => {
  return `${baseUrl}/${relativePath}`;
};