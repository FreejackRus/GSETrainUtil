import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads');
    
    // Создаем папку uploads если её нет
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Разрешаем только изображения
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только файлы изображений'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB максимум
  }
});

// Контроллер для загрузки файлов
export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Файлы не были загружены'
      });
    }

    // Формируем объект с путями к загруженным файлам
    const filePaths: { [key: string]: string } = {};
    
    Object.keys(files).forEach(fieldName => {
      if (files[fieldName] && files[fieldName][0]) {
        // Возвращаем относительный путь для сохранения в БД
        filePaths[fieldName] = `/uploads/${files[fieldName][0].filename}`;
      }
    });

    res.status(200).json({
      success: true,
      message: 'Файлы успешно загружены',
      data: filePaths
    });

  } catch (error) {
    console.error('Ошибка при загрузке файлов:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при загрузке файлов'
    });
  }
};

// Контроллер для получения файла
export const getFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../../uploads', filename);

    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Файл не найден'
      });
    }

    // Отправляем файл
    res.sendFile(filePath);

  } catch (error) {
    console.error('Ошибка при получении файла:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при получении файла'
    });
  }
};