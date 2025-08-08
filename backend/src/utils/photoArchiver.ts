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
  async archiveApplicationPhotos(
      applicationId: number,
      outputPath?: string
  ): Promise<string> {
    // Загружаем данные заявки вместе с фотками
    const application = await this.prisma.request.findUnique({
      where: { id: applicationId },
      include: {
        requestCarriages: {
          select: {
            carriagePhoto: true,
            carriage: { select: { number: true } }
          }
        },
        requestEquipments: {
          include: {
            equipment: { select: { id: true, serialNumber: true } },
            photos: true
          }
        }
      }
    });
    if (!application) {
      throw new Error(`Заявка с ID ${applicationId} не найдена`);
    }

    // Формируем русский имя архива
    const archiveName = `заявка_${applicationId}_фотографии.zip`;
    const archivePath = outputPath
        ? outputPath
        : path.join(process.cwd(), 'archives', archiveName);
    fs.mkdirSync(path.dirname(archivePath), { recursive: true });

    // Создаем поток для архивации
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise<string>((resolve, reject) => {
      output.on('close', () => resolve(archivePath));
      archive.on('error', err => reject(err));
      archive.pipe(output);

      // Директории внутри архива
      const appDir = 'Заявка';
      const carrDir = 'Вагоны';
      const eqDir = 'Оборудование';

      // 1) Основное фото заявки
      if (application.photo) {
        const src = path.isAbsolute(application.photo)
            ? application.photo
            : path.join(this.uploadsPath, application.photo);
        if (fs.existsSync(src)) {
          const ext = path.extname(src);
          const fileName = `заявка_${applicationId}${ext}`;
          archive.file(src, { name: path.posix.join(appDir, fileName) });
        }
      }

      // 2) Фото вагонов
      for (const rc of application.requestCarriages) {
        if (!rc.carriagePhoto) continue;
        const src = path.isAbsolute(rc.carriagePhoto)
            ? rc.carriagePhoto
            : path.join(this.uploadsPath, rc.carriagePhoto);
        if (fs.existsSync(src)) {
          const wagonNum = rc.carriage.number;
          const ext = path.extname(src);
          const fileName = `вагон_${wagonNum}${ext}`;
          archive.file(src, { name: path.posix.join(carrDir, fileName) });
        }
      }

      // 3) Фото оборудования
      for (const reqEq of application.requestEquipments) {
        const eq = reqEq.equipment;
        const eqId = eq.id;
        const serial = eq.serialNumber || '';
        for (const photo of reqEq.photos) {
          const src = path.isAbsolute(photo.photoPath)
              ? photo.photoPath
              : path.join(this.uploadsPath, photo.photoPath);
          if (!fs.existsSync(src)) continue;
          const ext = path.extname(src);
          // Определяем тип на русском
          const typeKey = photo.photoType.toLowerCase();
          let rusType = 'общая';
          if (typeKey.includes('serial')) rusType = 'серийный_номер';
          else if (typeKey.includes('mac')) rusType = 'mac_адрес';
          const fileName = `оборудование_${eqId}_${serial}_${rusType}${ext}`;
          archive.file(src, { name: path.posix.join(eqDir, fileName) });
        }
      }

      archive.finalize();
    }).finally(async () => {
      await this.prisma.$disconnect();
    });
  }

  /**
   * Создает архив фотографий за период
   */
  async archivePhotosByDateRange(
      dateFrom: string,
      dateTo: string,
      outputPath?: string
  ): Promise<string> {
    const apps = await this.prisma.request.findMany({
      where: { createdAt: { gte: new Date(dateFrom), lte: new Date(dateTo) } },
      include: {
        requestCarriages: { select: { carriagePhoto: true, carriage: { select: { number: true } } } },
        requestEquipments: { include: { equipment: { select: { id: true, serialNumber: true } }, photos: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    if (apps.length === 0) throw new Error(`Заявки за период ${dateFrom} - ${dateTo} не найдены`);

    const rusName = `заявки_${dateFrom}_по_${dateTo}_фотографии.zip`;
    const archivePath = outputPath || path.join(process.cwd(), 'archives', rusName);
    fs.mkdirSync(path.dirname(archivePath), { recursive: true });

    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);

    const baseDir = 'Заявки';
    for (const app of apps) {
      const appDir = path.posix.join(baseDir, `заявка_${app.id}`);

      // основное
      if (app.photo) {
        const src = path.isAbsolute(app.photo) ? app.photo : path.join(this.uploadsPath, app.photo);
        if (fs.existsSync(src)) {
          const ext = path.extname(src);
          archive.file(src, { name: path.posix.join(appDir, `заявка_${app.id}${ext}`) });
        }
      }
      // вагоны
      for (const rc of app.requestCarriages) {
        if (!rc.carriagePhoto) continue;
        const src = path.isAbsolute(rc.carriagePhoto)
            ? rc.carriagePhoto
            : path.join(this.uploadsPath, rc.carriagePhoto);
        if (fs.existsSync(src)) {
          const num = rc.carriage.number;
          const ext = path.extname(src);
          archive.file(src, {
            name: path.posix.join(appDir, 'Вагоны', `вагон_${num}${ext}`)
          });
        }
      }
      // оборудование
      for (const reqEq of app.requestEquipments) {
        const eq = reqEq.equipment;
        const serial = eq.serialNumber || '';
        for (const photo of reqEq.photos) {
          const src = path.isAbsolute(photo.photoPath)
              ? photo.photoPath
              : path.join(this.uploadsPath, photo.photoPath);
          if (!fs.existsSync(src)) continue;
          const ext = path.extname(src);
          const key = photo.photoType.toLowerCase();
          const rusType = key.includes('serial')
              ? 'серийный_номер'
              : key.includes('mac')
                  ? 'mac_адрес'
                  : 'общая';
          archive.file(src, {
            name: path.posix.join(
                appDir,
                'Оборудование',
                `оборудование_${eq.id}_${serial}_${rusType}${ext}`
            )
          });
        }
      }
    }

    await archive.finalize();
    await new Promise<void>((resolve) => output.on('close', () => resolve()));
    await this.prisma.$disconnect();
    return archivePath;
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
