import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import path from "path";
import { v4 } from "uuid";
// import fs from "fs";
import * as fs from 'fs/promises';

const prisma = new PrismaClient();
const UPLOAD_ROOT = path.join(__dirname, '../../../uploads');

const requestFolderMap: Record<string, string> = {
  carriagePhoto: 'request/carriage',
  generalPhoto: 'request/general',
  finalPhoto: 'request/final',
};

const equipmentPhotoTypeMap: Record<string, string> = {
  equipmentPhoto: 'equipment',
  serialPhoto: 'serial',
  macPhoto: 'mac',
};

async function generateUniqueFilename(
    dir: string,
    ext: string,
    scope: 'request' | 'equipment',
    column?: 'carriagePhoto' | 'generalPhoto' | 'finalPhoto'
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

    if (scope === 'equipment') {
      const exists = await prisma.equipmentPhoto.findFirst({ where: { photoPath: relPath } });
      if (exists) continue;
    } else if (scope === 'request' && column) {
      const exists = await prisma.request.findFirst({ where: { [column]: relPath } });
      if (exists) continue;
    }
    break;
  } while (true);
  return name;
}

export const createApplication = async (req: Request, res: Response) => {
  const cleanupPaths: string[] = [];
  try {
    // const files = (req.files as Express.Multer.File[]) || [];
    //
    // const savedRequest: Record<string, string | null> = {
    //   carriagePhoto: null,
    //   generalPhoto: null,
    //   finalPhoto: null,
    // };
    //
    // const savedEquipment: Record<number, Record<string, string>> = {};
    //
    // for (const file of files) {
    //   const reqSub = requestFolderMap[file.fieldname];
    //   if (reqSub) {
    //     const dir = path.join(UPLOAD_ROOT, reqSub);
    //     await fs.mkdir(dir, { recursive: true });
    //     const ext = path.extname(file.originalname) || '';
    //     const name = await generateUniqueFilename(dir, ext, 'request', file.fieldname as any);
    //     const target = path.join(dir, name);
    //     await fs.writeFile(target, file.buffer);
    //     cleanupPaths.push(target);
    //     savedRequest[file.fieldname] = path.posix.join(reqSub, name);
    //   } else {
    //     const m = file.fieldname.match(/^equipment\[(\d+)\]\[photos\]\[(\w+)\]$/);
    //     if (m) {
    //       const idx = parseInt(m[1], 10);
    //       const key = m[2];
    //       const sub = equipmentPhotoTypeMap[key] || key;
    //       const dir = path.join(UPLOAD_ROOT, 'equipment', sub);
    //       await fs.mkdir(dir, { recursive: true });
    //       const ext = path.extname(file.originalname) || '';
    //       const name = await generateUniqueFilename(dir, ext, 'equipment');
    //       const target = path.join(dir, name);
    //       await fs.writeFile(target, file.buffer);
    //       cleanupPaths.push(target);
    //       savedEquipment[idx] = savedEquipment[idx] || {};
    //       savedEquipment[idx][key] = path.posix.join('equipment', sub, name);
    //     }
    //   }
    // }
    //
    // const {
    //   id,
    //   applicationDate,
    //   typeWork,
    //   trainNumber,
    //   carriageType,
    //   carriageNumber,
    //   completedJob,
    //   currentLocation,
    //   userId,
    //   userName,
    //   userRole,
    //   status = 'completed',
    //   equipmentLength,
    // } = req.body as Record<string, string>;
    //
    // const dto: any = {
    //   applicationDate:  applicationDate ? new Date(applicationDate) : new Date(),
    //   typeWorkId: null,
    //   trainId: null,
    //   carriageId: null,
    //   completedJobId: null,
    //   currentLocationId: null,
    //   userId: parseInt(userId, 10),
    //   status,
    //   carriagePhoto: savedRequest.carriagePhoto,
    //   generalPhoto: savedRequest.generalPhoto,
    //   finalPhoto: savedRequest.finalPhoto,
    // };
    //
    // if (!userId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "userId обязателен для создания заявки",
    //   });
    // }
    //
    // if (status === "completed") {
    //   if (
    //     !typeWork ||
    //     !trainNumber ||
    //     !carriageType ||
    //     !carriageNumber ||
    //     !completedJob ||
    //     !currentLocation ||
    //     !userName ||
    //     !userRole ||
    //     !equipmentLength
    //   ) {
    //     return res.status(400).json({
    //       success: false,
    //       message:
    //         "Все обязательные поля должны быть заполнены для завершенной заявки",
    //     });
    //   }
    // }
    //
    // if (id) dto.id = parseInt(id, 10);
    //
    // let requestRecord;
    // if (dto.id) {
    //   requestRecord = await prisma.request.update({ where: { id: dto.id }, data: dto });
    // } else {
    //   requestRecord = await prisma.request.create({ data: dto });
    // }
    //
    // const eqLen = parseInt(equipmentLength || '0', 10);
    // for (let i = 0; i < eqLen; i++) {
    //   const prefix = `equipment[${i}]`;
    //   const item: any = {
    //     equipmentType: req.body[`${prefix}[equipmentType]`],
    //     serialNumber:  req.body[`${prefix}[serialNumber]`],
    //     macAddress:    req.body[`${prefix}[macAddress]`],
    //     quantity:      parseInt(req.body[`${prefix}[quantity]`], 10) || 0,
    //   };
    //   if (
    //     !item.equipmentType ||
    //     !item.serialNumber ||
    //     !item.quantity
    //   ) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Тип оборудования, серийный номер и количество обязательны для заполнения",
    //     });
    //   }
    //   let equipmentRecord = await prisma.equipment.findFirst({ where: {
    //       type:         item.equipmentType,
    //       serialNumber: item.serialNumber || null,
    //       macAddress:   item.macAddress  || null,
    //     }});
    //   if (!equipmentRecord) {
    //     equipmentRecord = await prisma.equipment.create({ data: {
    //         type:         item.equipmentType,
    //         serialNumber: item.serialNumber || null,
    //         macAddress:   item.macAddress   || null,
    //         status:       'active',
    //       }});
    //   }
    //   await prisma.requestEquipment.upsert({
    //     where: { requestId_equipmentId: { requestId: requestRecord.id, equipmentId: equipmentRecord.id } },
    //     create: { requestId: requestRecord.id, equipmentId: equipmentRecord.id, quantity: item.quantity },
    //     update: { quantity: item.quantity }
    //   });
    //   const photos = savedEquipment[i] || {};
    //   for (const [key, relPath] of Object.entries(photos)) {
    //     const photoType = key;
    //     await prisma.equipmentPhoto.create({ data: {
    //         equipmentId: equipmentRecord.id,
    //         photoType,
    //         photoPath: relPath,
    //       }});
    //   }
    // }
    //
    // return res.status(201).json({ success: true, data: requestRecord });

    const {
      id,
      applicationDate,
      typeWork,
      trainNumber,
      carriageType,
      carriageNumber,
      completedJob,
      currentLocation,
      userId,
      userName,
      userRole,
      status = 'completed',
      equipmentLength,
    } = req.body as Record<string, string>;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId обязателен' });
    }
    if (status === 'completed') {
      if (
        !typeWork ||
        !trainNumber ||
        !carriageType ||
        !carriageNumber ||
        !completedJob ||
        !currentLocation ||
        !userName ||
        !userRole ||
        !equipmentLength
      ) {
        return res.status(400).json({ success: false, message: 'Все обязательные поля должны быть заполнены' });
      }
    }

    const dto: any = {
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      typeWorkId: null,
      trainId: null,
      carriageId: null,
      completedJobId: null,
      currentLocationId: null,
      userId: parseInt(userId, 10),
      status,
    };
    if (id) dto.id = parseInt(id, 10);

    const files = (req.files as Express.Multer.File[]) || [];
    const savedRequest: Record<string, string | null> = { carriagePhoto: null, generalPhoto: null, finalPhoto: null };
    const savedEquipment: Record<number, Record<string, string>> = {};

    for (const file of files) {
      const reqSub = requestFolderMap[file.fieldname as keyof typeof requestFolderMap];
      if (reqSub) {
        const dir = path.join(UPLOAD_ROOT, reqSub);
        await fs.mkdir(dir, { recursive: true });
        const ext = path.extname(file.originalname) || '';
        const name = await generateUniqueFilename(dir, ext, 'request', file.fieldname as any);
        const target = path.join(dir, name);
        await fs.writeFile(target, file.buffer);
        cleanupPaths.push(target);
        savedRequest[file.fieldname] = path.posix.join(reqSub, name);
      } else {
        const m = file.fieldname.match(/^equipment\[(\d+)\]\[photos\]\[(\w+)\]$/);
        if (m) {
          const idx = parseInt(m[1], 10);
          const key = m[2];
          const sub = equipmentPhotoTypeMap[key];
          const dir = path.join(UPLOAD_ROOT, 'equipment', sub);
          await fs.mkdir(dir, { recursive: true });
          const ext = path.extname(file.originalname) || '';
          const name = await generateUniqueFilename(dir, ext, 'equipment');
          const target = path.join(dir, name);
          await fs.writeFile(target, file.buffer);
          cleanupPaths.push(target);
          savedEquipment[idx] = savedEquipment[idx] || {};
          savedEquipment[idx][key] = path.posix.join('equipment', sub, name);
        }
      }
    }

    dto.carriagePhoto = savedRequest.carriagePhoto;
    dto.generalPhoto = savedRequest.generalPhoto;
    dto.finalPhoto = savedRequest.finalPhoto;

    let requestRecord;
    if (dto.id) {
      requestRecord = await prisma.request.update({ where: { id: dto.id }, data: dto });
    } else {
      requestRecord = await prisma.request.create({ data: dto });
    }

    const eqLen = parseInt(equipmentLength || '0', 10);
    for (let i = 0; i < eqLen; i++) {
      const prefix = `equipment[${i}]`;
      const item: any = {
        equipmentType: req.body[`${prefix}[equipmentType]`],
        serialNumber: req.body[`${prefix}[serialNumber]`],
        macAddress: req.body[`${prefix}[macAddress]`],
        quantity: parseInt(req.body[`${prefix}[quantity]`], 10) || 0,
      };
      if (!item.equipmentType || !item.serialNumber || !item.quantity) {
        return res.status(400).json({ success: false, message: 'Оборудование: поля обязательны' });
      }
      let equipRec = await prisma.equipment.findFirst({ where: { type: item.equipmentType, serialNumber: item.serialNumber || null, macAddress: item.macAddress || null }});
      if (!equipRec) {
        equipRec = await prisma.equipment.create({ data: { type: item.equipmentType, serialNumber: item.serialNumber || null, macAddress: item.macAddress || null, status: 'active' }});
      }
      await prisma.requestEquipment.upsert({ where: { requestId_equipmentId: { requestId: requestRecord.id, equipmentId: equipRec.id } }, create: { requestId: requestRecord.id, equipmentId: equipRec.id, quantity: item.quantity }, update: { quantity: item.quantity }});

      const photos = savedEquipment[i] || {};
      for (const [key, relPath] of Object.entries(photos)) {
        await prisma.equipmentPhoto.create({ data: { equipmentId: equipRec.id, photoType: key, photoPath: relPath }});
      }
    }

    return res.status(201).json({ success: true, data: requestRecord });
  } catch (error) {
    console.error('createApplication error:', error);
    await Promise.all(cleanupPaths.map(p => fs.unlink(p).catch(() => {})));
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    await prisma.$disconnect();
  }
};

// console.log('res', res);
// const files = req.files as Record<string, Express.Multer.File[]>;
// const {
//   id,
//   // applicationDate,
//   // typeWork,
//   // trainNumber,
//   // carriageType,
//   // carriageNumber,
//   // completedJob,
//   // currentLocation,
//   // userId,
//   // userName,
//   // userRole,
//   // status = 'completed',
// } = req.body;
// console.log('files', id);
// try {
//   console.log("=== Создание/обновление заявки ===");
//   console.log("Request body:", JSON.stringify(req.body, null, 2));
//   console.log("Request method:", req.method);
//   console.log("Request URL:", req.url);
//
//   const {
//     id, // Для обновления существующего черновика
//     applicationDate,
//     typeWork,
//     trainNumber,
//     carriageType,
//     carriageNumber,
//     equipment, // Массив оборудования
//     completedJob,
//     currentLocation,
//     carriagePhoto,
//     generalPhoto,
//     finalPhoto,
//     userId,
//     userName,
//     userRole,
//     status = "completed", // По умолчанию завершенная заявка
//   } = req.body;
//
//   console.log("Extracted data:", {
//     id,
//     status,
//     typeWork,
//     trainNumber,
//     carriageType,
//     carriageNumber,
//     userId,
//     userName,
//     userRole,
//     equipmentCount: equipment?.length || 0
//   });
//
//   // Валидация userId - обязательно для всех заявок (включая черновики)
//   if (!userId) {
//     return res.status(400).json({
//       success: false,
//       message: "userId обязателен для создания заявки",
//     });
//   }
//
//   // Валидация обязательных полей для завершенной заявки
//   if (status === "completed") {
//     if (
//       !typeWork ||
//       !trainNumber ||
//       !carriageType ||
//       !carriageNumber ||
//       !equipment ||
//       !Array.isArray(equipment) ||
//       equipment.length === 0 ||
//       !completedJob ||
//       !currentLocation ||
//       !userName ||
//       !userRole
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Все обязательные поля должны быть заполнены для завершенной заявки",
//       });
//     }
//
//     // Валидация каждого элемента оборудования
//     for (const item of equipment) {
//       if (
//         !item.equipmentType ||
//         !item.serialNumber ||
//         !item.quantity
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Тип оборудования, серийный номер и количество обязательны для заполнения",
//         });
//       }
//
//       // MAC адрес обязателен только для определенных типов оборудования
//       const needsMac = item.equipmentType.toLowerCase().includes('точка доступа') ||
//                        item.equipmentType.toLowerCase().includes('маршрутизатор') ||
//                        item.equipmentType.toLowerCase().includes('коммутатор');
//
//       if (needsMac && !item.macAddress) {
//         return res.status(400).json({
//           success: false,
//           message: `MAC адрес обязателен для оборудования типа "${item.equipmentType}"`,
//         });
//       }
//     }
//   }
//
//   // Если это обновление существующего черновика
//   if (id) {
//     const existingRequest = await prisma.request.findUnique({
//       where: { id: parseInt(id) },
//       include: { requestEquipment: true },
//     });
//
//     if (!existingRequest) {
//       return res.status(404).json({
//         success: false,
//         message: "Заявка не найдена",
//       });
//     }
//
//     // Удаляем старые связи с оборудованием
//     await prisma.requestEquipment.deleteMany({
//       where: { requestId: parseInt(id) },
//     });
//   }
//
//   console.log("=== Поиск/создание записей в справочниках ===");
//   console.log("Searching for:", { typeWork, trainNumber, carriageNumber, completedJob, currentLocation });
//
//   // Находим или создаем записи в справочниках
//   const [
//     typeWorkRecord,
//     trainRecord,
//     completedJobRecord,
//     locationRecord,
//   ] = await Promise.all([
//     typeWork ? prisma.typeWork.upsert({
//       where: { name: typeWork },
//       update: {},
//       create: { name: typeWork }
//     }) : null,
//     trainNumber ? prisma.train.upsert({
//       where: { number: trainNumber },
//       update: {},
//       create: { number: trainNumber }
//     }) : null,
//     completedJob ? prisma.completedJob.upsert({
//       where: { name: completedJob },
//       update: {},
//       create: { name: completedJob }
//     }) : null,
//     currentLocation ? prisma.currentLocation.upsert({
//       where: { name: currentLocation },
//       update: {},
//       create: { name: currentLocation }
//     }) : null,
//   ]);
//
//   // Для вагона нужна дополнительная логика, так как нужен trainId
//   let carriageRecord = null;
//   if (carriageNumber && trainRecord) {
//     carriageRecord = await prisma.carriage.upsert({
//       where: {
//         number_trainId: {
//           number: carriageNumber,
//           trainId: trainRecord.id
//         }
//       },
//       update: {},
//       create: {
//         number: carriageNumber,
//         type: carriageType || "Неизвестный",
//         trainId: trainRecord.id
//       }
//     });
//   }
//
//   console.log("=== Результаты поиска/создания ===");
//   console.log("typeWorkRecord:", typeWorkRecord);
//   console.log("trainRecord:", trainRecord);
//   console.log("carriageRecord:", carriageRecord);
//   console.log("completedJobRecord:", completedJobRecord);
//   console.log("locationRecord:", locationRecord);
//
//   if (status === "completed") {
//     if (
//       !typeWorkRecord ||
//       !trainRecord ||
//       !carriageRecord ||
//       !completedJobRecord ||
//       !locationRecord
//     ) {
//       console.log("=== Ошибка валидации справочников ===");
//       console.log("Missing records:", {
//         typeWork: !typeWorkRecord,
//         train: !trainRecord,
//         carriage: !carriageRecord,
//         completedJob: !completedJobRecord,
//         location: !locationRecord
//       });
//
//       return res.status(400).json({
//         success: false,
//         message: "Ошибка валидации данных. Проверьте правильность заполнения формы.",
//       });
//     }
//   }
//
//   const requestData: any = {
//     applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
//     typeWorkId: typeWorkRecord?.id || null,
//     trainId: trainRecord?.id || null,
//     carriageId: carriageRecord?.id || null,
//     completedJobId: completedJobRecord?.id || null,
//     currentLocationId: locationRecord?.id || null,
//     carriagePhoto: carriagePhoto || null,
//     generalPhoto: generalPhoto || null,
//     finalPhoto: finalPhoto || null,
//     status,
//     userId: parseInt(userId), // userId всегда обязателен
//   };
//   let request;
//
//   if (id) {
//     // Обновляем существующую заявку
//     request = await prisma.request.update({
//       where: { id: parseInt(id) },
//       data: requestData,
//     });
//   } else {
//     // Создаем новую заявку
//     request = await prisma.request.create({
//       data: requestData,
//     });
//   }
//
//   // Создаем связи с оборудованием
//   if (equipment && equipment.length > 0) {
//     for (const item of equipment) {
//       // Находим или создаем оборудование
//       const searchCriteria: any = {
//         type: item.equipmentType,
//         serialNumber: item.serialNumber,
//       };
//
//       // Добавляем MAC адрес в критерии поиска только если он есть
//       if (item.macAddress) {
//         searchCriteria.macAddress = item.macAddress;
//       } else {
//         searchCriteria.macAddress = null;
//       }
//
//       let equipmentRecord = await prisma.equipment.findFirst({
//         where: searchCriteria,
//       });
//
//       if (!equipmentRecord) {
//         equipmentRecord = await prisma.equipment.create({
//           data: {
//             type: item.equipmentType,
//             serialNumber: item.serialNumber,
//             macAddress: item.macAddress || null,
//             status: "active", // Adding required status field with default value
//           },
//         });
//       }
//
//       // Создаем связь между заявкой и оборудованием
//       await prisma.requestEquipment.create({
//         data: {
//           requestId: request.id,
//           equipmentId: equipmentRecord.id,
//           quantity: parseInt(item.quantity),
//         },
//       });
//
//       // Сохраняем фотографии оборудования
//       if (item.photos) {
//         const photoData = [];
//
//         if (item.photos.equipmentPhoto) {
//           photoData.push({
//             equipmentId: equipmentRecord.id,
//             photoPath: item.photos.equipmentPhoto,
//             photoType: "equipment",
//           });
//         }
//
//         if (item.photos.serialPhoto) {
//           photoData.push({
//             equipmentId: equipmentRecord.id,
//             photoPath: item.photos.serialPhoto,
//             photoType: "serial",
//           });
//         }
//
//         if (item.photos.macPhoto) {
//           photoData.push({
//             equipmentId: equipmentRecord.id,
//             photoPath: item.photos.macPhoto,
//             photoType: "mac",
//           });
//         }
//
//         if (photoData.length > 0) {
//           await prisma.equipmentPhoto.createMany({
//             data: photoData,
//           });
//         }
//       }
//     }
//   }
//
//   // Получаем полную информацию о созданной/обновленной заявке
//   const fullRequest = await prisma.request.findUnique({
//     where: { id: request.id },
//     include: {
//       requestEquipment: {
//         include: {
//           equipment: {
//             include: {
//               photos: true,
//             },
//           },
//         },
//       },
//       typeWork: true,
//       train: true,
//       carriage: true,
//       completedJob: true,
//       currentLocation: true,
//     },
//   });
//
//   console.log("=== Заявка успешно создана/обновлена ===");
//   console.log("Request ID:", request.id);
//   console.log("Status:", fullRequest?.status);
//
//   res.status(201).json({
//     success: true,
//     message: id ? "Заявка успешно обновлена" : "Заявка успешно создана",
//     data: fullRequest,
//   });
// } catch (error) {
//   console.error("=== Ошибка при создании/обновлении заявки ===");
//   console.error("Error details:", error);
//   res.status(500).json({
//     success: false,
//     message: "Внутренняя ошибка сервера при создании/обновлении заявки",
//   });
// } finally {
//   await prisma.$disconnect();
// }

// async function generateUniqueFilename(dir: string, ext: string): Promise<string> {
//   let name: string;
//   let fullPath: string;
//   do {
//     name = v4() + ext;
//     fullPath = path.join(dir, name);
//     try {
//       await fs.access(fullPath);
//     } catch {
//       break;
//     }
//   } while (true);
//   return name;
// }