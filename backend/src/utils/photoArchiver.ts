import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { PrismaClient } from '@prisma/client';

export interface ArchiveOptions {
  applicationId?: number;
  dateFrom?: string;
  dateTo?: string;
  outputPath?: string;
}

/**
 * Архивирует фотографии по заданным критериям
 */
export class PhotoArchiver {
  private prisma = new PrismaClient();
  private uploadsPath = path.join(process.cwd(), 'uploads');

  /**
   * Создает архив фотографий для конкретной заявки
   */
  async archiveApplicationPhotos(applicationId: number, outputPath?: string): Promise<string> {
    try {
      // 1) Получаем заявку с новыми связями
      const application = await this.prisma.request.findUnique({
        where: { id: applicationId },
        include: {
          requestTrains: {
            include: { train: true }
          },
          requestCarriages: {
            include: {
              carriage: { include: { train: true } }
            }
          },
          completedJob:    true,
          currentLocation: true,
          user:            true
        }
      });
      if (!application) {
        throw new Error(`Заявка с ID ${applicationId} не найдена`);
      }

      // 2) Готовим имя архива, используем createdAt
      const dateStr = application.createdAt.toISOString().split('T')[0];
      const archiveName = `application_${application.id}_${dateStr}.zip`;
      const archivePath = outputPath
          || path.join(process.cwd(), 'archives', archiveName);
      fs.mkdirSync(path.dirname(archivePath), { recursive: true });

      // 3) Создаем zip-поток
      const output  = fs.createWriteStream(archivePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`Архив создан: ${archivePath} (${archive.pointer()} байт)`);
          resolve(archivePath);
        });
        archive.on('error', err => reject(err));
        archive.pipe(output);

        // 4) Метаданные заявки
        const info = {
          id:               application.id,
          status:           application.status,
          createdAt:        application.createdAt,
          updatedAt:        application.updatedAt,
          trainNumbers:     application.requestTrains.map(rt => rt.train.number),
          carriage: {
            number: application.requestCarriages[0]?.carriage?.number,
            type:   application.requestCarriages[0]?.carriage?.type
          },
          completedJob:     application.completedJob?.name,
          currentLocation:  application.currentLocation?.name,
          user:             application.user?.name
        };
        archive.append(JSON.stringify(info, null, 2), { name: 'application_info.json' });

        // 5) Папка uploads/<applicationId>/
        const appFolder = path.join(this.uploadsPath, String(application.id));
        if (fs.existsSync(appFolder)) {
          archive.directory(appFolder, 'photos');
        }

        // 6) Фото номера вагона
        const carriagePhoto = application.requestCarriages[0]?.carriagePhoto;
        if (carriagePhoto) {
          const p = path.join(process.cwd(), carriagePhoto);
          if (fs.existsSync(p)) {
            archive.file(p, { name: `photos/carriage_photo_${path.basename(p)}` });
          }
        }

        // 7) Единое фото заявления
        if (application.photo) {
          const p = path.join(process.cwd(), application.photo);
          if (fs.existsSync(p)) {
            archive.file(p, { name: `photos/application_photo_${path.basename(p)}` });
          }
        }

        archive.finalize();
      });
    } catch (error) {
      console.error('Ошибка при создании архива заявки:', error);
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
      // 1) Подбираем заявки по createdAt
      const apps = await this.prisma.request.findMany({
        where: {
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo)
          }
        },
        include: {
          requestTrains:    { include: { train: true } },
          requestCarriages: { include: { carriage: { include: { train: true } } } },
          completedJob:     true,
          currentLocation:  true,
          user:             true
        },
        orderBy: { createdAt: 'asc' }
      });
      if (apps.length === 0) {
        throw new Error(`Заявки за период ${dateFrom} - ${dateTo} не найдены`);
      }

      // 2) Подготовка архива
      const archiveName = `applications_${dateFrom}_to_${dateTo}.zip`;
      const archivePath = outputPath
          || path.join(process.cwd(), 'archives', archiveName);
      fs.mkdirSync(path.dirname(archivePath), { recursive: true });

      const output  = fs.createWriteStream(archivePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`Архив создан: ${archivePath} (${archive.pointer()} байт)`);
          resolve(archivePath);
        });
        archive.on('error', err => reject(err));
        archive.pipe(output);

        // 3) Сводная информация
        const summary = {
          period: {
            from: dateFrom,
            to:   dateTo
          },
          totalApplications: apps.length,
          applications: apps.map(app => ({
            id:              app.id,
            status:          app.status,
            createdAt:       app.createdAt,
            updatedAt:       app.updatedAt,
            trainNumbers:    app.requestTrains.map(rt => rt.train.number),
            carriage: {
              number: app.requestCarriages[0]?.carriage?.number,
              type:   app.requestCarriages[0]?.carriage?.type
            },
            completedJob:    app.completedJob?.name,
            currentLocation: app.currentLocation?.name,
            user:            app.user?.name
          }))
        };
        archive.append(JSON.stringify(summary, null, 2), { name: 'summary.json' });

        // 4) Для каждой заявки собираем фото
        for (const app of apps) {
          const prefix = `application_${app.id}/photos`;
          const appFolder = path.join(this.uploadsPath, String(app.id));
          if (fs.existsSync(appFolder)) {
            archive.directory(appFolder, prefix);
          }
          const cp = app.requestCarriages[0]?.carriagePhoto;
          if (cp) {
            const p = path.join(process.cwd(), cp);
            if (fs.existsSync(p)) {
              archive.file(p, { name: `${prefix}/carriage_photo_${path.basename(p)}` });
            }
          }
          if (app.photo) {
            const p = path.join(process.cwd(), app.photo);
            if (fs.existsSync(p)) {
              archive.file(p, { name: `${prefix}/application_photo_${path.basename(p)}` });
            }
          }
        }

        archive.finalize();
      });
    } catch (error) {
      console.error('Ошибка при создании архива по периоду:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Удаляет старые фото (старше daysOld дней)
   */
  async cleanupOldPhotos(daysOld = 365): Promise<{ deletedFiles: number; freedSpace: number }> {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysOld);
      let deletedFiles = 0;
      let freedSpace   = 0;

      const apps = await this.prisma.request.findMany({
        where: { createdAt: { lt: cutoff } }
      });
      for (const app of apps) {
        const folder = path.join(this.uploadsPath, String(app.id));
        if (fs.existsSync(folder)) {
          const { size, files } = this.getFolderSize(folder);
          freedSpace   += size;
          deletedFiles += files;
          fs.rmSync(folder, { recursive: true, force: true });
          console.log(`Удалена папка: ${folder}`);
        }
      }
      return { deletedFiles, freedSpace };
    } catch (error) {
      console.error('Ошибка при очистке фото:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Считает размер папки и число файлов
   */
  private getFolderSize(folderPath: string): { size: number; files: number } {
    let totalSize = 0;
    let totalFiles = 0;
    for (const name of fs.readdirSync(folderPath)) {
      const full = path.join(folderPath, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        const sub = this.getFolderSize(full);
        totalSize  += sub.size;
        totalFiles += sub.files;
      } else {
        totalSize  += stat.size;
        totalFiles += 1;
      }
    }
    return { size: totalSize, files: totalFiles };
  }
}
