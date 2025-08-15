import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import {
  PrismaClient,
  EquipmentPhotoType,
  CarriagePhotoType,
} from '@prisma/client';
import { toAbsUploadPath } from '../config/uploads';

export interface ArchiveOptions {
  applicationId?: number;
  dateFrom?: string;
  dateTo?: string;
  outputPath?: string;
}

/** Корень для архивов: ENV ARCHIVES_DIR или var/archives */
const ARCHIVES_DIR = path.resolve(process.env.ARCHIVES_DIR || 'var/archives');
try { fs.mkdirSync(ARCHIVES_DIR, { recursive: true }); } catch {}

export class PhotoArchiver {
  private prisma = new PrismaClient();

  private resolveSrc(p: string): string {
    // в БД лежит относительный путь — переводим в абсолютный внутри UPLOADS_DIR
    return toAbsUploadPath(p);
  }

  private mapEqTypeToRu(t: EquipmentPhotoType): string {
    switch (t) {
      case EquipmentPhotoType.serial:
        return 'серийный_номер';
      case EquipmentPhotoType.mac:
        return 'mac_адрес';
      default:
        return 'общая';
    }
  }

  private mapCarrTypeToRu(t: CarriagePhotoType): 'вагон' | 'оборудование' {
    return t === CarriagePhotoType.carriage ? 'вагон' : 'оборудование';
  }

  /** Создаёт архив фотографий для конкретной заявки */
  async archiveApplicationPhotos(
      applicationId: number,
      outputPath?: string
  ): Promise<string> {
    const application = await this.prisma.request.findUnique({
      where: { id: applicationId },
      include: {
        requestTrains: {
          include: {
            requestCarriages: {
              include: {
                carriage: { select: { number: true } },
                carriagePhotos: true,
              },
            },
          },
        },
        requestEquipments: {
          include: {
            equipment: { select: { id: true, serialNumber: true } },
            photos: true,
          },
        },
      },
    });
    if (!application) {
      throw new Error(`Заявка с ID ${applicationId} не найдена`);
    }

    const archiveName = `заявка_${applicationId}_фотографии.zip`;
    const archivePath = outputPath ?? path.join(ARCHIVES_DIR, archiveName);
    fs.mkdirSync(path.dirname(archivePath), { recursive: true });

    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise<string>((resolve, reject) => {
      output.on('close', () => resolve(archivePath));
      archive.on('error', (err) => reject(err));
      archive.pipe(output);

      const DIR_EQ = 'Оборудование';
      const DIR_CARR = 'Вагоны';

      // 1) Оборудование
      for (const reqEq of application.requestEquipments) {
        const eqId = reqEq.equipment.id;
        const serial = reqEq.equipment.serialNumber || '';
        for (const photo of reqEq.photos) {
          const src = this.resolveSrc(photo.photoPath);
          if (!fs.existsSync(src)) continue;
          const ext = path.extname(src);
          const rusType = this.mapEqTypeToRu(photo.photoType);
          const name = `оборудование_${eqId}_${serial}_${rusType}${ext}`;
          archive.file(src, { name: path.posix.join(DIR_EQ, name) });
        }
      }

      // 2) Вагоны
      for (const rt of application.requestTrains) {
        for (const rc of rt.requestCarriages) {
          const wagonNum = rc.carriage.number;
          for (const photo of rc.carriagePhotos) {
            const src = this.resolveSrc(photo.photoPath);
            if (!fs.existsSync(src)) continue;
            const ext = path.extname(src);
            const suffix = this.mapCarrTypeToRu(photo.photoType);
            const name = `вагон_${wagonNum}_${suffix}${ext}`;
            archive.file(src, { name: path.posix.join(DIR_CARR, name) });
          }
        }
      }

      archive.finalize();
    }).finally(async () => {
      await this.prisma.$disconnect();
    });
  }

  /** Создаёт архив фотографий за период (включительно) */
  async archivePhotosByDateRange(
      dateFrom: string,
      dateTo: string,
      outputPath?: string
  ): Promise<string> {
    const apps = await this.prisma.request.findMany({
      where: { createdAt: { gte: new Date(dateFrom), lte: new Date(dateTo) } },
      include: {
        requestTrains: {
          include: {
            requestCarriages: {
              include: {
                carriage: { select: { number: true } },
                carriagePhotos: true,
              },
            },
          },
        },
        requestEquipments: {
          include: {
            equipment: { select: { id: true, serialNumber: true } },
            photos: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (apps.length === 0) {
      throw new Error(`Заявки за период ${dateFrom} - ${dateTo} не найдены`);
    }

    const rusName = `заявки_${dateFrom}_по_${dateTo}_фотографии.zip`;
    const archivePath = outputPath ?? path.join(ARCHIVES_DIR, rusName);
    fs.mkdirSync(path.dirname(archivePath), { recursive: true });

    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);

    const BASE = 'Заявки';
    for (const app of apps) {
      const appBase = path.posix.join(BASE, `заявка_${app.id}`);
      const DIR_EQ = path.posix.join(appBase, 'Оборудование');
      const DIR_CARR = path.posix.join(appBase, 'Вагоны');

      // оборудование
      for (const reqEq of app.requestEquipments) {
        const eqId = reqEq.equipment.id;
        const serial = reqEq.equipment.serialNumber || '';
        for (const photo of reqEq.photos) {
          const src = this.resolveSrc(photo.photoPath);
          if (!fs.existsSync(src)) continue;
          const ext = path.extname(src);
          const rusType = this.mapEqTypeToRu(photo.photoType);
          const name = `оборудование_${eqId}_${serial}_${rusType}${ext}`;
          archive.file(src, { name: path.posix.join(DIR_EQ, name) });
        }
      }

      // вагоны
      for (const rt of app.requestTrains) {
        for (const rc of rt.requestCarriages) {
          const wagonNum = rc.carriage.number;
          for (const photo of rc.carriagePhotos) {
            const src = this.resolveSrc(photo.photoPath);
            if (!fs.existsSync(src)) continue;
            const ext = path.extname(src);
            const suffix = this.mapCarrTypeToRu(photo.photoType);
            const name = `вагон_${wagonNum}_${suffix}${ext}`;
            archive.file(src, { name: path.posix.join(DIR_CARR, name) });
          }
        }
      }
    }

    await archive.finalize();
    await new Promise<void>((resolve) => output.on('close', () => resolve()));
    await this.prisma.$disconnect();
    return archivePath;
  }

  /** Удаляет старые фото (старше daysOld дней) */
  async cleanupOldPhotos(
      daysOld = 365
  ): Promise<{ deletedFiles: number; freedSpace: number }> {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysOld);

      const apps = await this.prisma.request.findMany({
        where: { createdAt: { lt: cutoff } },
        include: {
          requestTrains: { include: { requestCarriages: { include: { carriagePhotos: true } } } },
          requestEquipments: { include: { photos: true } },
        },
      });

      let deletedFiles = 0;
      let freedSpace = 0;
      const toDelete = new Set<string>();

      for (const app of apps) {
        for (const rt of app.requestTrains) {
          for (const rc of rt.requestCarriages) {
            for (const p of rc.carriagePhotos) {
              toDelete.add(this.resolveSrc(p.photoPath));
            }
          }
        }
        for (const re of app.requestEquipments) {
          for (const p of re.photos) {
            toDelete.add(this.resolveSrc(p.photoPath));
          }
        }
      }

      for (const file of toDelete) {
        if (!fs.existsSync(file)) continue;
        try {
          const stat = fs.statSync(file);
          fs.rmSync(file, { force: true });
          deletedFiles += 1;
          freedSpace += stat.size;
        } catch (e) {
          console.warn(`Не удалось удалить ${file}:`, e);
        }
      }

      // чистить пустые каталоги не будем агрессивно; если нужно — можно дописать
      return { deletedFiles, freedSpace };
    } catch (error) {
      console.error('Ошибка при очистке фото:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
