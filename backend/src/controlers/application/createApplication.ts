import { Request, Response } from "express";
import {
  PrismaClient,
  EquipmentPhotoType,
  CarriagePhotoType,
  RequestStatus,
} from "@prisma/client";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import { safeJoinUpload, toRelUploadPath } from "../../config/uploads";

const prisma = new PrismaClient();

const CARRIAGE_DIR = "carriage"; // uploads/carriage/{carriage|equipment}
const EQUIP_DIR = "equipment"; // uploads/equipment/{equipment|serial|mac}

const ALLOWED_EQUIP_PHOTO_KEYS: EquipmentPhotoType[] = [
  "equipment",
  "serial",
  "mac",
];

function isAllowedEquipKey(k: string): k is EquipmentPhotoType {
  return (ALLOWED_EQUIP_PHOTO_KEYS as string[]).includes(k);
}

/** генерим уникальное имя в каталоге и проверяем, что такого пути нет в БД */
async function generateUniqueFilename(
  absDir: string,
  ext: string,
  scope: "carriage" | "equipment"
): Promise<{ name: string; relPath: string; fullPath: string }> {
  while (true) {
    const name = uuidv4() + ext;
    const fullPath = path.join(absDir, name);
    const relPath = toRelUploadPath(fullPath); // относительный POSIX-путь для БД

    try {
      await fs.access(fullPath); // файл существует — пробуем ещё
      continue;
    } catch {}

    if (scope === "carriage") {
      const exists = await prisma.requestCarriagePhoto.findFirst({
        where: { photoPath: relPath },
      });
      if (exists) continue;
    } else {
      const exists = await prisma.requestEquipmentPhoto.findFirst({
        where: { photoPath: relPath },
      });
      if (exists) continue;
    }
    return { name, relPath, fullPath };
  }
}

export const createApplication = async (req: Request, res: Response) => {
  const cleanupPaths: string[] = [];

  try {
    // 1) Скалярные поля
    const {
      id: idStr,
      currentLocation,
      performer,
      userId: userIdStr,
      status = "completed",
    } = req.body as Record<string, string>;

    const id = idStr ? Number(idStr) : undefined;
    const userId = userIdStr ? Number(userIdStr) : undefined;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId обязателен" });
    }

    // 2) requestTrains[] с иерархией
    // const rawTrains = Array.isArray((req.body as any).requestTrains)
    //     ? (req.body as any).requestTrains
    //     : Array.isArray((req.body as any).trains)
    //         ? (req.body as any).trains
    //         : [];
    //
    // console.log('reqT', (req.body as any).requestTrains);
    // console.log('T', (req.body as any).trains);
    // console.log('rawTrains:', rawTrains);

    let rawTrains: any[] = [];
    const rt = (req.body as any).requestTrains ?? (req.body as any).trains;

    if (Array.isArray(rt)) {
      rawTrains = rt;
    } else if (typeof rt === "string") {
      try {
        const parsed = JSON.parse(rt);
        if (Array.isArray(parsed)) rawTrains = parsed;
      } catch {}
    }

    console.log("rawTrains:", rawTrains);

    type ParsedTrain = {
      trainNumber: string;
      carriages: Array<{
        carriageNumber: string;
        carriageType: string;
        carriagePhotos: Partial<Record<"carriage" | "equipment", string>>;
        equipments: Array<{
          equipmentName: string;
          serialNumber: string | null;
          macAddress: string | null;
          typeWork: string;
          photos: Partial<Record<EquipmentPhotoType, string>>;
        }>;
      }>;
    };

    // 3) Разбор файлов (пишем в каталоги из config/uploads)
    const carriagePhotosMap: Record<
      string,
      Partial<Record<"carriage" | "equipment", string>>
    > = {};
    const equipmentPhotosMap: Record<
      string,
      Partial<Record<EquipmentPhotoType, string>>
    > = {};

    const files = (req.files as Express.Multer.File[]) || [];
    for (const file of files) {
      const ext = path.extname(file.originalname) || "";

      // --- фото вагонов ---
      const mCar = file.fieldname.match(
        /^(requestTrains|trains)\[(\d+)\]\[carriages\]\[(\d+)\]\[carriagePhotos\]\[(carriage|equipment)\]$/
      );
      if (mCar) {
        const t = Number(mCar[2]);
        const c = Number(mCar[3]);
        const kind = mCar[4] as "carriage" | "equipment";

        const absDir = safeJoinUpload(CARRIAGE_DIR, kind);
        await fs.mkdir(absDir, { recursive: true });

        const { fullPath, relPath } = await generateUniqueFilename(
          absDir,
          ext,
          "carriage"
        );
        await fs.writeFile(fullPath, file.buffer);
        cleanupPaths.push(fullPath);

        const key = `${t}_${c}`;
        carriagePhotosMap[key] = carriagePhotosMap[key] || {};
        carriagePhotosMap[key][kind] = relPath;
        continue;
      }

      // --- фото оборудования ---
      const mEq = file.fieldname.match(
        /^(requestTrains|trains)\[(\d+)\]\[carriages\]\[(\d+)\]\[equipments\]\[(\d+)\]\[photos\]\[(\w+)\]$/
      );
      if (mEq) {
        const t = Number(mEq[2]);
        const c = Number(mEq[3]);
        const e = Number(mEq[4]);
        const rawKey = mEq[5];

        if (!isAllowedEquipKey(rawKey)) {
          return res.status(400).json({
            success: false,
            message: `Недопустимый тип фото оборудования '${rawKey}'. Разрешено: equipment|serial|mac`,
          });
        }

        const absDir = safeJoinUpload(EQUIP_DIR, rawKey);
        await fs.mkdir(absDir, { recursive: true });

        const { fullPath, relPath } = await generateUniqueFilename(
          absDir,
          ext,
          "equipment"
        );
        await fs.writeFile(fullPath, file.buffer);
        cleanupPaths.push(fullPath);

        const key = `${t}_${c}_${e}`;
        equipmentPhotosMap[key] = equipmentPhotosMap[key] || {};
        equipmentPhotosMap[key][rawKey] = relPath;
        continue;
      }

      // любые другие поля — игнорируем
    }

    // 4) Нормализация тела
    const trains: ParsedTrain[] = rawTrains.map((rt: any, ti: number) => ({
      trainNumber: rt.trainNumber,
      carriages: Array.isArray(rt.carriages)
        ? rt.carriages.map((c: any, ci: number) => ({
            carriageNumber: c.carriageNumber,
            carriageType: c.carriageType,
            carriagePhotos: carriagePhotosMap[`${ti}_${ci}`] || {},
            equipments: Array.isArray(c.equipments)
              ? c.equipments.map((e: any, ei: number) => ({
                  equipmentName: e.equipmentName,
                  serialNumber: e.serialNumber ?? null,
                  macAddress: e.macAddress ?? null,
                  typeWork: e.typeWork,
                  photos: equipmentPhotosMap[`${ti}_${ci}_${ei}`] || {},
                }))
              : [],
          }))
        : [],
    }));

    // 5) Валидация
    const isCompleted = (status as RequestStatus) === "completed";
    if (isCompleted) {
      if (
        trains.length === 0 ||
        trains.every((t) => t.carriages.length === 0) ||
        trains.every((t) =>
          t.carriages.every((c) => c.equipments.length === 0)
        ) ||
        !performer ||
        !currentLocation
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Для completed обязательны requestTrains с вагонами и оборудованием, а также performer и currentLocation",
        });
      }
      for (const t of trains) {
        if (!t.trainNumber) {
          return res.status(400).json({
            success: false,
            message: "У каждого поезда обязателен trainNumber",
          });
        }
        for (const c of t.carriages) {
          if (!c.carriageNumber || !c.carriageType) {
            return res.status(400).json({
              success: false,
              message:
                "В каждом вагоне обязательны carriageNumber и carriageType",
            });
          }
        }
      }
    }

    // 6) upsert: Performer / CurrentLocation
    const [perfRec, locRec] = await Promise.all([
      performer
        ? prisma.performer.upsert({
            where: { name: performer },
            update: {},
            create: { name: performer },
          })
        : Promise.resolve(null),
      currentLocation
        ? prisma.currentLocation.upsert({
            where: { name: currentLocation },
            update: {},
            create: { name: currentLocation },
          })
        : Promise.resolve(null),
    ]);

    // 7) Request
    const requestData = {
      status: status as RequestStatus,
      userId,
      performerId: perfRec?.id ?? null,
      currentLocationId: locRec?.id ?? null,
    };

    const request = id
      ? await prisma.request.update({ where: { id }, data: requestData })
      : await prisma.request.create({ data: requestData });

    // 8) Пересборка связей при обновлении
    if (id) {
      await prisma.requestEquipment.deleteMany({
        where: { requestId: request.id },
      });
      await prisma.requestTrain.deleteMany({
        where: { requestId: request.id },
      });
    }

    // 9) Создание поездов/вагонов/оборудования с фото
    for (const t of trains) {
      const tr = await prisma.train.upsert({
        where: { number: t.trainNumber },
        update: {},
        create: { number: t.trainNumber },
      });

      const rt = await prisma.requestTrain.create({
        data: { requestId: request.id, trainId: tr.id },
      });

      for (const c of t.carriages) {
        const carriage = await prisma.carriage.upsert({
          where: { number: c.carriageNumber },
          update: { type: c.carriageType },
          create: { number: c.carriageNumber, type: c.carriageType },
        });

        const rc = await prisma.requestCarriage.create({
          data: { requestTrainId: rt.id, carriageId: carriage.id },
        });

        // фото вагона
        for (const kind of ["carriage", "equipment"] as const) {
          const rel = c.carriagePhotos[kind];
          if (!rel) continue;
          await prisma.requestCarriagePhoto.create({
            data: {
              requestCarriageId: rc.id,
              photoType:
                kind === "carriage"
                  ? CarriagePhotoType.carriage
                  : CarriagePhotoType.equipment,
              photoPath: rel,
            },
          });
        }

        // оборудование
        for (const e of c.equipments) {
          const tw = await prisma.typeWork.upsert({
            where: { name: e.typeWork },
            update: {},
            create: { name: e.typeWork },
          });

          let eqRec = null;

          if (e.serialNumber) {
            eqRec = await prisma.equipment.findUnique({
              where: { serialNumber: e.serialNumber },
            });
          }
          if (!eqRec && e.macAddress) {
            eqRec = await prisma.equipment.findUnique({
              where: { macAddress: e.macAddress },
            });
          }
          const isDraft = request.status === RequestStatus.draft;

          // Флаг: нужно ли привязывать оборудование к вагону
          const shouldLinkCarriage =
            !isDraft && e.typeWork.toLowerCase() === "монтаж";

          if (!eqRec) {
            // создаём новую запись
            eqRec = await prisma.equipment.create({
              data: {
                name: e.equipmentName,
                serialNumber: e.serialNumber,
                macAddress: e.macAddress,
                carriageId: shouldLinkCarriage ? carriage.id : null,
                lastService: new Date(),
              },
            });
          } else {
            // обновляем существующую запись
            if (
              eqRec.name !== e.equipmentName ||
              eqRec.serialNumber !== e.serialNumber ||
              eqRec.macAddress !== e.macAddress
            ) {
              eqRec = await prisma.equipment.update({
                where: { id: eqRec.id },
                data: {
                  name: e.equipmentName,
                  serialNumber: e.serialNumber,
                  macAddress: e.macAddress,
                  ...(isDraft
                    ? {}
                    : {
                        carriageId: shouldLinkCarriage ? carriage.id : null,
                        lastService: new Date(),
                      }),
                },
              });
            }
          }

          const reqEq = await prisma.requestEquipment.create({
            data: {
              requestId: request.id,
              requestCarriageId: rc.id,
              equipmentId: eqRec.id,
              typeWorkId: tw.id,
            },
          });

          for (const tkey of ALLOWED_EQUIP_PHOTO_KEYS) {
            const rel = e.photos[tkey];
            if (!rel) continue;
            await prisma.requestEquipmentPhoto.create({
              data: {
                requestEquipmentId: reqEq.id,
                photoType: tkey,
                photoPath: rel,
              },
            });
          }
        }
      }
    }

    // 10) ответ
    const full = await prisma.request.findUnique({
      where: { id: request.id },
      include: {
        requestTrains: {
          include: {
            train: true,
            requestCarriages: {
              include: { carriage: true, carriagePhotos: true },
            },
          },
        },
        requestEquipments: {
          include: {
            typeWork: true,
            photos: true,
            equipment: { include: { carriage: true } },
            requestCarriage: {
              include: {
                carriage: true,
                requestTrain: { include: { train: true } },
              },
            },
          },
        },
        currentLocation: true,
        performer: true,
        user: true,
      },
    });

    return res.status(id ? 200 : 201).json({ success: true, data: full });
  } catch (error) {
    console.error("Ошибка createApplication:", error);
    await Promise.all(cleanupPaths.map((p) => fs.unlink(p).catch(() => {})));
    return res.status(500).json({ success: false, message: "Internal error" });
  } finally {
    await prisma.$disconnect();
  }
};
