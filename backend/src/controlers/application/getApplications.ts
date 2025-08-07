// import { PrismaClient } from "@prisma/client";
// import { Request, Response } from "express";

// const prisma = new PrismaClient();

// export const getApplications = async (req: Request, res: Response) => {
//   const prisma = new PrismaClient();
//   try {
//     // Фильтрация по userId (опционально)
//     const userId = req.query.userId ? Number(req.query.userId) : undefined;
//     const where: any = {};
//     if (userId) where.userId = userId;

//     // Забираем заявки вместе с поездами, вагонами, оборудованием и самими вагонами оборудования
//     const raws = await prisma.request.findMany({
//       where,
//       orderBy: { createdAt: "desc" },
//       include: {
//         requestTrains:    { include: { train: true } },
//         requestCarriages: { include: { carriage: { include: { train: true } } } },
//         requestEquipments: {
//           include: {
//             typeWork:  true,
//             photos:    true,
//             equipment: {
//               include: {
//                 device:  true,
//                 carriage:{ include: { train: true } }  // добавляем связь equipment→carriage
//               }
//             },
//           }
//         },
//         completedJob:    true,
//         currentLocation: true,
//         user:            true,
//       }
//     });

//     const data = raws.map(r => {
//       // Все номера поездов
//       const trainNumbers = r.requestTrains.map(rt => rt.train.number);

//       // Перебираем вагоны и группируем под ними оборудование
//       const carriages = r.requestCarriages.map(rc => {
//         const { carriage, carriagePhoto } = rc;
//         // Отбираем requestEquipments, у которых оборудование привязано к этому вагону
//         const equipmentInThisCarriage = r.requestEquipments
//           .filter(re => re.equipment?.carriageId === carriage.id)
//           .map(re => ({
//             id:           re.id,
//             name:         re.equipment?.name             || "—",
//             deviceType:   re.equipment?.device?.name     || "—",
//             typeWork:     re.typeWork?.name              || "—",
//             serialNumber: re.equipment?.serialNumber     || "—",
//             macAddress:   re.equipment?.macAddress       || "—",
//             quantity:     re.quantity,
//             photos:       re.photos.map(p => ({
//               type: p.photoType,
//               path: p.photoPath,
//             })),
//           }));

//         return {
//           number:  carriage.number,
//           type:    carriage.type,
//           train:   carriage.train.number,
//           photo:   carriagePhoto || null,
//           equipment: equipmentInThisCarriage,     // вложили оборудование
//         };
//       });

//       // Если вам всё-таки нужен плоский список всего оборудования:
//       const allEquipment = r.requestEquipments.map(re => ({
//         id:           re.id,
//         name:         re.equipment?.name || "—",
//         carriageId:   re.equipment?.carriageId,
//       }));

//       return {
//         id:              r.id,
//         photo:           r.photo || null,
//         status:          r.status,
//         trainNumbers,
//         carriages,       // теперь под каждым вагоном — его оборудование
//         // при желании можно убрать allEquipment
//         allEquipment,    
//         completedJob:    r.completedJob?.name    || "—",
//         currentLocation: r.currentLocation?.name || "—",
//         user: {
//           id:   r.userId,
//           name: r.user?.name  || "—",
//           role: r.user?.role  || "—",
//         },
//         createdAt:       r.createdAt.toISOString(),
//         updatedAt:       r.updatedAt.toISOString(),
//       };
//     });

//     return res.status(200).json({ success: true, data });
//   } catch (error) {
//     console.error("Ошибка при получении заявок:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Внутренняя ошибка сервера"
//     });
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// // GET /application/:id
// export const getApplicationById = async (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   if (isNaN(id)) {
//     return res.status(400).json({ success: false, message: "Некорректный ID" });
//   }

//   try {
//     const r = await prisma.request.findUnique({
//       where: { id },
//       include: {
//         requestTrains:    { include: { train: true } },
//         requestCarriages: { include: { carriage: { include: { train: true } } } },
//         requestEquipments: {
//           include: {
//             typeWork: true,
//             photos:   true,
//             equipment: {
//               include: {
//                 device:  true,
//                 carriage:{ include: { train: true } } // чтобы знать, к какому вагону привязано
//               }
//             },
//           }
//         },
//         completedJob:    true,
//         currentLocation: true,
//         user:            true,
//       }
//     });

//     if (!r) {
//       return res.status(404).json({ success: false, message: "Заявка не найдена" });
//     }

//     // Все номера поездов заявки
//     const trainNumbers = r.requestTrains.map(rt => rt.train.number);

//     // Группируем оборудование по вагонам
//     const carriages = r.requestCarriages.map(rc => {
//       const carr = rc.carriage;
//       // Отбираем requestEquipments, привязанные к этому вагону
//       const equipmentInThisCarriage = r.requestEquipments
//         .filter(re => re.equipment?.carriageId === carr.id)
//         .map(re => ({
//           id:           re.id,
//           name:         re.equipment?.name          || "—",
//           deviceType:   re.equipment?.device?.name  || "—",
//           typeWork:     re.typeWork?.name           || "—",
//           serialNumber: re.equipment?.serialNumber  || "—",
//           macAddress:   re.equipment?.macAddress    || "—",
//           quantity:     re.quantity,
//           photos:       re.photos.map(p => ({
//                           type: p.photoType,
//                           path: p.photoPath,
//                         }))
//         }));

//       return {
//         number:    carr.number,
//         type:      carr.type,
//         train:     carr.train.number,
//         photo:     rc.carriagePhoto || null,
//         equipment: equipmentInThisCarriage
//       };
//     });

//     // Если нужно, можно собрать агрегаты по всем фоткам оборудования
//     const allEquipmentPhotos = r.requestEquipments
//       .flatMap(re => re.photos.map(p => ({ type: p.photoType, path: p.photoPath })));
//     const getPhotos = (t: string) =>
//       allEquipmentPhotos.filter(p => p.type === t).map(p => p.path);

//     const formatted = {
//       id:               r.id,
//       photo:            r.photo || null,    // фото самой заявки
//       status:           r.status,
//       trainNumbers,
//       carriages,                          // теперь с вложенным equipment
//       countEquipment:   r.requestEquipments.reduce((sum, re) => sum + re.quantity, 0),
//       equipmentPhoto:   getPhotos("equipment")[0] || null,
//       equipmentPhotos:  getPhotos("equipment"),
//       serialPhoto:      getPhotos("serial")[0]    || null,
//       serialPhotos:     getPhotos("serial"),
//       macPhoto:         getPhotos("mac")[0]       || null,
//       macPhotos:        getPhotos("mac"),
//       completedJob:     r.completedJob?.name    || "—",
//       currentLocation:  r.currentLocation?.name || "—",
//       user: {
//         id:   r.userId,
//         name: r.user?.name  || "—",
//         role: r.user?.role  || "—",
//       },
//       createdAt: r.createdAt.toISOString(),
//       updatedAt: r.updatedAt.toISOString()
//     };

//     return res.status(200).json({ success: true, data: formatted });
//   } catch (error) {
//     console.error("Ошибка при получении заявки:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Внутренняя ошибка сервера"
//     });
//   } finally {
//     await prisma.$disconnect();
//   }
// };

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

type EquipmentPhoto = { type: string; path: string };

interface EquipmentDetail {
  id: number;
  name: string;
  deviceType: string;
  typeWork: string;
  serialNumber: string;
  macAddress: string;
  quantity: number;
  photos: EquipmentPhoto[];
}

interface CarriageWithEquipment {
  number: string;
  type: string;
  train: string;
  photo: string | null;
  equipment: EquipmentDetail[];
}

interface ApplicationSummary {
  id: number;
  photo: string | null;
  status: string;
  trainNumbers: string[];
  carriages: CarriageWithEquipment[];
  countEquipment: number;
  completedJob: string;
  currentLocation: string;
  user: { id: number; name: string; role: string };
  createdAt: string;
  updatedAt: string;
}

function formatApplication(r: any): ApplicationSummary {
  // сгруппируем оборудование по carriageId
  const equipmentByCarriage: Record<number, EquipmentDetail[]> = {};
  r.requestEquipments.forEach((re: any) => {
    const cid = re.equipment?.carriageId ?? 0;
    const detail: EquipmentDetail = {
      id:           re.id,
      name:         re.equipment?.name            || '—',
      deviceType:   re.equipment?.device?.name    || '—',
      typeWork:     re.typeWork?.name             || '—',
      serialNumber: re.equipment?.serialNumber    || '—',
      macAddress:   re.equipment?.macAddress      || '—',
      quantity:     re.quantity,
      photos:       re.photos.map((p: any) => ({
                      type: p.photoType,
                      path: p.photoPath
                    })),
    };
    equipmentByCarriage[cid] = equipmentByCarriage[cid] || [];
    equipmentByCarriage[cid].push(detail);
  });

  const carriages: CarriageWithEquipment[] = r.requestCarriages.map((rc: any) => ({
    number:    rc.carriage.number,
    type:      rc.carriage.type,
    train:     rc.carriage.train.number,
    photo:     rc.carriagePhoto || null,
    equipment: equipmentByCarriage[rc.carriageId] || [],
  }));

  const countEquipment = r.requestEquipments.reduce((sum: number, re: any) => sum + re.quantity, 0);

  return {
    id:              r.id,
    photo:           r.photo || null,
    status:          r.status,
    trainNumbers:    r.requestTrains.map((rt: any) => rt.train.number),
    carriages,
    countEquipment,
    completedJob:    r.completedJob?.name    || '—',
    currentLocation: r.currentLocation?.name || '—',
    user: {
      id:   r.userId,
      name: r.user?.name  || '—',
      role: r.user?.role  || '—',
    },
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

// GET /applications
export const getApplications = async (_req: Request, res: Response) => {
  const prisma = new PrismaClient();

  try {
    const userId = _req.query.userId ? Number(_req.query.userId) : undefined;
    const where: any = {};
    if (userId) where.userId = userId;

    const raws = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        requestTrains:    { include: { train: true } },
        requestCarriages: { include: { carriage: { include: { train: true } } } },
        requestEquipments:{ include: { typeWork: true, photos: true, equipment: true } },
        completedJob:    true,
        currentLocation: true,
        user:            true,
      }
    });

    const data = raws.map(formatApplication);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  } finally {
    await prisma.$disconnect();
  }
};

// GET /applications/:id
export const getApplicationById = async (req: Request, res: Response) => {
  const prisma = new PrismaClient();

  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const r = await prisma.request.findUnique({
      where: { id },
      include: {
        requestTrains:    { include: { train: true } },
        requestCarriages: { include: { carriage: { include: { train: true } } } },
        requestEquipments:{ include: { typeWork: true, photos: true, equipment: true } },
        completedJob:    true,
        currentLocation: true,
        user:            true,
      }
    });
    if (!r) return res.status(404).json({ success: false, message: 'Not found' });

    const data = formatApplication(r);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  } finally {
    await prisma.$disconnect();
  }
};
