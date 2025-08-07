// // // // import { PrismaClient } from "@prisma/client";
// // // // import { Request, Response } from "express";
// // // // import path from "path";
// // // // import { v4 } from "uuid";
// // // // // import fs from "fs";
// // // // import * as fs from 'fs/promises';
// // // //
// // // // const prisma = new PrismaClient();
// // // // const UPLOAD_ROOT = path.join(__dirname, '../../../uploads');
// // // //
// // // // // const requestFolderMap: Record<string, string> = {
// // // // //   carriagePhoto: 'request/carriage',
// // // // //   generalPhoto: 'request/general',
// // // // //   finalPhoto: 'request/final',
// // // // // };
// // // // //
// // // // // const equipmentPhotoTypeMap: Record<string, string> = {
// // // // //   equipmentPhoto: 'equipment',
// // // // //   serialPhoto: 'serial',
// // // // //   macPhoto: 'mac',
// // // // // };
// // // // //
// // // //
// // // // const requestFolder = 'request';
// // // //
// // // // const carriageFolder = 'carriage';
// // // //
// // // // const equipmentPhotoTypeMap: Record<string, string> = {
// // // //   equipmentPhoto: 'equipment',
// // // //   serialPhoto: 'serial',
// // // //   macPhoto: 'mac',
// // // // };
// // // //
// // // // async function generateUniqueFilename(
// // // //   dir: string,
// // // //   ext: string,
// // // //   scope: 'request' | 'carriage' | 'equipment'
// // // // ): Promise<string> {
// // // //   let name: string;
// // // //   let fullPath: string;
// // // //   let relPath: string;
// // // //   do {
// // // //     name = v4() + ext;
// // // //     fullPath = path.join(dir, name);
// // // //     relPath = path.relative(UPLOAD_ROOT, fullPath);
// // // //
// // // //     try {
// // // //       await fs.access(fullPath);
// // // //       continue;
// // // //     } catch { }
// // // //
// // // //     if (scope === 'request') {
// // // //       const exists = await prisma.request.findFirst({ where: { photo: relPath } });
// // // //       if (exists) continue;
// // // //     } else if (scope === 'carriage') {
// // // //       const exists = await prisma.requestCarriage.findFirst({ where: { carriagePhoto: relPath } });
// // // //       if (exists) continue;
// // // //     } else if (scope === 'equipment') {
// // // //       const exists = await prisma.requestEquipmentPhoto.findFirst({ where: { photoPath: relPath } });
// // // //       if (exists) continue;
// // // //     }
// // // //
// // // //     break;
// // // //   } while (true);
// // // //   return name;
// // // // }
// // // //
// // // // export const createApplication = async (req: Request, res: Response) => {
// // // //   // const prisma = new PrismaClient();
// // // //   // const cleanupPaths: string[] = [];
// // // //
// // // //   try {
// // // //     console.log("=== Создание/обновление заявки ===");
// // // //     console.log("Request body:", JSON.stringify(req.body, null, 2));
// // // //
// // // //     const {
// // // //       id,                // Для обновления черновика
// // // //       applicationDate,
// // // //       typeWork,
// // // //       trainNumber,
// // // //       carriages = [],    // Массив вагонов
// // // //       equipment = [],    // Массив оборудования
// // // //       completedJob,
// // // //       currentLocation,
// // // //       photo,             // Новое единое поле фотографии заявки
// // // //       userId,
// // // //       status = "completed",
// // // //     } = req.body;
// // // //
// // // //     // userId обязателен всегда
// // // //     if (!userId) {
// // // //       return res.status(400).json({ success: false, message: "userId обязателен" });
// // // //     }
// // // //
// // // //     // Базовая валидация для completed-заявки
// // // //     if (status === "completed") {
// // // //       if (!trainNumber || carriages.length === 0 || equipment.length === 0 || !completedJob || !currentLocation) {
// // // //         return res.status(400).json({
// // // //           success: false,
// // // //           message: "Для статуса completed обязательны trainNumber, carriages, equipment, completedJob и currentLocation",
// // // //         });
// // // //       }
// // // //       for (const c of carriages) {
// // // //         if (!c.carriageNumber || !c.carriageType) {
// // // //           return res.status(400).json({
// // // //             success: false,
// // // //             message: "В carriages обязательны carriageNumber и carriageType",
// // // //           });
// // // //         }
// // // //       }
// // // //     }
// // // //
// // // //     // Если обновляем — удаляем старые связи
// // // //     if (id) {
// // // //       const exists = await prisma.request.findUnique({ where: { id: Number(id) } });
// // // //       if (!exists) {
// // // //         return res.status(404).json({ success: false, message: "Заявка не найдена" });
// // // //       }
// // // //       await Promise.all([
// // // //         prisma.requestTrain.deleteMany({     where: { requestId: Number(id) } }),
// // // //         prisma.requestCarriage.deleteMany({  where: { requestId: Number(id) } }),
// // // //         prisma.requestEquipment.deleteMany({ where: { requestId: Number(id) } }),
// // // //       ]);
// // // //     }
// // // //
// // // //     // Справочники
// // // //     const trainRec = trainNumber
// // // //         ? await prisma.train.upsert({ where: { number: trainNumber }, update: {}, create: { number: trainNumber } })
// // // //         : null;
// // // //     const cjRec    = completedJob
// // // //         ? await prisma.completedJob.upsert({ where: { name: completedJob }, update: {}, create: { name: completedJob } })
// // // //         : null;
// // // //     const locRec   = currentLocation
// // // //         ? await prisma.currentLocation.upsert({ where: { name: currentLocation }, update: {}, create: { name: currentLocation } })
// // // //         : null;
// // // //     const twRec    = typeWork
// // // //         ? await prisma.typeWork.upsert({ where: { name: typeWork }, update: {}, create: { name: typeWork } })
// // // //         : null;
// // // //
// // // //     // Создаём/обновляем Request
// // // //     const requestData: any = {
// // // //       applicationDate:   applicationDate ? new Date(applicationDate) : new Date(),
// // // //       status,
// // // //       userId:            Number(userId),
// // // //       trainId:           trainRec?.id ?? null,
// // // //       typeWorkId:        twRec?.id   ?? null,
// // // //       completedJobId:    cjRec?.id   ?? null,
// // // //       currentLocationId: locRec?.id  ?? null,
// // // //       photo:             photo       ?? null,       // ← сохраняем фото заявления
// // // //     };
// // // //
// // // //     const request = id
// // // //         ? await prisma.request.update({ where: { id: Number(id) }, data: requestData })
// // // //         : await prisma.request.create({ data: requestData });
// // // //
// // // //     // Связь Request ↔ Train
// // // //     if (trainRec) {
// // // //       await prisma.requestTrain.create({
// // // //         data: { requestId: request.id, trainId: trainRec.id },
// // // //       });
// // // //     }
// // // //
// // // //     // Связь Request ↔ Carriage
// // // //     for (const c of carriages) {
// // // //       const carRec = await prisma.carriage.upsert({
// // // //         where: { number_trainId: { number: c.carriageNumber, trainId: trainRec!.id } },
// // // //         update: {},
// // // //         create: {
// // // //           number:  c.carriageNumber,
// // // //           type:    c.carriageType,
// // // //           trainId: trainRec!.id,
// // // //         },
// // // //       });
// // // //       await prisma.requestCarriage.create({
// // // //         data: {
// // // //           requestId:    request.id,
// // // //           carriageId:   carRec.id,
// // // //           carriagePhoto: c.carriagePhoto ?? null,
// // // //         },
// // // //       });
// // // //     }
// // // //
// // // //     // Связь Request ↔ Equipment + фото
// // // //     for (const e of equipment) {
// // // //       // Предполагаем, что equipmentId приходит от клиента
// // // //       const eqRec = await prisma.equipment.findUnique({ where: { id: Number(e.equipmentId) } });
// // // //       if (!eqRec) {
// // // //         return res.status(400).json({ success: false, message: `Оборудование ${e.equipmentId} не найдено` });
// // // //       }
// // // //       const rtEq = await prisma.requestEquipment.create({
// // // //         data: {
// // // //           requestId:   request.id,
// // // //           equipmentId: eqRec.id,
// // // //           typeWorkId:  e.typeWorkId ?? null,
// // // //           quantity:    e.quantity ?? 1,
// // // //         },
// // // //       });
// // // //       if (Array.isArray(e.photos)) {
// // // //         for (const p of e.photos) {
// // // //           await prisma.requestEquipmentPhoto.create({
// // // //             data: {
// // // //               requestEquipmentId: rtEq.id,
// // // //               photoType:          p.type,
// // // //               photoPath:          p.path,
// // // //             },
// // // //           });
// // // //         }
// // // //       }
// // // //     }
// // // //
// // // //     // Вернём полностью заполненный объект
// // // //     const full = await prisma.request.findUnique({
// // // //       where: { id: request.id },
// // // //       include: {
// // // //         requestTrains:    { include: { train: true } },
// // // //         requestCarriages: { include: { carriage: { include: { train: true } } } },
// // // //         requestEquipments: {
// // // //           include: {
// // // //             typeWork:  true,
// // // //             photos:    true,
// // // //             equipment: { include: { device: true } },
// // // //           }
// // // //         },
// // // //         completedJob:    true,
// // // //         currentLocation: true,
// // // //         user:            true,
// // // //       },
// // // //     });
// // // //
// // // //     return res
// // // //         .status(id ? 200 : 201)
// // // //         .json({ success: true, data: full });
// // // //   } catch (error) {
// // // //     console.error("Ошибка при создании/обновлении заявки:", error);
// // // //     return res.status(500).json({ success: false, message: "Internal error" });
// // // //   } finally {
// // // //     await prisma.$disconnect();
// // // //   }
// // // // };
// // // //
// // // // // export const createApplication = async (req: Request, res: Response) => {
// // // // //   const cleanupPaths: string[] = [];
// // // // //   try {
// // // // //     // 1. Extract and validate form fields before file ops
// // // // //     const {
// // // // //       id,
// // // // //       status = 'draft',
// // // // //       userId,
// // // // //       currentLocationId,
// // // // //       completedJobId,
// // // // //       equipmentLength,
// // // // //     } = req.body as Record<string, string>;
// // // //
// // // // //     if (!userId) {
// // // // //       return res.status(400).json({ success: false, message: 'userId обязателен' });
// // // // //     }
// // // //
// // // // //     // Prepare DTO
// // // // //     const dto: any = {
// // // // //       status,
// // // // //       userId: parseInt(userId, 10),
// // // // //       currentLocationId: currentLocationId ? parseInt(currentLocationId, 10) : null,
// // // // //       completedJobId: completedJobId ? parseInt(completedJobId, 10) : null,
// // // // //     };
// // // // //     if (id) dto.id = parseInt(id, 10);
// // // //
// // // // //     // 2. Save files after validation
// // // // //     const files = (req.files as Express.Multer.File[]) || [];
// // // // //     let requestPhoto: string | null = null;
// // // // //     const carriagePhotos: Record<number, string> = {};
// // // // //     const equipmentPhotos: Record<number, Record<string, string>> = {};
// // // //
// // // // //     for (const file of files) {
// // // // //       if (file.fieldname === 'photo') {
// // // // //         // Request-level photo
// // // // //         const dir = path.join(UPLOAD_ROOT, requestFolder);
// // // // //         await fs.mkdir(dir, { recursive: true });
// // // // //         const ext = path.extname(file.originalname) || '';
// // // // //         const name = await generateUniqueFilename(dir, ext, 'request');
// // // // //         const target = path.join(dir, name);
// // // // //         await fs.writeFile(target, file.buffer);
// // // // //         cleanupPaths.push(target);
// // // // //         requestPhoto = path.posix.join(requestFolder, name);
// // // // //       } else if (file.fieldname.startsWith('carriage[')) {
// // // // //         // f.fieldname = carriage[<idx>][carriageId] or carriage[<idx>][photo]
// // // // //         const m = file.fieldname.match(/^carriage\[(\d+)\]\[photo\]$/);
// // // // //         if (m) {
// // // // //           const idx = parseInt(m[1], 10);
// // // // //           const dir = path.join(UPLOAD_ROOT, carriageFolder);
// // // // //           await fs.mkdir(dir, { recursive: true });
// // // // //           const ext = path.extname(file.originalname) || '';
// // // // //           const name = await generateUniqueFilename(dir, ext, 'carriage');
// // // // //           const target = path.join(dir, name);
// // // // //           await fs.writeFile(target, file.buffer);
// // // // //           cleanupPaths.push(target);
// // // // //           carriagePhotos[idx] = path.posix.join(carriageFolder, name);
// // // // //         }
// // // // //       } else {
// // // // //         // Equipment photos: equipment[<i>][photos][<type>]
// // // // //         const m = file.fieldname.match(/^equipment\[(\d+)\]\[photos\]\[(\w+)\]$/);
// // // // //         if (m) {
// // // // //           const idx = parseInt(m[1], 10);
// // // // //           const key = m[2];
// // // // //           const sub = equipmentPhotoTypeMap[key];
// // // // //           const dir = path.join(UPLOAD_ROOT, 'equipment', sub);
// // // // //           await fs.mkdir(dir, { recursive: true });
// // // // //           const ext = path.extname(file.originalname) || '';
// // // // //           const name = await generateUniqueFilename(dir, ext, 'equipment');
// // // // //           const target = path.join(dir, name);
// // // // //           await fs.writeFile(target, file.buffer);
// // // // //           cleanupPaths.push(target);
// // // // //           equipmentPhotos[idx] = equipmentPhotos[idx] || {};
// // // // //           equipmentPhotos[idx][key] = path.posix.join('equipment', sub, name);
// // // // //         }
// // // // //       }
// // // // //     }
// // // //
// // // // //     // 3. Assign saved photo path to DTO
// // // // //     dto.photo = requestPhoto;
// // // //
// // // // //     // 4. Create or update Request
// // // // //     let requestRecord;
// // // // //     if (dto.id) {
// // // // //       requestRecord = await prisma.request.update({ where: { id: dto.id }, data: dto });
// // // // //     } else {
// // // // //       requestRecord = await prisma.request.create({ data: dto });
// // // // //     }
// // // //
// // // // //     // 5. Process RequestCarriage entries and photos
// // // // //     const carrLen = Object.keys(carriagePhotos).length;
// // // // //     for (let i = 0; i < carrLen; i++) {
// // // // //       const carriageId = parseInt(req.body[`carriage[${i}][carriageId]`], 10);
// // // // //       const photoPath = carriagePhotos[i] || null;
// // // // //       await prisma.requestCarriage.upsert({
// // // // //         where: { requestId_carriageId: { requestId: requestRecord.id, carriageId } },
// // // // //         create: { requestId: requestRecord.id, carriageId, carriagePhoto: photoPath },
// // // // //         update: { carriagePhoto: photoPath }
// // // // //       });
// // // // //     }
// // // //
// // // // //     // 6. Process RequestEquipment and photos
// // // // //     const eqLen = parseInt(equipmentLength || '0', 10);
// // // // //     for (let i = 0; i < eqLen; i++) {
// // // // //       const prefix = `equipment[${i}]`;
// // // // //       const equipmentId = parseInt(req.body[`${prefix}[equipmentId]`], 10);
// // // // //       const typeWorkId = parseInt(req.body[`${prefix}[typeWorkId]`], 10);
// // // // //       const quantity = parseInt(req.body[`${prefix}[quantity]`], 10) || 1;
// // // // //       const rep = await prisma.requestEquipment.upsert({
// // // // //         where: { requestId_equipmentId: { requestId: requestRecord.id, equipmentId } },
// // // // //         create: { requestId: requestRecord.id, equipmentId, typeWorkId, quantity },
// // // // //         update: { typeWorkId, quantity }
// // // // //       });
// // // // //       const photos = equipmentPhotos[i] || {};
// // // // //       for (const [key, relPath] of Object.entries(photos)) {
// // // // //         await prisma.requestEquipmentPhoto.upsert({
// // // // //           where: { requestEquipmentId_photoType: { requestEquipmentId: rep.id, photoType: key } },
// // // // //           create: { requestEquipmentId: rep.id, photoType: key, photoPath: relPath },
// // // // //           update: { photoPath: relPath }
// // // // //         });
// // // // //       }
// // // // //     }
// // // //
// // // // //     return res.status(201).json({ success: true, data: requestRecord });
// // // // //   } catch (error) {
// // // // //     console.error('createApplication error:', error);
// // // // //     await Promise.all(cleanupPaths.map(p => fs.unlink(p).catch(() => {})));
// // // // //     return res.status(500).json({ success: false, message: 'Server error' });
// // // // //   } finally {
// // // // //     await prisma.$disconnect();
// // // // //   }
// // // // // };
// // //
// // // import { Request, Response } from "express";
// // // import { PrismaClient } from "@prisma/client";
// // // import path from "path";
// // // import { v4 as uuidv4 } from "uuid";
// // // import fs from "fs/promises";
// // //
// // // const prisma = new PrismaClient();
// // // const UPLOAD_ROOT = path.join(__dirname, "../../../uploads");
// // // const REQUEST_DIR   = "request";
// // // const CARRIAGE_DIR  = "carriage";
// // // const EQUIP_DIR     = "equipment";
// // //
// // // // Mapping from form field to subfolder under uploads/equipment
// // // const equipmentPhotoTypeMap: Record<string, string> = {
// // //   equipmentPhoto: "equipment",
// // //   serialPhoto:    "serial",
// // //   macPhoto:       "mac",
// // // };
// // //
// // // /**
// // //  * Генерирует уникальное имя файла (UUID + расширение),
// // //  * проверяет отсутствие коллизий на диске и в БД.
// // //  */
// // // async function generateUniqueFilename(
// // //     dir: string,
// // //     ext: string,
// // //     scope: "request" | "carriage" | "equipment"
// // // ): Promise<string> {
// // //   let name: string;
// // //   let fullPath: string;
// // //   let relPath: string;
// // //   do {
// // //     name = uuidv4() + ext;
// // //     fullPath = path.join(dir, name);
// // //     relPath = path.relative(UPLOAD_ROOT, fullPath);
// // //
// // //     // Если файл уже существует на диске — пробуем заново
// // //     try {
// // //       await fs.access(fullPath);
// // //       continue;
// // //     } catch {}
// // //
// // //     // А теперь проверка на уникальность в БД
// // //     if (scope === "request") {
// // //       if (await prisma.request.findFirst({ where: { photo: relPath } })) continue;
// // //     } else if (scope === "carriage") {
// // //       if (await prisma.requestCarriage.findFirst({ where: { carriagePhoto: relPath } }))
// // //         continue;
// // //     } else {
// // //       if (
// // //           await prisma.requestEquipmentPhoto.findFirst({ where: { photoPath: relPath } })
// // //       )
// // //         continue;
// // //     }
// // //
// // //     // Всё свободно — выходим
// // //     break;
// // //   } while (true);
// // //
// // //   return name;
// // // }
// // //
// // // export const createApplication = async (req: Request, res: Response) => {
// // //   const cleanupPaths: string[] = [];
// // //
// // //   try {
// // //     console.log("=== createApplication body:", req.body);
// // //
// // //     const {
// // //       id,
// // //       trainNumbers    = [],
// // //       carriages       = [],
// // //       equipment       = [],
// // //       completedJob,
// // //       currentLocation,
// // //       photo,           // multer.any() положит сюда файл заявки
// // //       userId,
// // //       status = "completed",
// // //     } = req.body as {
// // //       id?: number;
// // //       trainNumbers?: string[];
// // //       carriages?: Array<{
// // //         carriageNumber: string;
// // //         carriageType:   string;
// // //       }>;
// // //       equipment?: Array<{
// // //         equipmentId: number;
// // //         typeWork:    string;
// // //         quantity:    number;
// // //       }>;
// // //       completedJob?: string;
// // //       currentLocation?: string;
// // //       photo?: string;   // multer stores buffer separately
// // //       userId?: number;
// // //       status?: string;
// // //     };
// // //
// // //     // 1) Валидация
// // //     if (!userId) {
// // //       return res.status(400).json({ success: false, message: "userId обязателен" });
// // //     }
// // //     if (status === "completed") {
// // //       if (
// // //           trainNumbers.length === 0 ||
// // //           carriages.length === 0 ||
// // //           equipment.length === 0 ||
// // //           !completedJob ||
// // //           !currentLocation
// // //       ) {
// // //         return res.status(400).json({
// // //           success: false,
// // //           message:
// // //               "Для completed обязательны trainNumbers, carriages, equipment, completedJob, currentLocation",
// // //         });
// // //       }
// // //       for (const c of carriages) {
// // //         if (!c.carriageNumber || !c.carriageType) {
// // //           return res.status(400).json({
// // //             success: false,
// // //             message: "В carriages обязательны carriageNumber и carriageType",
// // //           });
// // //         }
// // //       }
// // //     }
// // //
// // //     // 2) Сохраняем файлы (multer.any())
// // //     // multer положил все файлы в req.files
// // //     const files = req.files as Express.Multer.File[] || [];
// // //     let requestPhotoRel: string | null = null;
// // //     const carriagePhotoMap: Record<number, string> = {};
// // //     const equipmentPhotoMap: Record<
// // //         number,
// // //         Record<string, string>
// // //     > = {};
// // //
// // //     for (const file of files) {
// // //       const ext = path.extname(file.originalname) || "";
// // //       // —— файл самого заявления
// // //       if (file.fieldname === "photo") {
// // //         const dir = path.join(UPLOAD_ROOT, REQUEST_DIR);
// // //         await fs.mkdir(dir, { recursive: true });
// // //         const fname = await generateUniqueFilename(dir, ext, "request");
// // //         const full = path.join(dir, fname);
// // //         await fs.writeFile(full, file.buffer);
// // //         cleanupPaths.push(full);
// // //         requestPhotoRel = path
// // //             .relative(UPLOAD_ROOT, full)
// // //             .split(path.sep)
// // //             .join("/");
// // //         continue;
// // //       }
// // //
// // //       // —— фото вагонов: carriages[0][carriagePhoto], carriages[1][carriagePhoto], …
// // //       const mchCar = file.fieldname.match(/^carriages\[(\d+)\]\[carriagePhoto\]$/);
// // //       if (mchCar) {
// // //         const idx = Number(mchCar[1]);
// // //         const dir = path.join(UPLOAD_ROOT, CARRIAGE_DIR);
// // //         await fs.mkdir(dir, { recursive: true });
// // //         const fname = await generateUniqueFilename(dir, ext, "carriage");
// // //         const full = path.join(dir, fname);
// // //         await fs.writeFile(full, file.buffer);
// // //         cleanupPaths.push(full);
// // //         carriagePhotoMap[idx] = path
// // //             .relative(UPLOAD_ROOT, full)
// // //             .split(path.sep)
// // //             .join("/");
// // //         continue;
// // //       }
// // //
// // //       // —— фото оборудования: equipmentPhotos attached to carriage idx
// // //       //    формы выглядят: equipment[<idx>][photos][equipmentPhoto], …
// // //       const mchEq = file.fieldname.match(
// // //           /^equipment\[(\d+)\]\[photos\]\[(\w+)\]$/
// // //       );
// // //       if (mchEq) {
// // //         const idx = Number(mchEq[1]);
// // //         const key = mchEq[2]; // equipmentPhoto | serialPhoto | macPhoto
// // //         const sub = equipmentPhotoTypeMap[key];
// // //         const dir = path.join(UPLOAD_ROOT, EQUIP_DIR, sub);
// // //         await fs.mkdir(dir, { recursive: true });
// // //         const fname = await generateUniqueFilename(dir, ext, "equipment");
// // //         const full = path.join(dir, fname);
// // //         await fs.writeFile(full, file.buffer);
// // //         cleanupPaths.push(full);
// // //         equipmentPhotoMap[idx] = equipmentPhotoMap[idx] || {};
// // //         equipmentPhotoMap[idx][key] = path
// // //             .relative(UPLOAD_ROOT, full)
// // //             .split(path.sep)
// // //             .join("/");
// // //       }
// // //     }
// // //
// // //     // 3) Upsert справочников
// // //     const [cjRec, locRec] = await Promise.all([
// // //       completedJob
// // //           ? prisma.completedJob.upsert({
// // //             where:   { name: completedJob },
// // //             update:  {},
// // //             create:  { name: completedJob },
// // //           })
// // //           : Promise.resolve(null),
// // //       currentLocation
// // //           ? prisma.currentLocation.upsert({
// // //             where:   { name: currentLocation },
// // //             update:  {},
// // //             create:  { name: currentLocation },
// // //           })
// // //           : Promise.resolve(null),
// // //     ]);
// // //
// // //     // 4) Создаём или обновляем Request
// // //     const requestData: any = {
// // //       status,
// // //       userId:            Number(userId),
// // //       completedJobId:    cjRec?.id   ?? null,
// // //       currentLocationId: locRec?.id  ?? null,
// // //       photo:             requestPhotoRel,
// // //     };
// // //
// // //     const request = id
// // //         ? await prisma.request.update({
// // //           where: { id: Number(id) },
// // //           data:  requestData,
// // //         })
// // //         : await prisma.request.create({ data: requestData });
// // //
// // //     // 5) Связь Request ↔ Trains
// // //     //    (если обновление — сначала удалим старые)
// // //     if (id) {
// // //       await prisma.requestTrain.deleteMany({ where: { requestId: request.id } });
// // //     }
// // //     for (const tn of trainNumbers) {
// // //       const tr = await prisma.train.upsert({
// // //         where:  { number: tn },
// // //         update: {},
// // //         create: { number: tn },
// // //       });
// // //       await prisma.requestTrain.create({
// // //         data: { requestId: request.id, trainId: tr.id },
// // //       });
// // //     }
// // //
// // //     // 6) Связь Request ↔ Carriages
// // //     if (id) {
// // //       await prisma.requestCarriage.deleteMany({ where: { requestId: request.id } });
// // //     }
// // //     for (let i = 0; i < carriages.length; i++) {
// // //       const c = carriages[i];
// // //       const cr = await prisma.carriage.upsert({
// // //         where:  { number_trainId: { number: c.carriageNumber, trainId: Number(trainNumbers[0]) } },
// // //         update: {},
// // //         create: {
// // //           number:  c.carriageNumber,
// // //           type:    c.carriageType,
// // //           trainId: (await prisma.train.findUnique({ where: { number: trainNumbers[0] } }))!.id,
// // //         },
// // //       });
// // //       await prisma.requestCarriage.create({
// // //         data: {
// // //           requestId:     request.id,
// // //           carriageId:    cr.id,
// // //           carriagePhoto: carriagePhotoMap[i] ?? null,
// // //         },
// // //       });
// // //     }
// // //
// // //     // 7) Связь Request ↔ Equipment + фотографии
// // //     if (id) {
// // //       await prisma.requestEquipment.deleteMany({ where: { requestId: request.id } });
// // //     }
// // //     for (let i = 0; i < equipment.length; i++) {
// // //       const e = equipment[i];
// // //       // Находим существующее оборудование по ID
// // //       const eq = await prisma.equipment.findUnique({
// // //         where: { id: Number(e.equipmentId) },
// // //       });
// // //       if (!eq) {
// // //         throw new Error(`Equipment with id=${e.equipmentId} not found`);
// // //       }
// // //       // Тип работ для этой строчки
// // //       const tw = await prisma.typeWork.upsert({
// // //         where:  { name: e.typeWork },
// // //         update: {},
// // //         create: { name: e.typeWork },
// // //       });
// // //       const reqEq = await prisma.requestEquipment.create({
// // //         data: {
// // //           requestId:   request.id,
// // //           equipmentId: eq.id,
// // //           typeWorkId:  tw.id,
// // //           quantity:    e.quantity,
// // //         },
// // //       });
// // //       // Фотографии оборудования
// // //       const photosMap = equipmentPhotoMap[i] || {};
// // //       for (const [photoType, relPath] of Object.entries(photosMap)) {
// // //         await prisma.requestEquipmentPhoto.create({
// // //           data: {
// // //             requestEquipmentId: reqEq.id,
// // //             photoType,
// // //             photoPath: relPath,
// // //           },
// // //         });
// // //       }
// // //     }
// // //
// // //     // 8) Отдаем полный запрос с вложениями
// // //     const full = await prisma.request.findUnique({
// // //       where: { id: request.id },
// // //       include: {
// // //         requestTrains:    { include: { train: true } },
// // //         requestCarriages: { include: { carriage: { include: { train: true } } } },
// // //         requestEquipments: {
// // //           include: {
// // //             typeWork:  true,
// // //             photos:    true,
// // //             equipment: { include: { device: true } },
// // //           },
// // //         },
// // //         completedJob:    true,
// // //         currentLocation: true,
// // //         user:            true,
// // //       },
// // //     });
// // //
// // //     return res
// // //         .status(id ? 200 : 201)
// // //         .json({ success: true, data: full });
// // //   } catch (error) {
// // //     console.error("Ошибка createApplication:", error);
// // //     // при ошибке — удаляем все записанные файлы
// // //     await Promise.all(cleanupPaths.map(p => fs.unlink(p).catch(() => {})));
// // //     return res
// // //         .status(500)
// // //         .json({ success: false, message: "Internal error" });
// // //   } finally {
// // //     await prisma.$disconnect();
// // //   }
// // // };
// //
// // import { Request, Response } from "express";
// // import { PrismaClient } from "@prisma/client";
// // import path from "path";
// // import { v4 as uuidv4 } from "uuid";
// // import fs from "fs/promises";
// //
// // const prisma = new PrismaClient();
// // const UPLOAD_ROOT = path.join(__dirname, "../../../uploads");
// // const REQUEST_DIR = "request";
// // const CARRIAGE_DIR = "carriage";
// // const EQUIP_DIR = "equipment";
// //
// // // Mapping form-field keys to subfolders under uploads/equipment
// // const equipmentPhotoTypeMap: Record<string, string> = {
// //   equipmentPhoto: "equipment",
// //   serialPhoto:    "serial",
// //   macPhoto:       "mac",
// // };
// //
// // async function generateUniqueFilename(
// //     dir: string,
// //     ext: string,
// //     scope: "request" | "carriage" | "equipment"
// // ): Promise<string> {
// //   let name: string;
// //   let fullPath: string;
// //   let relPath: string;
// //   do {
// //     name = uuidv4() + ext;
// //     fullPath = path.join(dir, name);
// //     relPath = path.relative(UPLOAD_ROOT, fullPath);
// //
// //     try {
// //       await fs.access(fullPath);
// //       continue; // collision on disk
// //     } catch {}
// //
// //     // collision in DB
// //     if (scope === "request") {
// //       if (await prisma.request.findFirst({ where: { photo: relPath } })) continue;
// //     } else if (scope === "carriage") {
// //       if (await prisma.requestCarriage.findFirst({ where: { carriagePhoto: relPath } })) continue;
// //     } else {
// //       if (await prisma.requestEquipmentPhoto.findFirst({ where: { photoPath: relPath } })) continue;
// //     }
// //     break;
// //   } while (true);
// //
// //   return name;
// // }
// //
// // export const createApplication = async (req: Request, res: Response) => {
// //   const cleanupPaths: string[] = [];
// //   try {
// //     console.log("=== createApplication body:", req.body);
// //
// //     // 1) Extract scalar fields
// //     const {
// //       id: idStr,
// //       completedJob,
// //       currentLocation,
// //       userId: userIdStr,
// //       status = "completed",
// //     } = req.body as Record<string, string>;
// //
// //     const id     = idStr       ? Number(idStr)      : undefined;
// //     const userId = userIdStr   ? Number(userIdStr)  : undefined;
// //     if (!userId) {
// //       return res.status(400).json({ success: false, message: "userId обязателен" });
// //     }
// //
// //     // 2) Reconstruct trainNumbers[]
// //     const tnLen = parseInt(req.body.trainNumbersLength || "0", 10);
// //     const trainNumbers: string[] = [];
// //     for (let i = 0; i < tnLen; i++) {
// //       const v = req.body[`trainNumbers[${i}]`];
// //       if (v) trainNumbers.push(v);
// //     }
// //
// //     // 3) Reconstruct carriages[] with nested equipment[]
// //     const cLen = parseInt(req.body.carriagesLength || "0", 10);
// //     const carriagePhotoMap: Record<number, string>             = {};
// //     const equipmentPhotoMap: Record<string, Record<string,string>> = {};
// //     const files = (req.files as Express.Multer.File[]) || [];
// //
// //     // first, save all incoming files to disk and fill those maps
// //     for (const file of files) {
// //       const ext = path.extname(file.originalname) || "";
// //       // — request-level photo
// //       if (file.fieldname === "photo") {
// //         const dir = path.join(UPLOAD_ROOT, REQUEST_DIR);
// //         await fs.mkdir(dir, { recursive: true });
// //         const fname = await generateUniqueFilename(dir, ext, "request");
// //         const full  = path.join(dir, fname);
// //         await fs.writeFile(full, file.buffer);
// //         cleanupPaths.push(full);
// //         // store relative path
// //         req.body._requestPhoto = path.relative(UPLOAD_ROOT, full).split(path.sep).join("/");
// //       }
// //       // — carriage photos
// //       const mCar = file.fieldname.match(/^carriages\[(\d+)\]\[carriagePhoto\]$/);
// //       if (mCar) {
// //         const idx = Number(mCar[1]);
// //         const dir = path.join(UPLOAD_ROOT, CARRIAGE_DIR);
// //         await fs.mkdir(dir, { recursive: true });
// //         const fname = await generateUniqueFilename(dir, ext, "carriage");
// //         const full  = path.join(dir, fname);
// //         await fs.writeFile(full, file.buffer);
// //         cleanupPaths.push(full);
// //         carriagePhotoMap[idx] = path.relative(UPLOAD_ROOT, full).split(path.sep).join("/");
// //       }
// //       // — equipment photos
// //       const mEq = file.fieldname.match(/^carriages\[(\d+)\]\[equipment\]\[(\d+)\]\[photos\]\[(\w+)\]$/);
// //       if (mEq) {
// //         const ci = Number(mEq[1]), ei = Number(mEq[2]), key = mEq[3]; // equipmentPhoto|serialPhoto|macPhoto
// //         const sub = equipmentPhotoTypeMap[key];
// //         const dir = path.join(UPLOAD_ROOT, EQUIP_DIR, sub);
// //         await fs.mkdir(dir, { recursive: true });
// //         const fname = await generateUniqueFilename(dir, ext, "equipment");
// //         const full  = path.join(dir, fname);
// //         await fs.writeFile(full, file.buffer);
// //         cleanupPaths.push(full);
// //         const mapKey = `${ci}_${ei}`;
// //         equipmentPhotoMap[mapKey] = equipmentPhotoMap[mapKey] || {};
// //         equipmentPhotoMap[mapKey][key] = path.relative(UPLOAD_ROOT, full).split(path.sep).join("/");
// //       }
// //     }
// //
// //     // 4) Now rebuild arrays
// //     const carriages: Array<{
// //       carriageNumber: string;
// //       carriageType:   string;
// //       carriagePhoto?: string;
// //       equipment: Array<{
// //         equipmentName: string;
// //         serialNumber:  string;
// //         macAddress?:   string;
// //         typeWork:      string;
// //         quantity:      number;
// //         photos?: {
// //           equipmentPhoto?: string;
// //           serialPhoto?:    string;
// //           macPhoto?:       string;
// //         };
// //       }>;
// //     }> = [];
// //
// //     for (let i = 0; i < cLen; i++) {
// //       const number = req.body[`carriages[${i}][carriageNumber]`];
// //       const type   = req.body[`carriages[${i}][carriageType]`];
// //       const photoP = carriagePhotoMap[i] ?? undefined;
// //       const eqLen  = parseInt(req.body[`carriages[${i}][equipmentLength]`] || "0", 10);
// //
// //       const equipmentArr = [];
// //       for (let j = 0; j < eqLen; j++) {
// //         const prefix = `carriages[${i}][equipment][${j}]`;
// //         const mapKey = `${i}_${j}`;
// //         equipmentArr.push({
// //           equipmentName: req.body[`${prefix}[equipmentName]`],
// //           serialNumber:  req.body[`${prefix}[serialNumber]`],
// //           macAddress:    req.body[`${prefix}[macAddress]`] || undefined,
// //           typeWork:      req.body[`${prefix}[typeWork]`],
// //           quantity:      parseInt(req.body[`${prefix}[quantity]`], 10) || 1,
// //           photos:        equipmentPhotoMap[mapKey] || {},
// //         });
// //       }
// //
// //       carriages.push({
// //         carriageNumber: number,
// //         carriageType:   type,
// //         carriagePhoto:  photoP,
// //         equipment:      equipmentArr,
// //       });
// //     }
// //     console.log("REBUILT CARRIAGES:", JSON.stringify(carriages, null,2));
// //
// //     // 5) Validation
// //     const requestPhotoRel = (req.body._requestPhoto as string) || null;
// //     if (status === "completed") {
// //       if (
// //           trainNumbers.length === 0 ||
// //           carriages.length === 0 ||
// //           carriages.every(c => c.equipment.length === 0) ||
// //           !completedJob ||
// //           !currentLocation
// //       ) {
// //         return res.status(400).json({
// //           success: false,
// //           message:
// //               "Для completed обязательны trainNumbers, carriages (с equipment), completedJob и currentLocation",
// //         });
// //       }
// //       for (const c of carriages) {
// //         if (!c.carriageNumber || !c.carriageType) {
// //           return res.status(400).json({
// //             success: false,
// //             message: "В carriages обязательны carriageNumber и carriageType",
// //           });
// //         }
// //       }
// //     }
// //
// //     // 6) Upsert reference tables
// //     const [cjRec, locRec] = await Promise.all([
// //       completedJob
// //           ? prisma.completedJob.upsert({
// //             where:  { name: completedJob },
// //             update: {},
// //             create: { name: completedJob },
// //           })
// //           : Promise.resolve(null),
// //       currentLocation
// //           ? prisma.currentLocation.upsert({
// //             where:  { name: currentLocation },
// //             update: {},
// //             create: { name: currentLocation },
// //           })
// //           : Promise.resolve(null),
// //     ]);
// //
// //     // 7) Create / update Request
// //     const requestData: any = {
// //       status,
// //       userId,
// //       completedJobId:    cjRec?.id   ?? null,
// //       currentLocationId: locRec?.id  ?? null,
// //       photo:             requestPhotoRel,
// //     };
// //     const request = id
// //         ? await prisma.request.update({ where: { id }, data: requestData })
// //         : await prisma.request.create({ data: requestData });
// //
// //     // 8) Link Trains
// //     if (id) {
// //       await prisma.requestTrain.deleteMany({ where: { requestId: request.id } });
// //     }
// //     for (const tn of trainNumbers) {
// //       const tr = await prisma.train.upsert({
// //         where:  { number: tn },
// //         update: {},
// //         create: { number: tn },
// //       });
// //       await prisma.requestTrain.create({
// //         data: { requestId: request.id, trainId: tr.id },
// //       });
// //     }
// //
// //     // 9) Link Carriages
// //     if (id) {
// //       await prisma.requestCarriage.deleteMany({ where: { requestId: request.id } });
// //     }
// //     for (let i = 0; i < carriages.length; i++) {
// //       const c = carriages[i];
// //       const tr = await prisma.train.findFirst({ where: { number: trainNumbers[0] } });
// //       const cr = await prisma.carriage.upsert({
// //         where:  { number_trainId: { number: c.carriageNumber, trainId: tr!.id } },
// //         update: {},
// //         create: {
// //           number:  c.carriageNumber,
// //           type:    c.carriageType,
// //           trainId: tr!.id,
// //         },
// //       });
// //       await prisma.requestCarriage.create({
// //         data: {
// //           requestId:    request.id,
// //           carriageId:   cr.id,
// //           carriagePhoto: c.carriagePhoto ?? null,
// //         },
// //       });
// //     }
// //
// //     // 10) Link Equipment + photos
// //     if (id) {
// //       await prisma.requestEquipment.deleteMany({ where: { requestId: request.id } });
// //     }
// //     for (let i = 0; i < carriages.length; i++) {
// //       for (const e of carriages[i].equipment) {
// //         // find or create TypeWork
// //         const tw = await prisma.typeWork.upsert({
// //           where:  { name: e.typeWork },
// //           update: {},
// //           create: { name: e.typeWork },
// //         });
// //         // assume equipment already exists by name or serial; you can adapt as needed
// //         const eqRec = await prisma.equipment.findFirst({
// //           where: { serialNumber: e.serialNumber },
// //         });
// //         if (!eqRec) {
// //           throw new Error(`Equipment with serial=${e.serialNumber} not found`);
// //         }
// //         const reqEq = await prisma.requestEquipment.create({
// //           data: {
// //             requestId:   request.id,
// //             equipmentId: eqRec.id,
// //             typeWorkId:  tw.id,
// //             quantity:    e.quantity,
// //           },
// //         });
// //         // now photos
// //         const mapKey = `${i}_${carriages[i].equipment.indexOf(e)}`;
// //         const photos = equipmentPhotoMap[mapKey] || {};
// //         for (const [ptype, relPath] of Object.entries(photos)) {
// //           await prisma.requestEquipmentPhoto.create({
// //             data: {
// //               requestEquipmentId: reqEq.id,
// //               photoType:          ptype,
// //               photoPath:          relPath,
// //             },
// //           });
// //         }
// //       }
// //     }
// //
// //     // 11) Return full object
// //     const full = await prisma.request.findUnique({
// //       where: { id: request.id },
// //       include: {
// //         requestTrains:    { include: { train: true } },
// //         requestCarriages: { include: { carriage: { include: { train: true } } } },
// //         requestEquipments:{
// //           include:{
// //             typeWork:true,
// //             photos:true,
// //             equipment:{ include:{ device:true } }
// //           }
// //         },
// //         completedJob:    true,
// //         currentLocation: true,
// //         user:            true,
// //       },
// //     });
// //
// //     return res.status(id ? 200 : 201).json({ success: true, data: full });
// //   } catch (error) {
// //     console.error("Ошибка createApplication:", error);
// //     // cleanup any files we wrote
// //     await Promise.all(cleanupPaths.map(p => fs.unlink(p).catch(() => {})));
// //     return res.status(500).json({ success: false, message: "Internal error" });
// //   } finally {
// //     await prisma.$disconnect();
// //   }
// // };
// //
//
// import { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs/promises";
//
// const prisma = new PrismaClient();
// const UPLOAD_ROOT = path.join(__dirname, "../../../uploads");
// const REQUEST_DIR = "request";
// const CARRIAGE_DIR = "carriage";
// const EQUIP_DIR = "equipment";
//
// // Mapping form-field keys to subfolders under uploads/equipment
// const equipmentPhotoTypeMap: Record<string, string> = {
//   equipmentPhoto: "equipment",
//   serialPhoto:    "serial",
//   macPhoto:       "mac",
// };
//
// /**
//  * Генерирует уникальное имя файла (UUID + расширение),
//  * проверяет отсутствие коллизий на диске и в БД.
//  */
// async function generateUniqueFilename(
//     dir: string,
//     ext: string,
//     scope: "request" | "carriage" | "equipment"
// ): Promise<string> {
//   let name: string;
//   let fullPath: string;
//   let relPath: string;
//
//   do {
//     name = uuidv4() + ext;
//     fullPath = path.join(dir, name);
//     relPath = path.relative(UPLOAD_ROOT, fullPath);
//
//     // Если файл уже есть на диске — пробуем заново
//     try {
//       await fs.access(fullPath);
//       continue;
//     } catch {}
//
//     // Проверка коллизий в БД
//     if (scope === "request") {
//       if (await prisma.request.findFirst({ where: { photo: relPath } })) continue;
//     } else if (scope === "carriage") {
//       if (await prisma.requestCarriage.findFirst({ where: { carriagePhoto: relPath } })) continue;
//     } else {
//       if (await prisma.requestEquipmentPhoto.findFirst({ where: { photoPath: relPath } })) continue;
//     }
//
//     break;
//   } while (true);
//
//   return name;
// }
//
// export const createApplication = async (req: Request, res: Response) => {
//   const cleanupPaths: string[] = [];
//
//   try {
//     console.log("=== createApplication body:", req.body);
//
//     // 1) Extract scalar fields
//     const {
//       id: idStr,
//       completedJob,
//       currentLocation,
//       userId: userIdStr,
//       status = "completed",
//     } = req.body as Record<string, string>;
//
//     const id     = idStr     ? Number(idStr)     : undefined;
//     const userId = userIdStr ? Number(userIdStr) : undefined;
//     if (!userId) {
//       return res.status(400).json({ success: false, message: "userId обязателен" });
//     }
//
//     // 2) Собираем trainNumbers[]
//     let trainNumbers: string[] = [];
//     if (Array.isArray(req.body.trainNumbers)) {
//       trainNumbers = req.body.trainNumbers as string[];
//     } else {
//       const tnLen = parseInt(req.body.trainNumbersLength || "0", 10);
//       for (let i = 0; i < tnLen; i++) {
//         const v = req.body[`trainNumbers[${i}]`];
//         if (v) trainNumbers.push(v);
//       }
//     }
//
//     // 3) Сохраняем все файлы и собираем карты путей
//     const carriagePhotoMap: Record<number, string> = {};
//     const equipmentPhotoMap: Record<string, Record<string,string>> = {};
//     const files = (req.files as Express.Multer.File[]) || [];
//
//     for (const file of files) {
//       const ext = path.extname(file.originalname) || "";
//
//       // — фото самой заявки
//       if (file.fieldname === "photo") {
//         const dir = path.join(UPLOAD_ROOT, REQUEST_DIR);
//         await fs.mkdir(dir, { recursive: true });
//         const fname = await generateUniqueFilename(dir, ext, "request");
//         const full  = path.join(dir, fname);
//         await fs.writeFile(full, file.buffer);
//         cleanupPaths.push(full);
//         req.body._requestPhoto = path
//             .relative(UPLOAD_ROOT, full)
//             .split(path.sep)
//             .join("/");
//         continue;
//       }
//
//       // — фото вагонов
//       const mCar = file.fieldname.match(/^carriages\[(\d+)\]\[carriagePhoto\]$/);
//       if (mCar) {
//         const idx = Number(mCar[1]);
//         const dir = path.join(UPLOAD_ROOT, CARRIAGE_DIR);
//         await fs.mkdir(dir, { recursive: true });
//         const fname = await generateUniqueFilename(dir, ext, "carriage");
//         const full  = path.join(dir, fname);
//         await fs.writeFile(full, file.buffer);
//         cleanupPaths.push(full);
//         carriagePhotoMap[idx] = path
//             .relative(UPLOAD_ROOT, full)
//             .split(path.sep)
//             .join("/");
//         continue;
//       }
//
//       // — фото оборудования
//       const mEq = file.fieldname.match(
//           /^carriages\[(\d+)\]\[equipment\]\[(\d+)\]\[photos\]\[(\w+)\]$/
//       );
//       if (mEq) {
//         const ci = Number(mEq[1]), ei = Number(mEq[2]), key = mEq[3];
//         const sub = equipmentPhotoTypeMap[key];
//         const dir = path.join(UPLOAD_ROOT, EQUIP_DIR, sub);
//         await fs.mkdir(dir, { recursive: true });
//         const fname = await generateUniqueFilename(dir, ext, "equipment");
//         const full  = path.join(dir, fname);
//         await fs.writeFile(full, file.buffer);
//         cleanupPaths.push(full);
//         const mapKey = `${ci}_${ei}`;
//         equipmentPhotoMap[mapKey] = equipmentPhotoMap[mapKey] || {};
//         equipmentPhotoMap[mapKey][key] = path
//             .relative(UPLOAD_ROOT, full)
//             .split(path.sep)
//             .join("/");
//       }
//     }
//
//     // 4) Собираем carriages прямо из req.body.carriages
//     const rawCarriages = Array.isArray((req.body as any).carriages)
//         ? (req.body as any).carriages
//         : [];
//     const carriages = rawCarriages.map((c: any, i: number) => ({
//       carriageNumber: c.carriageNumber,
//       carriageType:   c.carriageType,
//       carriagePhoto:  carriagePhotoMap[i] ?? undefined,
//       equipment: Array.isArray(c.equipment)
//           ? (c.equipment as any[]).map((e, j) => ({
//             equipmentName: e.equipmentName,
//             serialNumber:  e.serialNumber,
//             macAddress:    e.macAddress ?? undefined,
//             typeWork:      e.typeWork,
//             quantity:      Number(e.quantity) || 1,
//             photos:        equipmentPhotoMap[`${i}_${j}`] || {},
//           }))
//           : [],
//     }));
//
//     // 5) Валидация
//     const requestPhotoRel = (req.body._requestPhoto as string) || null;
//     if (status === "completed") {
//       if (
//           trainNumbers.length === 0 ||
//           carriages.length === 0 ||
//           carriages.every((c: any) => c.equipment.length === 0) ||
//           !completedJob ||
//           !currentLocation
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//               "Для completed обязательны trainNumbers, carriages (с equipment), completedJob и currentLocation",
//         });
//       }
//       for (const c of carriages) {
//         if (!c.carriageNumber || !c.carriageType) {
//           return res.status(400).json({
//             success: false,
//             message: "В carriages обязательны carriageNumber и carriageType",
//           });
//         }
//       }
//     }
//
//     // 6) Upsert справочников
//     const [cjRec, locRec] = await Promise.all([
//       completedJob
//           ? prisma.completedJob.upsert({
//             where:  { name: completedJob },
//             update: {},
//             create: { name: completedJob },
//           })
//           : Promise.resolve(null),
//       currentLocation
//           ? prisma.currentLocation.upsert({
//             where:  { name: currentLocation },
//             update: {},
//             create: { name: currentLocation },
//           })
//           : Promise.resolve(null),
//     ]);
//
//     // 7) Создаём/обновляем Request
//     const requestData: any = {
//       status,
//       userId,
//       completedJobId:    cjRec?.id   ?? null,
//       currentLocationId: locRec?.id  ?? null,
//       photo:             requestPhotoRel,
//     };
//     const request = id
//         ? await prisma.request.update({ where: { id }, data: requestData })
//         : await prisma.request.create({ data: requestData });
//
//     // 8) Link Trains
//     if (id) {
//       await prisma.requestTrain.deleteMany({ where: { requestId: request.id } });
//     }
//     for (const tn of trainNumbers) {
//       const tr = await prisma.train.upsert({
//         where:  { number: tn },
//         update: {},
//         create: { number: tn },
//       });
//       await prisma.requestTrain.create({
//         data: { requestId: request.id, trainId: tr.id },
//       });
//     }
//
//     // 9) Link Carriages
//     if (id) {
//       await prisma.requestCarriage.deleteMany({ where: { requestId: request.id } });
//     }
//     for (const c of carriages) {
//       const tr = await prisma.train.findFirst({ where: { number: trainNumbers[0] } });
//       const cr = await prisma.carriage.upsert({
//         where:  { number_trainId: { number: c.carriageNumber, trainId: tr!.id } },
//         update: {},
//         create: {
//           number:  c.carriageNumber,
//           type:    c.carriageType,
//           trainId: tr!.id,
//         },
//       });
//       await prisma.requestCarriage.create({
//         data: {
//           requestId:    request.id,
//           carriageId:   cr.id,
//           carriagePhoto: c.carriagePhoto ?? null,
//         },
//       });
//     }
//
//     // 10) Link Equipment + photos
//     if (id) {
//       await prisma.requestEquipment.deleteMany({ where: { requestId: request.id } });
//     }
//     for (let i = 0; i < carriages.length; i++) {
//       for (const e of carriages[i].equipment) {
//         // upsert TypeWork
//         const tw = await prisma.typeWork.upsert({
//           where:  { name: e.typeWork },
//           update: {},
//           create: { name: e.typeWork },
//         });
//         // find existing Equipment by serial
//         const eqRec = await prisma.equipment.findFirst({
//           where: { serialNumber: e.serialNumber },
//         });
//         if (!eqRec) {
//           throw new Error(`Equipment with serial=${e.serialNumber} not found`);
//         }
//         const reqEq = await prisma.requestEquipment.create({
//           data: {
//             requestId:   request.id,
//             equipmentId: eqRec.id,
//             typeWorkId:  tw.id,
//             quantity:    e.quantity,
//           },
//         });
//         // photos
//         const mapKey = `${i}_${carriages[i].equipment.indexOf(e)}`;
//         const photos = equipmentPhotoMap[mapKey] || {};
//         for (const [ptype, relPath] of Object.entries(photos)) {
//           await prisma.requestEquipmentPhoto.create({
//             data: {
//               requestEquipmentId: reqEq.id,
//               photoType:          ptype,
//               photoPath:          relPath,
//             },
//           });
//         }
//       }
//     }
//
//     // 11) Вернём полную заявку
//     const full = await prisma.request.findUnique({
//       where: { id: request.id },
//       include: {
//         requestTrains:    { include: { train: true } },
//         requestCarriages: { include: { carriage: { include: { train: true } } } },
//         requestEquipments:{
//           include:{
//             typeWork: true,
//             photos:   true,
//             equipment:{ include:{ device:true } }
//           }
//         },
//         completedJob:    true,
//         currentLocation: true,
//         user:            true,
//       },
//     });
//
//     return res
//         .status(id ? 200 : 201)
//         .json({ success: true, data: full });
//
//   } catch (error) {
//     console.error("Ошибка createApplication:", error);
//     // удалить все записанные файлы при ошибке
//     await Promise.all(cleanupPaths.map(p => fs.unlink(p).catch(() => {})));
//     return res.status(500).json({ success: false, message: "Internal error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// };

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";

const prisma = new PrismaClient();
const UPLOAD_ROOT = path.join(__dirname, "../../../uploads");
const REQUEST_DIR  = "request";
const CARRIAGE_DIR = "carriage";
const EQUIP_DIR    = "equipment";

const equipmentPhotoTypeMap: Record<string, string> = {
  equipmentPhoto: "equipment",
  serialPhoto:    "serial",
  macPhoto:       "mac",
};

async function generateUniqueFilename(
    dir: string,
    ext: string,
    scope: "request" | "carriage" | "equipment"
): Promise<string> {
  let name: string, fullPath: string, relPath: string;
  do {
    name = uuidv4() + ext;
    fullPath = path.join(dir, name);
    relPath   = path.relative(UPLOAD_ROOT, fullPath);
    try {
      await fs.access(fullPath);
      continue;
    } catch {}
    if (scope === "request") {
      if (await prisma.request.findFirst({ where: { photo: relPath } })) continue;
    } else if (scope === "carriage") {
      if (await prisma.requestCarriage.findFirst({ where: { carriagePhoto: relPath } })) continue;
    } else {
      if (await prisma.requestEquipmentPhoto.findFirst({ where: { photoPath: relPath } })) continue;
    }
    break;
  } while (true);
  return name;
}

export const createApplication = async (req: Request, res: Response) => {
  const cleanupPaths: string[] = [];
  try {
    console.log("=== createApplication body:", req.body);

    // 1) scalar fields
    const {
      id: idStr,
      completedJob,
      currentLocation,
      userId: userIdStr,
      status = "completed"
    } = req.body as Record<string, string>;

    const id     = idStr     ? Number(idStr)     : undefined;
    const userId = userIdStr ? Number(userIdStr) : undefined;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId обязателен" });
    }

    // 2) trainNumbers[]
    let trainNumbers: string[] = [];
    if (Array.isArray((req.body as any).trainNumbers)) {
      trainNumbers = (req.body as any).trainNumbers;
    } else {
      const tnLen = parseInt(req.body.trainNumbersLength || "0", 10);
      for (let i = 0; i < tnLen; i++) {
        const v = req.body[`trainNumbers[${i}]`];
        if (v) trainNumbers.push(v);
      }
    }

    // 3) сохраняем файлы
    const carriagePhotoMap: Record<number, string> = {};
    const equipmentPhotoMap: Record<string, Record<string,string>> = {};
    const files = (req.files as Express.Multer.File[]) || [];
    for (const file of files) {
      const ext = path.extname(file.originalname) || "";
      if (file.fieldname === "photo") {
        const dir = path.join(UPLOAD_ROOT, REQUEST_DIR);
        await fs.mkdir(dir, { recursive: true });
        const fname = await generateUniqueFilename(dir, ext, "request");
        const full  = path.join(dir, fname);
        await fs.writeFile(full, file.buffer);
        cleanupPaths.push(full);
        req.body._requestPhoto = path.relative(UPLOAD_ROOT, full).split(path.sep).join("/");
        continue;
      }
      const mCar = file.fieldname.match(/^carriages\[(\d+)\]\[carriagePhoto\]$/);
      if (mCar) {
        const idx = Number(mCar[1]);
        const dir = path.join(UPLOAD_ROOT, CARRIAGE_DIR);
        await fs.mkdir(dir, { recursive: true });
        const fname = await generateUniqueFilename(dir, ext, "carriage");
        const full  = path.join(dir, fname);
        await fs.writeFile(full, file.buffer);
        cleanupPaths.push(full);
        carriagePhotoMap[idx] = path.relative(UPLOAD_ROOT, full).split(path.sep).join("/");
        continue;
      }
      const mEq = file.fieldname.match(
          /^carriages\[(\d+)\]\[equipment\]\[(\d+)\]\[photos\]\[(\w+)\]$/
      );
      if (mEq) {
        const ci = Number(mEq[1]), ei = Number(mEq[2]), key = mEq[3];
        const sub = equipmentPhotoTypeMap[key];
        const dir = path.join(UPLOAD_ROOT, EQUIP_DIR, sub);
        await fs.mkdir(dir, { recursive: true });
        const fname = await generateUniqueFilename(dir, ext, "equipment");
        const full  = path.join(dir, fname);
        await fs.writeFile(full, file.buffer);
        cleanupPaths.push(full);
        const mapKey = `${ci}_${ei}`;
        equipmentPhotoMap[mapKey] = equipmentPhotoMap[mapKey] || {};
        equipmentPhotoMap[mapKey][key] = path.relative(UPLOAD_ROOT, full).split(path.sep).join("/");
      }
    }

    // 4) собираем carriages из req.body
    const rawCarriages = Array.isArray((req.body as any).carriages)
        ? (req.body as any).carriages
        : [];
    const carriages = rawCarriages.map((c: any, i: number) => ({
      carriageNumber: c.carriageNumber,
      carriageType:   c.carriageType,
      carriagePhoto:  carriagePhotoMap[i] ?? undefined,
      equipment: Array.isArray(c.equipment)
          ? c.equipment.map((e: any, j: number) => ({
            equipmentName: e.equipmentName,
            serialNumber:  e.serialNumber,
            macAddress:    e.macAddress ?? undefined,
            typeWork:      e.typeWork,
            quantity:      Number(e.quantity) || 1,
            photos:        equipmentPhotoMap[`${i}_${j}`] || {},
          }))
          : [],
    }));

    // 5) валидация
    const requestPhotoRel = (req.body._requestPhoto as string) || null;
    if (status === "completed") {
      if (
          trainNumbers.length === 0 ||
          carriages.length === 0 ||
          carriages.every((c: any) => c.equipment.length === 0) ||
          !completedJob ||
          !currentLocation
      ) {
        return res.status(400).json({
          success: false,
          message:
              "Для completed обязательны trainNumbers, carriages (с equipment), completedJob и currentLocation"
        });
      }
      for (const c of carriages) {
        if (!c.carriageNumber || !c.carriageType) {
          return res.status(400).json({
            success: false,
            message: "В carriages обязательны carriageNumber и carriageType"
          });
        }
      }
    }

    // 6) upsert справочников
    const [cjRec, locRec] = await Promise.all([
      completedJob
          ? prisma.completedJob.upsert({ where: { name: completedJob }, update: {}, create: { name: completedJob } })
          : Promise.resolve(null),
      currentLocation
          ? prisma.currentLocation.upsert({ where: { name: currentLocation }, update: {}, create: { name: currentLocation } })
          : Promise.resolve(null),
    ]);

    // 7) создаём/обновляем Request
    const requestData: any = {
      status,
      userId,
      completedJobId:    cjRec?.id   ?? null,
      currentLocationId: locRec?.id  ?? null,
      photo:             requestPhotoRel
    };
    const request = id
        ? await prisma.request.update({ where: { id }, data: requestData })
        : await prisma.request.create({ data: requestData });

    // 8) link Trains
    if (id) {
      await prisma.requestTrain.deleteMany({ where: { requestId: request.id } });
    }
    for (const tn of trainNumbers) {
      const tr = await prisma.train.upsert({
        where:  { number: tn },
        update: {},
        create: { number: tn }
      });
      await prisma.requestTrain.create({ data: { requestId: request.id, trainId: tr.id } });
    }

    // 9) link Carriages
    if (id) {
      await prisma.requestCarriage.deleteMany({ where: { requestId: request.id } });
    }
    for (const c of carriages) {
      const tr = await prisma.train.findFirst({ where: { number: trainNumbers[0] } });
      const cr = await prisma.carriage.upsert({
        where:  { number_trainId: { number: c.carriageNumber, trainId: tr!.id } },
        update: {},
        create: {
          number:  c.carriageNumber,
          type:    c.carriageType,
          trainId: tr!.id
        }
      });
      await prisma.requestCarriage.create({
        data: {
          requestId:    request.id,
          carriageId:   cr.id,
          carriagePhoto: c.carriagePhoto ?? null
        }
      });
    }

    // 10) link Equipment + photos (здесь исправлено!)
    if (id) {
      await prisma.requestEquipment.deleteMany({ where: { requestId: request.id } });
    }
    for (let i = 0; i < carriages.length; i++) {
      for (const e of carriages[i].equipment) {
        // 10.1) upsert TypeWork
        const tw = await prisma.typeWork.upsert({
          where:  { name: e.typeWork },
          update: {},
          create: { name: e.typeWork }
        });

        // 10.2) найти или создать запись в Equipment
        let eqRec = await prisma.equipment.findFirst({
          where: { serialNumber: e.serialNumber }
        });
        if (!eqRec) {
          // создаём Device по имени оборудования, если нужно
          eqRec = await prisma.equipment.create({
            data: {
              name:         e.equipmentName,
              serialNumber: e.serialNumber,
              macAddress:   e.macAddress ?? null
            }
          });
        }

        // 10.3) связь RequestEquipment
        const reqEq = await prisma.requestEquipment.create({
          data: {
            requestId:   request.id,
            equipmentId: eqRec.id,
            typeWorkId:  tw.id,
          }
        });

        // 10.4) фотографии оборудования
        const mapKey = `${i}_${carriages[i].equipment.indexOf(e)}`;
        const photos = equipmentPhotoMap[mapKey] || {};
        for (const [ptype, relPath] of Object.entries(photos)) {
          await prisma.requestEquipmentPhoto.create({
            data: {
              requestEquipmentId: reqEq.id,
              photoType:          ptype,
              photoPath:          relPath
            }
          });
        }
      }
    }

    // 11) вернуть полную заявку
    const full = await prisma.request.findUnique({
      where: { id: request.id },
      include: {
        requestTrains:    { include: { train: true } },
        requestCarriages: { include: { carriage: { include: { train: true } } } },
        requestEquipments:{
          include:{
            typeWork: true,
            photos:   true,
            equipment:true
          }
        },
        completedJob:    true,
        currentLocation: true,
        user:            true
      }
    });

    return res
        .status(id ? 200 : 201)
        .json({ success: true, data: full });

  } catch (error) {
    console.error("Ошибка createApplication:", error);
    // cleanup any files we wrote
    await Promise.all(cleanupPaths.map(p => fs.unlink(p).catch(() => {})));
    return res.status(500).json({ success: false, message: "Internal error" });
  } finally {
    await prisma.$disconnect();
  }
};
