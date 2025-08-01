import { Request, Response } from 'express';
import { PhotoArchiver } from '../../utils/photoArchiver';
import path from 'path';
import fs from 'fs';

/**
 * Архивирует фотографии конкретной заявки
 */
export const archiveApplicationPhotos = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    
    if (!applicationId || isNaN(parseInt(applicationId))) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный ID заявки'
      });
    }

    const archiver = new PhotoArchiver();
    const archivePath = await archiver.archiveApplicationPhotos(parseInt(applicationId));
    
    // Отправляем архив как файл для скачивания
    const fileName = path.basename(archivePath);
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/zip');
    
    const fileStream = fs.createReadStream(archivePath);
    fileStream.pipe(res);
    
    // Удаляем временный архив после отправки
    fileStream.on('end', () => {
      fs.unlinkSync(archivePath);
    });

  } catch (error) {
    console.error('Ошибка при архивировании фотографий заявки:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    });
  }
};

/**
 * Архивирует фотографии за период
 */
export const archivePhotosByDateRange = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать dateFrom и dateTo'
      });
    }

    // Проверяем корректность дат
    const fromDate = new Date(dateFrom as string);
    const toDate = new Date(dateTo as string);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный формат даты. Используйте YYYY-MM-DD'
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: 'Дата начала не может быть больше даты окончания'
      });
    }

    const archiver = new PhotoArchiver();
    const archivePath = await archiver.archivePhotosByDateRange(
      dateFrom as string, 
      dateTo as string
    );
    
    // Отправляем архив как файл для скачивания
    const fileName = path.basename(archivePath);
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/zip');
    
    const fileStream = fs.createReadStream(archivePath);
    fileStream.pipe(res);
    
    // Удаляем временный архив после отправки
    fileStream.on('end', () => {
      fs.unlinkSync(archivePath);
    });

  } catch (error) {
    console.error('Ошибка при архивировании фотографий за период:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    });
  }
};

/**
 * Получает информацию о размере хранилища фотографий
 */
export const getStorageInfo = async (req: Request, res: Response) => {
  try {
    const uploadsPath = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(uploadsPath)) {
      return res.status(200).json({
        success: true,
        data: {
          totalSize: 0,
          totalFiles: 0,
          folders: 0,
          sizeFormatted: '0 B'
        }
      });
    }

    const stats = getFolderStats(uploadsPath);
    
    res.status(200).json({
      success: true,
      data: {
        totalSize: stats.size,
        totalFiles: stats.files,
        folders: stats.folders,
        sizeFormatted: formatBytes(stats.size)
      }
    });

  } catch (error) {
    console.error('Ошибка при получении информации о хранилище:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

/**
 * Очищает старые фотографии
 */
export const cleanupOldPhotos = async (req: Request, res: Response) => {
  try {
    const { daysOld } = req.query;
    const days = daysOld ? parseInt(daysOld as string) : 365;
    
    if (isNaN(days) || days < 1) {
      return res.status(400).json({
        success: false,
        message: 'Некорректное количество дней'
      });
    }

    const archiver = new PhotoArchiver();
    const result = await archiver.cleanupOldPhotos(days);
    
    res.status(200).json({
      success: true,
      message: `Очистка завершена. Удалено ${result.deletedFiles} файлов, освобождено ${formatBytes(result.freedSpace)}`,
      data: {
        deletedFiles: result.deletedFiles,
        freedSpace: result.freedSpace,
        freedSpaceFormatted: formatBytes(result.freedSpace)
      }
    });

  } catch (error) {
    console.error('Ошибка при очистке старых фотографий:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    });
  }
};



/**
 * Получает статистику по папкам
 */
function getFolderStats(folderPath: string): { size: number; files: number; folders: number } {
  let totalSize = 0;
  let totalFiles = 0;
  let totalFolders = 0;

  const items = fs.readdirSync(folderPath);
  
  for (const item of items) {
    const itemPath = path.join(folderPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      totalFolders++;
      const subStats = getFolderStats(itemPath);
      totalSize += subStats.size;
      totalFiles += subStats.files;
      totalFolders += subStats.folders;
    } else {
      totalSize += stats.size;
      totalFiles++;
    }
  }

  return { size: totalSize, files: totalFiles, folders: totalFolders };
}

/**
 * Форматирует размер в байтах в читаемый формат
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}