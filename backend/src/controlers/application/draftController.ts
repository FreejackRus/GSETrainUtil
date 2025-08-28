import {
  PrismaClient,
  CarriagePhotoType,
  EquipmentPhotoType,
  RequestStatus,
} from "@prisma/client";
import { Request, Response } from "express";
import { createApplication } from "./createApplication";

const prisma = new PrismaClient();

type EquipmentPhoto = { type: EquipmentPhotoType; path: string };

interface EquipmentDetail {
  id: number;
  name: string;
  typeWork: string;
  serialNumber: string;
  macAddress: string;
  photos: EquipmentPhoto[];
}

interface CarriageWithEquipment {
  number: string;
  type: string;
  train: string; // номер поезда из rt.train.number
  photo: string | null; // первое фото типа 'carriage' (если есть)
  generalPhotoEquipmentCarriage: string | null;
  equipment: EquipmentDetail[];
}

interface ApplicationSummary {
  id: number;
  photo: null; // общего фото заявки в новой схеме нет — всегда null для совместимости
  status: RequestStatus;
  trainNumbers: string[];
  carriages: CarriageWithEquipment[];
  countEquipment: number;
  performer: string;
  currentLocation: string;
  user: { id: number; name: string; role: string };
  createdAt: string;
  updatedAt: string;
}

/** Форматируем заявку в плоскую структуру (поезда -> вагоны -> оборудование) */
function formatApplication(r: any): ApplicationSummary {
  // сгруппировать оборудование по requestCarriageId
  const equipmentByRcId: Record<number, EquipmentDetail[]> = {};
  for (const re of r.requestEquipments as any[]) {
    const rcId = re.requestCarriageId as number;
    const detail: EquipmentDetail = {
      id: re.id,
      name: re.equipment?.name ?? "—",
      typeWork: re.typeWork?.name ?? "—",
      serialNumber: re.equipment?.serialNumber ?? "—",
      macAddress: re.equipment?.macAddress ?? "—",
      photos: (re.photos ?? []).map((p: any) => ({
        type: p.photoType,
        path: p.photoPath,
      })),
    };
    (equipmentByRcId[rcId] ||= []).push(detail);
  }

  const carriages: CarriageWithEquipment[] = [];
  for (const rt of r.requestTrains as any[]) {
    const trainNum = rt.train?.number ?? "—";
    for (const rc of rt.requestCarriages as any[]) {
      const firstCarriagePhoto =
        (rc.carriagePhotos ?? []).find(
          (p: any) => p.photoType === CarriagePhotoType.carriage
        )?.photoPath ?? null;
      const secondCarriagePhoto =
        (rc.carriagePhotos ?? []).find(
          (p: any) => p.photoType === CarriagePhotoType.equipment
        )?.photoPath ?? null;
      carriages.push({
        number: rc.carriage.number,
        type: rc.carriage.type,
        train: trainNum,
        photo: firstCarriagePhoto,
        generalPhotoEquipmentCarriage: secondCarriagePhoto,
        equipment: equipmentByRcId[rc.id] ?? [],
      });
    }
  }

  const trainNumbers: string[] = (r.requestTrains as any[])
    .map((rt: any) => rt.train?.number)
    .filter((x: string | undefined): x is string => Boolean(x));

  return {
    id: r.id,
    photo: null,
    status: r.status,
    trainNumbers,
    carriages,
    countEquipment: (r.requestEquipments as any[]).length,
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

/** GET /drafts — список черновиков */
export const getDrafts = async (req: Request, res: Response) => {
  try {
    // TODO: брать userId/userRole из JWT
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const userRole = (req.query.userRole as string) || "engineer";

    if (userRole === "admin") {
      // текущая бизнес-логика: админ не видит черновики
      return res.status(200).json({ success: true, data: [] });
    }

    const where: any = { status: "draft" as RequestStatus };
    if (userRole === "engineer" && userId) {
      where.userId = userId;
    }

    const raws = await prisma.request.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
            equipment: true,
          },
        },
        currentLocation: true,
        performer: true,
        user: true,
      },
    });

    const data = raws.map(formatApplication);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error("Ошибка при получении черновиков:", e);
    return res
      .status(500)
      .json({ success: false, message: "Внутренняя ошибка сервера" });
  }
};

/** POST /drafts/:id/complete — завершить черновик по новой иерархии */
// export const completeDraft = async (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   if (isNaN(id)) {
//     return res.status(400).json({ success: false, message: "Некорректный ID" });
//   }

//   try {
//     const existing = await prisma.request.findUnique({ where: { id } });
//     if (!existing) {
//       return res.status(404).json({ success: false, message: "Черновик не найден" });
//     }
//     if (existing.status !== "draft") {
//       return res.status(400).json({ success: false, message: "Можно завершить только черновики" });
//     }

//     // ожидаем ИЕРАРХИЧЕСКОЕ тело:
//     // {
//     //   performer: "Бригада А",
//     //   currentLocation: "Депо-1",
//     //   userId?: 2,
//     //   requestTrains: [
//     //     {
//     //       trainNumber: "123",
//     //       carriages: [
//     //         {
//     //           carriageNumber: "001",
//     //           carriageType: "Плацкарт",
//     //           carriagePhotos?: { carriage?: "uploads/...", equipment?: "uploads/..." },
//     //           equipments: [
//     //             {
//     //               equipmentName: "Роутер",
//     //               serialNumber: "SN1",
//     //               macAddress: "AA:BB:..",
//     //               typeWork: "Монтаж",
//     //               photos: [{ type: "equipment"|"serial"|"mac", path: "uploads/..." }]
//     //             }
//     //           ]
//     //         }
//     //       ]
//     //     }
//     //   ]
//     // }
//     const { performer, currentLocation, userId, requestTrains = [] } = req.body ?? {};
//     console.log(req.body);

//     // Валидация
//     if (
//         !performer ||
//         !currentLocation ||
//         !Array.isArray(requestTrains) ||
//         requestTrains.length === 0 ||
//         requestTrains.every((t: any) => !t.carriages || t.carriages.length === 0) ||
//         requestTrains.every((t: any) =>
//             t.carriages?.every((c: any) => !c.equipments || c.equipments.length === 0)
//         )
//     ) {
//       return res.status(400).json({ success: false, message: "Не все обязательные поля заполнены" });
//     }

//     // upsert справочников
//     const [perfRec, locRec] = await Promise.all([
//       prisma.performer.upsert({ where: { name: performer }, update: {}, create: { name: performer } }),
//       prisma.currentLocation.upsert({ where: { name: currentLocation }, update: {}, create: { name: currentLocation } }),
//     ]);

//     // пересобираем всё древо в транзакции
//     const result = await prisma.$transaction(async (tx) => {
//       // обновляем «шапку» заявки
//       await tx.request.update({
//         where: { id },
//         data: {
//           status: "completed",
//           performerId: perfRec.id,
//           currentLocationId: locRec.id,
//           userId: userId ?? existing.userId,
//         },
//       });

//       // сначала удалить оборудование, затем поезда (каскадом удалит вагоны и их фото)
//       await tx.requestEquipment.deleteMany({ where: { requestId: id } });
//       await tx.requestTrain.deleteMany({ where: { requestId: id } });

//       // создать всю иерархию
//       for (const t of requestTrains as any[]) {
//         // Train
//         const train = await tx.train.upsert({
//           where: { number: t.trainNumber },
//           update: {},
//           create: { number: t.trainNumber },
//         });

//         // RequestTrain
//         const rt = await tx.requestTrain.create({
//           data: { requestId: id, trainId: train.id },
//         });

//         // Carriages
//         for (const c of (t.carriages ?? []) as any[]) {
//           // Carriage (в новой схеме без связки к поезду)
//           const carriage = await tx.carriage.upsert({
//             where: { number: c.carriageNumber },
//             update: { type: c.carriageType },
//             create: { number: c.carriageNumber, type: c.carriageType },
//           });

//           // RequestCarriage
//           const rc = await tx.requestCarriage.create({
//             data: { requestTrainId: rt.id, carriageId: carriage.id },
//           });

//           // Фото вагона
//           const cp = (c.carriagePhotos ?? {}) as Record<"carriage" | "equipment", string | undefined>;
//           if (cp.carriage) {
//             await tx.requestCarriagePhoto.create({
//               data: { requestCarriageId: rc.id, photoType: CarriagePhotoType.carriage, photoPath: cp.carriage },
//             });
//           }
//           if (cp.equipment) {
//             await tx.requestCarriagePhoto.create({
//               data: { requestCarriageId: rc.id, photoType: CarriagePhotoType.equipment, photoPath: cp.equipment },
//             });
//           }

//           // Equipments
//           for (const e of (c.equipments ?? []) as any[]) {
//             // TypeWork
//             const tw = await tx.typeWork.upsert({
//               where: { name: e.typeWork },
//               update: {},
//               create: { name: e.typeWork },
//             });

//             // Equipment по уникальным полям
//             let eq = null;
//             if (e.serialNumber) {
//               eq = await tx.equipment.findUnique({ where: { serialNumber: e.serialNumber } });
//             }
//             if (!eq && e.macAddress) {
//               eq = await tx.equipment.findUnique({ where: { macAddress: e.macAddress } });
//             }
//             if (!eq) {
//               eq = await tx.equipment.create({
//                 data: {
//                   name: e.equipmentName,
//                   serialNumber: e.serialNumber ?? null,
//                   macAddress: e.macAddress ?? null,
//                 },
//               });
//             }

//             // RequestEquipment (нужен requestCarriageId)
//             const reqEq = await tx.requestEquipment.create({
//               data: {
//                 requestId: id,
//                 requestCarriageId: rc.id,
//                 equipmentId: eq.id,
//                 typeWorkId: tw.id,
//               },
//             });

//             // Фото оборудования — строго enum: equipment|serial|mac
//             for (const p of (e.photos ?? []) as any[]) {
//               if (!["equipment", "serial", "mac"].includes(p.type)) {
//                 throw new Error(`Недопустимый тип фото оборудования: ${p.type}`);
//               }
//               await tx.requestEquipmentPhoto.create({
//                 data: {
//                   requestEquipmentId: reqEq.id,
//                   photoType: p.type as EquipmentPhotoType,
//                   photoPath: p.path,
//                 },
//               });
//             }
//           }
//         }
//       }

//       // вернуть полную заявку
//       return tx.request.findUnique({
//         where: { id },
//         include: {
//           requestTrains: {
//             include: {
//               train: true,
//               requestCarriages: {
//                 include: { carriage: true, carriagePhotos: true },
//               },
//             },
//           },
//           requestEquipments: {
//             include: {
//               typeWork: true,
//               photos: true,
//               equipment: true,
//             },
//           },
//           currentLocation: true,
//           performer: true,
//           user: true,
//         },
//       });
//     });

//     const data = formatApplication(result);
//     return res.status(200).json({ success: true, data });
//   } catch (e) {
//     console.error("Ошибка при завершении черновика:", e);
//     return res.status(500).json({ success: false, message: "Внутренняя ошибка сервера" });
//   }
// };
export const completeDraft = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ success: false, message: "Некорректный ID" });

  try {
    const existing = await prisma.request.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Черновик не найден" });
    if (existing.status !== "draft")
      return res
        .status(400)
        .json({ success: false, message: "Можно завершить только черновики" });

    // Копируем тело запроса и подставляем id и status для createApplication
    const newReq = {
      ...req,
      body: {
        ...req.body,
        id: id.toString(),
        status: "completed",
        userId: req.body.userId ?? existing.userId,
      },
    } as Request;

    // Вызываем createApplication
    return await createApplication(newReq, res);
  } catch (error) {
    console.error("Ошибка completeDraft:", error);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/** DELETE /drafts/:id — удалить черновик */
export const deleteDraft = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "Некорректный ID" });
  }

  try {
    const existing = await prisma.request.findUnique({
      where: { id },
      include: { requestEquipments: true }, // чтобы сразу получить список оборудования
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Черновик не найден" });
    }
    if (existing.status !== RequestStatus.draft) {
      return res
        .status(400)
        .json({ success: false, message: "Можно удалить только черновики" });
    }

    // IDs оборудования, которое было в этом черновике
    const equipmentIds = existing.requestEquipments.map((e) => e.equipmentId);

    await prisma.request.delete({ where: { id } });

    if (equipmentIds.length > 0) {
      const stillLinked = await prisma.requestEquipment.findMany({
        where: { equipmentId: { in: equipmentIds } },
        select: { equipmentId: true },
      });

      const stillLinkedIds = new Set(stillLinked.map((e) => e.equipmentId));
      const toDelete = equipmentIds.filter((id) => !stillLinkedIds.has(id));

      if (toDelete.length > 0) {
        const deleted = await prisma.equipment.deleteMany({
          where: {
            id: { in: toDelete },
          },
        });
        console.log(`Удалено оборудования: ${deleted.count} шт.`);
      }
    }
    return res.status(200).json({
      success: true,
      message: "Черновик и неиспользуемое оборудование удалены",
    });
  } catch (e) {
    console.error("Ошибка при удалении черновика:", e);
    return res
      .status(500)
      .json({ success: false, message: "Внутренняя ошибка сервера" });
  }
};
