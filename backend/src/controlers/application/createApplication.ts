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
// async function generateUniqueFilename(
//     dir: string,
//     ext: string,
//     scope: 'request' | 'equipment',
//     column?: 'carriagePhoto' | 'generalPhoto' | 'finalPhoto'
// ): Promise<string> {
//   let name: string;
//   let fullPath: string;
//   let relPath: string;
//   do {
//     name = v4() + ext;
//     fullPath = path.join(dir, name);
//     relPath = path.relative(UPLOAD_ROOT, fullPath);
//
//     try {
//       await fs.access(fullPath);
//       continue;
//     } catch { }
//
//     if (scope === 'equipment') {
//       const exists = await prisma.equipmentPhoto.findFirst({ where: { photoPath: relPath } });
//       if (exists) continue;
//     } else if (scope === 'request' && column) {
//       const exists = await prisma.request.findFirst({ where: { [column]: relPath } });
//       if (exists) continue;
//     }
//     break;
//   } while (true);
//   return name;
// }

export const createApplication = async (req: Request, res: Response) => {
  // const prisma = new PrismaClient();

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
