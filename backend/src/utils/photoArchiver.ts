import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { PrismaClient } from '@prisma/client';

export interface ArchiveOptions {
  applicationId?: number;
  applicationNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  trainNumber?: string;
  carriageNumber?: string;
  outputPath?: string;
}

/**
 * Архивирует фотографии по заданным критериям
 */
export class PhotoArchiver {
  private prisma: PrismaClient;
  private uploadsPath: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.uploadsPath = path.join(process.cwd(), 'uploads');
  }

  /**
   * Создает архив фотографий для конкретной заявки
   */
  async archiveApplicationPhotos(applicationId: number, outputPath?: string): Promise<string> {
    try {
      // Получаем данные заявки
      const application = await this.prisma.request.findUnique({
        where: { id: applicationId },
        include: {
          train: true,
          carriage: true,
          typeWork: true,
          currentLocation: true,
          user: true
        }
      });

      if (!application) {
        throw new Error(`Заявка с ID ${applicationId} не найдена`);
      }

      const archiveName = `application_${application.applicationNumber}_${application.applicationDate.toISOString().split('T')[0]}.zip`;
      const archivePath = outputPath || path.join(process.cwd(), 'archives', archiveName);

      // Создаем папку для архивов если не существует
      const archiveDir = path.dirname(archivePath);
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      // Создаем архив
      const output = fs.createWriteStream(archivePath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // максимальное сжатие
      });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`Архив создан: ${archivePath} (${archive.pointer()} байт)`);
          resolve(archivePath);
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);

        // Добавляем информацию о заявке
        const applicationInfo = {
          applicationNumber: application.applicationNumber,
          applicationDate: application.applicationDate,
          status: application.status,
          typeWork: application.typeWork?.name,
          train: application.train?.number,
          carriage: {
            number: application.carriage?.number,
            type: application.carriage?.type
          },
          location: application.currentLocation?.name,
          user: application.user?.name,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt
        };

        archive.append(JSON.stringify(applicationInfo, null, 2), { name: 'application_info.json' });

        // Ищем папку с фотографиями для этой заявки
        const applicationFolder = path.join(this.uploadsPath, application.applicationNumber.toString());
        
        if (fs.existsSync(applicationFolder)) {
          // Добавляем все фотографии из папки заявки
          archive.directory(applicationFolder, `photos`);
        }

        // Добавляем отдельные фотографии из БД если они есть
        if (application.carriagePhoto) {
          const carriagePhotoPath = path.join(process.cwd(), application.carriagePhoto);
          if (fs.existsSync(carriagePhotoPath)) {
            archive.file(carriagePhotoPath, { name: `photos/carriage_photo_${path.basename(application.carriagePhoto)}` });
          }
        }

        if (application.generalPhoto) {
          const generalPhotoPath = path.join(process.cwd(), application.generalPhoto);
          if (fs.existsSync(generalPhotoPath)) {
            archive.file(generalPhotoPath, { name: `photos/general_photo_${path.basename(application.generalPhoto)}` });
          }
        }

        if (application.finalPhoto) {
          const finalPhotoPath = path.join(process.cwd(), application.finalPhoto);
          if (fs.existsSync(finalPhotoPath)) {
            archive.file(finalPhotoPath, { name: `photos/final_photo_${path.basename(application.finalPhoto)}` });
          }
        }

        archive.finalize();
      });

    } catch (error) {
      console.error('Ошибка при создании архива:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Создает архив фотографий за период
   */
  async archivePhotosByDateRange(dateFrom: string, dateTo: string, outputPath?: string): Promise<string> {
    try {
      const applications = await this.prisma.request.findMany({
        where: {
          applicationDate: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo)
          }
        },
        include: {
          train: true,
          carriage: true,
          typeWork: true,
          currentLocation: true,
          user: true
        },
        orderBy: {
          applicationDate: 'asc'
        }
      });

      if (applications.length === 0) {
        throw new Error(`Заявки за период ${dateFrom} - ${dateTo} не найдены`);
      }

      const archiveName = `applications_${dateFrom}_to_${dateTo}.zip`;
      const archivePath = outputPath || path.join(process.cwd(), 'archives', archiveName);

      // Создаем папку для архивов если не существует
      const archiveDir = path.dirname(archivePath);
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      const output = fs.createWriteStream(archivePath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`Архив создан: ${archivePath} (${archive.pointer()} байт)`);
          resolve(archivePath);
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);

        // Добавляем сводную информацию
        const summaryInfo = {
          period: { from: dateFrom, to: dateTo },
          totalApplications: applications.length,
          applications: applications.map(app => ({
            applicationNumber: app.applicationNumber,
            applicationDate: app.applicationDate,
            status: app.status,
            typeWork: app.typeWork?.name,
            train: app.train?.number,
            carriage: {
              number: app.carriage?.number,
              type: app.carriage?.type
            },
            location: app.currentLocation?.name,
            user: app.user?.name
          }))
        };

        archive.append(JSON.stringify(summaryInfo, null, 2), { name: 'summary.json' });

        // Добавляем фотографии для каждой заявки
        applications.forEach(application => {
          const applicationFolder = path.join(this.uploadsPath, application.applicationNumber.toString());
          
          if (fs.existsSync(applicationFolder)) {
            archive.directory(applicationFolder, `application_${application.applicationNumber}/photos`);
          }

          // Добавляем отдельные фотографии из БД
          if (application.carriagePhoto) {
            const carriagePhotoPath = path.join(process.cwd(), application.carriagePhoto);
            if (fs.existsSync(carriagePhotoPath)) {
              archive.file(carriagePhotoPath, { 
                name: `application_${application.applicationNumber}/carriage_photo_${path.basename(application.carriagePhoto)}` 
              });
            }
          }

          if (application.generalPhoto) {
            const generalPhotoPath = path.join(process.cwd(), application.generalPhoto);
            if (fs.existsSync(generalPhotoPath)) {
              archive.file(generalPhotoPath, { 
                name: `application_${application.applicationNumber}/general_photo_${path.basename(application.generalPhoto)}` 
              });
            }
          }

          if (application.finalPhoto) {
            const finalPhotoPath = path.join(process.cwd(), application.finalPhoto);
            if (fs.existsSync(finalPhotoPath)) {
              archive.file(finalPhotoPath, { 
                name: `application_${application.applicationNumber}/final_photo_${path.basename(application.finalPhoto)}` 
              });
            }
          }
        });

        archive.finalize();
      });

    } catch (error) {
      console.error('Ошибка при создании архива:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Очищает старые фотографии (старше указанного количества дней)
   */
  async cleanupOldPhotos(daysOld: number = 365): Promise<{ deletedFiles: number; freedSpace: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedFiles = 0;
      let freedSpace = 0;

      const applications = await this.prisma.request.findMany({
        where: {
          applicationDate: {
            lt: cutoffDate
          }
        }
      });

      for (const application of applications) {
        const applicationFolder = path.join(this.uploadsPath, application.applicationNumber.toString());
        
        if (fs.existsSync(applicationFolder)) {
          const stats = this.getFolderSize(applicationFolder);
          freedSpace += stats.size;
          deletedFiles += stats.files;
          
          // Удаляем папку с фотографиями
          fs.rmSync(applicationFolder, { recursive: true, force: true });
          console.log(`Удалена папка: ${applicationFolder}`);
        }
      }

      return { deletedFiles, freedSpace };

    } catch (error) {
      console.error('Ошибка при очистке старых фотографий:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }



  /**
   * Получает размер папки и количество файлов
   */
  private getFolderSize(folderPath: string): { size: number; files: number } {
    let totalSize = 0;
    let totalFiles = 0;

    const items = fs.readdirSync(folderPath);
    
    for (const item of items) {
      const itemPath = path.join(folderPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        const subStats = this.getFolderSize(itemPath);
        totalSize += subStats.size;
        totalFiles += subStats.files;
      } else {
        totalSize += stats.size;
        totalFiles++;
      }
    }

    return { size: totalSize, files: totalFiles };
  }
}