import { Request, Response } from "express";
import {
  PrismaClient,
  EquipmentPhotoType,
  CarriagePhotoType,
  RequestStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

// /** ВСПОМОГАТЕЛЬНОЕ ФОРМАТИРОВАНИЕ */
// function formatRequest(r: any) {
//   // Номера поездов в заявке
//   const trainNumbers: string[] = r.requestTrains.map((rt: any) => rt.train.number);
//
//   // Вагоны: теперь берём из каждого requestTrain.requestCarriages
//   const carriages = r.requestTrains.flatMap((rt: any) =>
//       rt.requestCarriages.map((rc: any) => {
//         const photo =
//             rc.carriagePhotos.find(
//                 (p: any) => p.photoType === CarriagePhotoType.carriage
//             )?.photoPath ?? null;
//
//         return {
//           number: rc.carriage.number,
//           type: rc.carriage.type,
//           train: rt.train.number,
//           photo, // фото номера вагона (если есть)
//         };
//       })
//   );
//
//   // Оборудование: берём с привязкой к вагону в рамках заявки (через requestCarriage)
//   const equipmentDetails = r.requestEquipments.map((re: any) => ({
//     id: re.id,
//     name: re.equipment?.name ?? "—",
//     typeWork: re.typeWork?.name ?? "—",
//     serialNumber: re.equipment?.serialNumber ?? "—",
//     macAddress: re.equipment?.macAddress ?? "—",
//     // Предпочитаем номер вагона, выбранного в заявке
//     carriageNumber:
//         re.requestCarriage?.carriage?.number ??
//         re.equipment?.carriage?.number ??
//         "—",
//     photos: re.photos.map((p: any) => ({
//       type: p.photoType, // equipment | serial | mac
//       path: p.photoPath,
//     })),
//   }));
//
//   const allPhotos = equipmentDetails.flatMap((d: any) => d.photos);
//   const getByType = (type: EquipmentPhotoType) =>
//       allPhotos.filter((p: any) => p.type === type).map((p: any) => p.path);
//
//   return {
//     id: r.id,
//     photo: null, // в новой схеме нет общего фото заявки — оставляем null для совместимости
//     status: r.status,
//     trainNumbers,
//     carriages,
//     equipmentDetails,
//     countEquipment: r.requestEquipments.length,
//     equipmentTypes: equipmentDetails.map((d: any) => d.typeWork),
//     serialNumbers: equipmentDetails.map((d: any) => d.serialNumber),
//     macAddresses: equipmentDetails.map((d: any) => d.macAddress),
//     equipmentPhoto: getByType(EquipmentPhotoType.equipment)[0] ?? null,
//     equipmentPhotos: getByType(EquipmentPhotoType.equipment),
//     serialPhoto: getByType(EquipmentPhotoType.serial)[0] ?? null,
//     serialPhotos: getByType(EquipmentPhotoType.serial),
//     macPhoto: getByType(EquipmentPhotoType.mac)[0] ?? null,
//     macPhotos: getByType(EquipmentPhotoType.mac),
//
//     performer: r.performer?.name ?? "—",
//     currentLocation: r.currentLocation?.name ?? "—",
//     user: {
//       id: r.userId,
//       name: r.user?.name ?? "—",
//       role: r.user?.role ?? "—",
//     },
//     createdAt: r.createdAt.toISOString(),
//     updatedAt: r.updatedAt.toISOString(),
//   };
// }

/** Выбираем «обложку» заявки:
 *  1) первый поезд → первый вагон → фото 'carriage' или 'equipment'
 *  2) если нет — ищем первое фото по всем вагонам заявки
 */
function pickCoverPhoto(r: any): string | null {
  // попытка №1: первый вагон первого поезда
  const firstRt = r.requestTrains?.[0];
  const firstRc = firstRt?.requestCarriages?.[0];
  if (firstRc?.carriagePhotos?.length) {
    const pCar = firstRc.carriagePhotos.find(
      (p: any) => p.photoType === CarriagePhotoType.carriage
    )?.photoPath;
    const pEq = firstRc.carriagePhotos.find(
      (p: any) => p.photoType === CarriagePhotoType.equipment
    )?.photoPath;
    if (pCar || pEq) return pCar || pEq || null;
  }

  // попытка №2: любое первое фото по всем вагонам заявки
  for (const rt of r.requestTrains || []) {
    for (const rc of rt.requestCarriages || []) {
      const pCar = rc.carriagePhotos?.find(
        (p: any) => p.photoType === CarriagePhotoType.carriage
      )?.photoPath;
      const pEq = rc.carriagePhotos?.find(
        (p: any) => p.photoType === CarriagePhotoType.equipment
      )?.photoPath;
      if (pCar || pEq) return pCar || pEq || null;
    }
  }
  return null;
}

/** ВСПОМОГАТЕЛЬНОЕ ФОРМАТИРОВАНИЕ */
function formatRequest(r: any) {
  const trainNumbers: string[] = r.requestTrains.map(
    (rt: any) => rt.train.number
  );

  const carriages = r.requestTrains.flatMap((rt: any) =>
    rt.requestCarriages.map((rc: any) => {
      const firstCarriagePhoto =
        (rc.carriagePhotos ?? []).find(
          (p: any) => p.photoType === CarriagePhotoType.carriage
        )?.photoPath ?? null;
      const secondCarriagePhoto =
        (rc.carriagePhotos ?? []).find(
          (p: any) => p.photoType === CarriagePhotoType.equipment
        )?.photoPath ?? null;
      return {
        number: rc.carriage.number,
        type: rc.carriage.type,
        train: rt.train.number,
        photo: firstCarriagePhoto,
        generalPhotoEquipmentCarriage: secondCarriagePhoto,
      };
    })
  );

  const equipmentDetails = r.requestEquipments.map((re: any) => ({
    id: re.id,
    name: re.equipment?.name ?? "—",
    typeWork: re.typeWork?.name ?? "—",
    serialNumber: re.equipment?.serialNumber ?? "—",
    macAddress: re.equipment?.macAddress ?? "—",
    carriageNumber:
      re.requestCarriage?.carriage?.number ??
      re.equipment?.carriage?.number ??
      "—",
    photos: re.photos.map((p: any) => ({
      type: p.photoType as EquipmentPhotoType,
      path: p.photoPath,
    })),
  }));

  const allPhotos = equipmentDetails.flatMap((d: any) => d.photos);
  const getByType = (type: EquipmentPhotoType) =>
    allPhotos.filter((p: any) => p.type === type).map((p: any) => p.path);

  return {
    id: r.id,
    // вот здесь вместо null:
    photo: pickCoverPhoto(r),
    status: r.status,
    trainNumbers,
    carriages,
    equipmentDetails,
    countEquipment: r.requestEquipments.length,
    equipmentTypes: equipmentDetails.map((d: any) => d.typeWork),
    serialNumbers: equipmentDetails.map((d: any) => d.serialNumber),
    macAddresses: equipmentDetails.map((d: any) => d.macAddress),
    equipmentPhoto: getByType(EquipmentPhotoType.equipment)[0] ?? null,
    equipmentPhotos: getByType(EquipmentPhotoType.equipment),
    serialPhoto: getByType(EquipmentPhotoType.serial)[0] ?? null,
    serialPhotos: getByType(EquipmentPhotoType.serial),
    macPhoto: getByType(EquipmentPhotoType.mac)[0] ?? null,
    macPhotos: getByType(EquipmentPhotoType.mac),

    performer: r.performer?.name ?? "—",
    currentLocation: r.currentLocation?.name ?? "—",
    user: {
      id: r.userId,
      name: r.user?.name ?? "—",
      role: r.user?.role ?? "—",
    },
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** GET /work-log — список */
export const getWorkLog = async (_req: Request, res: Response) => {
  try {
    const entries = await prisma.request.findMany({
      include: {
        requestTrains: {
          include: {
            train: true,
            requestCarriages: {
              include: {
                carriage: true,
                carriagePhotos: true, // фото вагона в рамках заявки
              },
            },
          },
        },
        // Берём оборудование на уровне заявки, включая привязку к вагону в заявке
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
      orderBy: { createdAt: "desc" },
    });

    const formatted = entries.map(formatRequest);
    return res.json({ success: true, data: formatted });
  } catch (e) {
    console.error("Ошибка при получении журнала работ:", e);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/** GET /work-log/:id — детально */
export const getWorkLogById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const r = await prisma.request.findUnique({
      where: { id: Number(id) },
      include: {
        requestTrains: {
          include: {
            train: true,
            requestCarriages: {
              include: {
                carriage: true,
                carriagePhotos: true,
              },
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

    if (!r) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, data: formatRequest(r) });
  } catch (e) {
    console.error("Ошибка при получении записи журнала работ:", e);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/**
 * PUT /work-log/:id — обновление заявки.
 *
 * ОЖИДАЕМЫЙ ФОРМАТ ТЕЛА (пример):
 * {
 *   "status": "completed",                      // draft | completed
 *   "currentLocation": "Депо-1",
 *   "performer": "Бригада А",
 *   "userId": 2,
 *   "requestTrains": [
 *     {
 *       "trainId": 10,
 *       "carriages": [
 *         {
 *           "carriageId": 101,
 *           "carriagePhotos": [
 *             { "type": "carriage", "path": "/photos/carr-101.jpg" }
 *           ],
 *           "equipments": [
 *             {
 *               "equipmentId": 5001,
 *               "typeWork": "Монтаж",
 *               "photos": [
 *                 { "type": "equipment", "path": "/photos/eq-5001.jpg" },
 *                 { "type": "serial",    "path": "/photos/serial-5001.jpg" },
 *                 { "type": "mac",       "path": "/photos/mac-5001.jpg" }
 *               ]
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export const updateWorkLogById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const {
    status, // 'draft' | 'completed'
    currentLocation, // string (name)
    performer, // string (name)
    userId,
    requestTrains = [],
  } = req.body ?? {};

  try {
    const [loc, perf] = await Promise.all([
      currentLocation
        ? prisma.currentLocation.findUnique({
            where: { name: currentLocation },
          })
        : Promise.resolve(null),
      performer
        ? prisma.performer.findUnique({ where: { name: performer } })
        : Promise.resolve(null),
    ]);

    const updated = await prisma.request.update({
      where: { id: Number(id) },
      data: {
        status: status as RequestStatus, // валидные значения: 'draft' | 'completed'
        currentLocationId: loc?.id ?? null,
        performerId: perf?.id ?? null,
        userId,

        // Полностью переопределяем поезда/вагоны/оборудование для заявки
        // Удаляем всё старое — каскады очистят дочерние связи
        requestEquipments: { deleteMany: {} },
        requestTrains: {
          deleteMany: {},
          create: (requestTrains as any[]).map((rt) => ({
            trainId: rt.trainId,
            requestCarriages: {
              create: (rt.carriages ?? []).map((c: any) => ({
                carriageId: c.carriageId,
                // Фото вагона в рамках заявки
                carriagePhotos: {
                  create: (c.carriagePhotos ?? []).map((p: any) => ({
                    photoType: p.type as CarriagePhotoType, // 'carriage' | 'equipment'
                    photoPath: p.path,
                  })),
                },
                // Оборудование, установленное/обслуженное в ЭТОМ вагоне в рамках ЭТОЙ заявки
                requestEquipments: {
                  create: (c.equipments ?? []).map((e: any) => ({
                    // В RequestEquipment требуется requestId — задаём явно
                    requestId: Number(id),
                    equipment: { connect: { id: e.equipmentId } },
                    // Привязка к типу работ по имени
                    typeWork: { connect: { name: e.typeWork } },
                    photos: {
                      create: (e.photos ?? []).map((p: any) => ({
                        photoType: p.type as EquipmentPhotoType, // 'equipment' | 'serial' | 'mac'
                        photoPath: p.path,
                      })),
                    },
                  })),
                },
              })),
            },
          })),
        },
      },
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

    return res.json({ success: true, data: formatRequest(updated) });
  } catch (e) {
    console.error("Ошибка при обновлении записи журнала работ:", e);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};
