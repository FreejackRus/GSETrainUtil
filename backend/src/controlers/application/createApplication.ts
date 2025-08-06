import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import path from "path";
import { v4 } from "uuid";
// import fs from "fs";
import * as fs from 'fs/promises';

const prisma = new PrismaClient();
const UPLOAD_ROOT = path.join(__dirname, '../../../uploads');

// const requestFolderMap: Record<string, string> = {
//   carriagePhoto: 'request/carriage',
//   generalPhoto: 'request/general',
//   finalPhoto: 'request/final',
// };
//
// const equipmentPhotoTypeMap: Record<string, string> = {
//   equipmentPhoto: 'equipment',
//   serialPhoto: 'serial',
//   macPhoto: 'mac',
// };
//

const requestFolder = 'request';

const carriageFolder = 'carriage';

const equipmentPhotoTypeMap: Record<string, string> = {
  equipmentPhoto: 'equipment',
  serialPhoto: 'serial',
  macPhoto: 'mac',
};

async function generateUniqueFilename(
  dir: string,
  ext: string,
  scope: 'request' | 'carriage' | 'equipment'
): Promise<string> {
  let name: string;
  let fullPath: string;
  let relPath: string;
  do {
    name = v4() + ext;
    fullPath = path.join(dir, name);
    relPath = path.relative(UPLOAD_ROOT, fullPath);

    try {
      await fs.access(fullPath);
      continue;
    } catch { }

    if (scope === 'request') {
      const exists = await prisma.request.findFirst({ where: { photo: relPath } });
      if (exists) continue;
    } else if (scope === 'carriage') {
      const exists = await prisma.requestCarriage.findFirst({ where: { carriagePhoto: relPath } });
      if (exists) continue;
    } else if (scope === 'equipment') {
      const exists = await prisma.requestEquipmentPhoto.findFirst({ where: { photoPath: relPath } });
      if (exists) continue;
    }

    break;
  } while (true);
  return name;
}

export const createApplication = async (req: Request, res: Response) => {
  // const prisma = new PrismaClient();
  // const cleanupPaths: string[] = [];

  try {
    console.log("=== Создание/обновление заявки ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      id,                // Для обновления черновика
      applicationDate,
      typeWork,
      trainNumber,
      carriages = [],    // Массив вагонов
      equipment = [],    // Массив оборудования
      completedJob,
      currentLocation,
      photo,             // Новое единое поле фотографии заявки
      userId,
      status = "completed",
    } = req.body;

    // userId обязателен всегда
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId обязателен" });
    }

    // Базовая валидация для completed-заявки
    if (status === "completed") {
      if (!trainNumber || carriages.length === 0 || equipment.length === 0 || !completedJob || !currentLocation) {
        return res.status(400).json({
          success: false,
          message: "Для статуса completed обязательны trainNumber, carriages, equipment, completedJob и currentLocation",
        });
      }
      for (const c of carriages) {
        if (!c.carriageNumber || !c.carriageType) {
          return res.status(400).json({
            success: false,
            message: "В carriages обязательны carriageNumber и carriageType",
          });
        }
      }
    }

    // Если обновляем — удаляем старые связи
    if (id) {
      const exists = await prisma.request.findUnique({ where: { id: Number(id) } });
      if (!exists) {
        return res.status(404).json({ success: false, message: "Заявка не найдена" });
      }
      await Promise.all([
        prisma.requestTrain.deleteMany({     where: { requestId: Number(id) } }),
        prisma.requestCarriage.deleteMany({  where: { requestId: Number(id) } }),
        prisma.requestEquipment.deleteMany({ where: { requestId: Number(id) } }),
      ]);
    }

    // Справочники
    const trainRec = trainNumber
        ? await prisma.train.upsert({ where: { number: trainNumber }, update: {}, create: { number: trainNumber } })
        : null;
    const cjRec    = completedJob
        ? await prisma.completedJob.upsert({ where: { name: completedJob }, update: {}, create: { name: completedJob } })
        : null;
    const locRec   = currentLocation
        ? await prisma.currentLocation.upsert({ where: { name: currentLocation }, update: {}, create: { name: currentLocation } })
        : null;
    const twRec    = typeWork
        ? await prisma.typeWork.upsert({ where: { name: typeWork }, update: {}, create: { name: typeWork } })
        : null;

    // Создаём/обновляем Request
    const requestData: any = {
      applicationDate:   applicationDate ? new Date(applicationDate) : new Date(),
      status,
      userId:            Number(userId),
      trainId:           trainRec?.id ?? null,
      typeWorkId:        twRec?.id   ?? null,
      completedJobId:    cjRec?.id   ?? null,
      currentLocationId: locRec?.id  ?? null,
      photo:             photo       ?? null,       // ← сохраняем фото заявления
    };

    const request = id
        ? await prisma.request.update({ where: { id: Number(id) }, data: requestData })
        : await prisma.request.create({ data: requestData });

    // Связь Request ↔ Train
    if (trainRec) {
      await prisma.requestTrain.create({
        data: { requestId: request.id, trainId: trainRec.id },
      });
    }

    // Связь Request ↔ Carriage
    for (const c of carriages) {
      const carRec = await prisma.carriage.upsert({
        where: { number_trainId: { number: c.carriageNumber, trainId: trainRec!.id } },
        update: {},
        create: {
          number:  c.carriageNumber,
          type:    c.carriageType,
          trainId: trainRec!.id,
        },
      });
      await prisma.requestCarriage.create({
        data: {
          requestId:    request.id,
          carriageId:   carRec.id,
          carriagePhoto: c.carriagePhoto ?? null,
        },
      });
    }

    // Связь Request ↔ Equipment + фото
    for (const e of equipment) {
      // Предполагаем, что equipmentId приходит от клиента
      const eqRec = await prisma.equipment.findUnique({ where: { id: Number(e.equipmentId) } });
      if (!eqRec) {
        return res.status(400).json({ success: false, message: `Оборудование ${e.equipmentId} не найдено` });
      }
      const rtEq = await prisma.requestEquipment.create({
        data: {
          requestId:   request.id,
          equipmentId: eqRec.id,
          typeWorkId:  e.typeWorkId ?? null,
          quantity:    e.quantity ?? 1,
        },
      });
      if (Array.isArray(e.photos)) {
        for (const p of e.photos) {
          await prisma.requestEquipmentPhoto.create({
            data: {
              requestEquipmentId: rtEq.id,
              photoType:          p.type,
              photoPath:          p.path,
            },
          });
        }
      }
    }

    // Вернём полностью заполненный объект
    const full = await prisma.request.findUnique({
      where: { id: request.id },
      include: {
        requestTrains:    { include: { train: true } },
        requestCarriages: { include: { carriage: { include: { train: true } } } },
        requestEquipments: {
          include: {
            typeWork:  true,
            photos:    true,
            equipment: { include: { device: true } },
          }
        },
        completedJob:    true,
        currentLocation: true,
        user:            true,
      },
    });

    return res
        .status(id ? 200 : 201)
        .json({ success: true, data: full });
  } catch (error) {
    console.error("Ошибка при создании/обновлении заявки:", error);
    return res.status(500).json({ success: false, message: "Internal error" });
  } finally {
    await prisma.$disconnect();
  }
};

// export const createApplication = async (req: Request, res: Response) => {
//   const cleanupPaths: string[] = [];
//   try {
//     // 1. Extract and validate form fields before file ops
//     const {
//       id,
//       status = 'draft',
//       userId,
//       currentLocationId,
//       completedJobId,
//       equipmentLength,
//     } = req.body as Record<string, string>;

//     if (!userId) {
//       return res.status(400).json({ success: false, message: 'userId обязателен' });
//     }

//     // Prepare DTO
//     const dto: any = {
//       status,
//       userId: parseInt(userId, 10),
//       currentLocationId: currentLocationId ? parseInt(currentLocationId, 10) : null,
//       completedJobId: completedJobId ? parseInt(completedJobId, 10) : null,
//     };
//     if (id) dto.id = parseInt(id, 10);

//     // 2. Save files after validation
//     const files = (req.files as Express.Multer.File[]) || [];
//     let requestPhoto: string | null = null;
//     const carriagePhotos: Record<number, string> = {};
//     const equipmentPhotos: Record<number, Record<string, string>> = {};

//     for (const file of files) {
//       if (file.fieldname === 'photo') {
//         // Request-level photo
//         const dir = path.join(UPLOAD_ROOT, requestFolder);
//         await fs.mkdir(dir, { recursive: true });
//         const ext = path.extname(file.originalname) || '';
//         const name = await generateUniqueFilename(dir, ext, 'request');
//         const target = path.join(dir, name);
//         await fs.writeFile(target, file.buffer);
//         cleanupPaths.push(target);
//         requestPhoto = path.posix.join(requestFolder, name);
//       } else if (file.fieldname.startsWith('carriage[')) {
//         // f.fieldname = carriage[<idx>][carriageId] or carriage[<idx>][photo]
//         const m = file.fieldname.match(/^carriage\[(\d+)\]\[photo\]$/);
//         if (m) {
//           const idx = parseInt(m[1], 10);
//           const dir = path.join(UPLOAD_ROOT, carriageFolder);
//           await fs.mkdir(dir, { recursive: true });
//           const ext = path.extname(file.originalname) || '';
//           const name = await generateUniqueFilename(dir, ext, 'carriage');
//           const target = path.join(dir, name);
//           await fs.writeFile(target, file.buffer);
//           cleanupPaths.push(target);
//           carriagePhotos[idx] = path.posix.join(carriageFolder, name);
//         }
//       } else {
//         // Equipment photos: equipment[<i>][photos][<type>]
//         const m = file.fieldname.match(/^equipment\[(\d+)\]\[photos\]\[(\w+)\]$/);
//         if (m) {
//           const idx = parseInt(m[1], 10);
//           const key = m[2];
//           const sub = equipmentPhotoTypeMap[key];
//           const dir = path.join(UPLOAD_ROOT, 'equipment', sub);
//           await fs.mkdir(dir, { recursive: true });
//           const ext = path.extname(file.originalname) || '';
//           const name = await generateUniqueFilename(dir, ext, 'equipment');
//           const target = path.join(dir, name);
//           await fs.writeFile(target, file.buffer);
//           cleanupPaths.push(target);
//           equipmentPhotos[idx] = equipmentPhotos[idx] || {};
//           equipmentPhotos[idx][key] = path.posix.join('equipment', sub, name);
//         }
//       }
//     }

//     // 3. Assign saved photo path to DTO
//     dto.photo = requestPhoto;

//     // 4. Create or update Request
//     let requestRecord;
//     if (dto.id) {
//       requestRecord = await prisma.request.update({ where: { id: dto.id }, data: dto });
//     } else {
//       requestRecord = await prisma.request.create({ data: dto });
//     }

//     // 5. Process RequestCarriage entries and photos
//     const carrLen = Object.keys(carriagePhotos).length;
//     for (let i = 0; i < carrLen; i++) {
//       const carriageId = parseInt(req.body[`carriage[${i}][carriageId]`], 10);
//       const photoPath = carriagePhotos[i] || null;
//       await prisma.requestCarriage.upsert({
//         where: { requestId_carriageId: { requestId: requestRecord.id, carriageId } },
//         create: { requestId: requestRecord.id, carriageId, carriagePhoto: photoPath },
//         update: { carriagePhoto: photoPath }
//       });
//     }

//     // 6. Process RequestEquipment and photos
//     const eqLen = parseInt(equipmentLength || '0', 10);
//     for (let i = 0; i < eqLen; i++) {
//       const prefix = `equipment[${i}]`;
//       const equipmentId = parseInt(req.body[`${prefix}[equipmentId]`], 10);
//       const typeWorkId = parseInt(req.body[`${prefix}[typeWorkId]`], 10);
//       const quantity = parseInt(req.body[`${prefix}[quantity]`], 10) || 1;
//       const rep = await prisma.requestEquipment.upsert({
//         where: { requestId_equipmentId: { requestId: requestRecord.id, equipmentId } },
//         create: { requestId: requestRecord.id, equipmentId, typeWorkId, quantity },
//         update: { typeWorkId, quantity }
//       });
//       const photos = equipmentPhotos[i] || {};
//       for (const [key, relPath] of Object.entries(photos)) {
//         await prisma.requestEquipmentPhoto.upsert({
//           where: { requestEquipmentId_photoType: { requestEquipmentId: rep.id, photoType: key } },
//           create: { requestEquipmentId: rep.id, photoType: key, photoPath: relPath },
//           update: { photoPath: relPath }
//         });
//       }
//     }

//     return res.status(201).json({ success: true, data: requestRecord });
//   } catch (error) {
//     console.error('createApplication error:', error);
//     await Promise.all(cleanupPaths.map(p => fs.unlink(p).catch(() => {})));
//     return res.status(500).json({ success: false, message: 'Server error' });
//   } finally {
//     await prisma.$disconnect();
//   }
// };
