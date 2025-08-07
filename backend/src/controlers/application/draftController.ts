import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

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

// GET /drafts
export const getDrafts = async (req: Request, res: Response) => {
  const prisma = new PrismaClient();

  try {
    // TODO: взять userId/userRole из JWT
    const userId   = Number(req.query.userId)   || undefined;
    const userRole = String(req.query.userRole) || "engineer";

    if (userRole === "admin") {
      return res.status(200).json({ success: true, data: [] });
    }

    const where: any = { status: "draft" };
    if (userRole === "engineer" && userId) {
      where.userId = userId;
    }

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

    // const data = raws.map(r => ({
    //   id:             r.id,
    //   photo:          r.photo || null,
    //   status:         r.status,
    //   trainNumbers:   r.requestTrains.map(rt => rt.train.number),
    //   carriages:      r.requestCarriages.map(rc => ({
    //     number:  rc.carriage.number,
    //     type:    rc.carriage.type,
    //     train:   rc.carriage.train.number,
    //     photo:   rc.carriagePhoto || null,
    //   })),
    //   equipmentCount: r.requestEquipments.length,
    //   createdAt:      r.createdAt.toISOString(),
    //   updatedAt:      r.updatedAt.toISOString(),
    // }));

    const data = raws.map(formatApplication);
    res.status(200).json({ success: true, data });
  } catch (e) {
    console.error("Ошибка при получении черновиков:", e);
    res.status(500).json({ success: false, message: "Внутренняя ошибка сервера" });
  } finally {
    await prisma.$disconnect();
  }
};

// POST /drafts/:id/complete
export const completeDraft = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "Некорректный ID" });
  }

  const prisma = new PrismaClient();

  try {
    const existing = await prisma.request.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Черновик не найден" });
    }
    if (existing.status !== "draft") {
      return res.status(400).json({ success: false, message: "Можно завершить только черновики" });
    }

    const {
      trainNumber,
      carriages = [],
      equipment = [],
      completedJob,
      currentLocation,
      photo,
      userId
    } = req.body;

    // Валидация
    if (!trainNumber || carriages.length === 0 || equipment.length === 0 || !completedJob || !currentLocation) {
      return res.status(400).json({ success: false, message: "Не все обязательные поля заполнены" });
    }

    // Upsert справочников
    const [tr, cj, loc] = await Promise.all([
      prisma.train.upsert({ where: { number: trainNumber }, update: {}, create: { number: trainNumber } }),
      prisma.completedJob.upsert({ where: { name: completedJob }, update: {}, create: { name: completedJob } }),
      prisma.currentLocation.upsert({ where: { name: currentLocation }, update: {}, create: { name: currentLocation } }),
    ]);

    // Upsert вагонов
    const carriageRecords = [];
    for (const c of carriages) {
      const cr = await prisma.carriage.upsert({
        where: {
          number_trainId: {
            number:  c.carriageNumber,
            trainId: tr.id
          }
        },
        update: { type: c.carriageType },
        create: {
          number:  c.carriageNumber,
          type:    c.carriageType,
          trainId: tr.id
        }
      });
      carriageRecords.push({ id: cr.id, photo: c.carriagePhoto });
    }

    // Обновляем заявку + связи с поездами и вагонами
    await prisma.request.update({
      where: { id },
      data: {
        status:            "completed",
        photo:             photo ?? existing.photo,
        completedJobId:    cj.id,
        currentLocationId: loc.id,
        userId:            userId ?? existing.userId,
        requestTrains: {
          deleteMany: {},
          create:     [{ trainId: tr.id }]
        },
        requestCarriages: {
          deleteMany: {},
          create:     carriageRecords.map(cr => ({
            carriageId:    cr.id,
            carriagePhoto: cr.photo ?? null
          }))
        }
      }
    });

    // Обновляем оборудование
    await prisma.requestEquipment.deleteMany({ where: { requestId: id } });

    for (const e of equipment) {
      // Upsert устройства (Device)

      let eqRec = await prisma.equipment.findFirst({
        where: {
          serialNumber: e.serialNumber ?? undefined
        }
      });

      if (eqRec) {
        // обновляем
        eqRec = await prisma.equipment.update({
          where: { id: eqRec.id },
          data: {
            macAddress:  e.macAddress   ?? undefined,
            lastService: e.lastService  ? new Date(e.lastService) : undefined,
            carriageId:  null
          }
        });
      } else {
        // создаём
        eqRec = await prisma.equipment.create({
          data: {
            name:         e.name,
            serialNumber: e.serialNumber ?? null,
            macAddress:   e.macAddress   ?? null,
            lastService:  e.lastService  ? new Date(e.lastService) : undefined,
            // carriageId — пропустим, пусть по умолчанию будет null
          }
        });
      }

      // Upsert типа работ для этого оборудования
      const tw = await prisma.typeWork.upsert({
        where:  { name: e.typeWork },
        update: {},
        create: { name: e.typeWork }
      });

      // Создание связи request ↔ equipment
      const reqEq = await prisma.requestEquipment.create({
        data: {
          requestId:   id,
          equipmentId: eqRec.id,
          typeWorkId:  tw.id,
        }
      });

      // Фотографии оборудования
      if (Array.isArray(e.photos)) {
        for (const p of e.photos) {
          await prisma.requestEquipmentPhoto.create({
            data: {
              requestEquipmentId: reqEq.id,
              photoType:          p.type,
              photoPath:          p.path
            }
          });
        }
      }
    }

    // Возвращаем полную заявку
    const result = await prisma.request.findUnique({
      where: { id },
      include: {
        requestTrains:    { include: { train: true } },
        requestCarriages: { include: { carriage: { include: { train: true } } } },
        requestEquipments: {
          include: {
            typeWork:  true,
            photos:    true,
            equipment: true,
          }
        },
        completedJob:    true,
        currentLocation: true,
        user:            true,
      }
    });

    res.status(200).json({ success: true, data: result });
  } catch (e) {
    console.error("Ошибка при завершении черновика:", e);
    res.status(500).json({ success: false, message: "Внутренняя ошибка сервера" });
  } finally {
    await prisma.$disconnect();
  }
};

// DELETE /drafts/:id
export const deleteDraft = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "Некорректный ID" });
  }

  const prisma = new PrismaClient();

  try {
    const existing = await prisma.request.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Черновик не найден" });
    }
    if (existing.status !== "draft") {
      return res.status(400).json({ success: false, message: "Можно удалить только черновики" });
    }

    // Удаляем все связи
    await prisma.requestEquipment.deleteMany({ where: { requestId: id } });
    await prisma.requestCarriage.deleteMany({ where: { requestId: id } });
    await prisma.requestTrain.deleteMany({    where: { requestId: id } });

    // Удаляем сам черновик
    await prisma.request.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Черновик успешно удалён" });
  } catch (e) {
    console.error("Ошибка при удалении черновика:", e);
    res.status(500).json({ success: false, message: "Внутренняя ошибка сервера" });
  } finally {
    await prisma.$disconnect();
  }
};
