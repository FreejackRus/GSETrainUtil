import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type EquipmentPhoto = { type: string; path: string };

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
  train: string;            // номер поезда из rc.requestTrain.train.number
  photo: string | null;     // первое фото типа 'carriage' (если есть)
  equipment: EquipmentDetail[];
}

interface ApplicationSummary {
  id: number;
  photo: string | null;     // в новой схеме нет общего фото заявки — возвращаем null для совместимости
  status: string;
  trainNumbers: string[];
  carriages: CarriageWithEquipment[];
  countEquipment: number;
  performer: string;
  currentLocation: string;
  user: { id: number; name: string; role: string };
  createdAt: string;
  updatedAt: string;
}

function formatApplication(r: any): ApplicationSummary {
  // сгруппировать оборудование по requestCarriageId (а не по carriageId!)
  const equipmentByRequestCarriage: Record<number, EquipmentDetail[]> = {};
  for (const re of r.requestEquipments as any[]) {
    const rcId = re.requestCarriageId as number;
    const detail: EquipmentDetail = {
      id:           re.id,
      name:         re.equipment?.name         ?? '—',
      typeWork:     re.typeWork?.name          ?? '—',
      serialNumber: re.equipment?.serialNumber ?? '—',
      macAddress:   re.equipment?.macAddress   ?? '—',
      photos:       (re.photos ?? []).map((p: any) => ({
        type: p.photoType,
        path: p.photoPath,
      })),
    };
    (equipmentByRequestCarriage[rcId] ||= []).push(detail);
  }

  // вагоны теперь берем через requestTrains[].requestCarriages[]
  const carriages: CarriageWithEquipment[] = [];
  for (const rt of r.requestTrains as any[]) {
    const trainNum = rt.train?.number ?? '—';
    for (const rc of rt.requestCarriages as any[]) {
      const firstCarriagePhoto =
          (rc.carriagePhotos ?? []).find((p: any) => p.photoType === 'carriage')?.photoPath ??
          null;

      carriages.push({
        number: rc.carriage.number,
        type:   rc.carriage.type,
        train:  trainNum,
        photo:  firstCarriagePhoto,
        equipment: equipmentByRequestCarriage[rc.id] ?? [],
      });
    }
  }

  const trainNumbers: string[] = (r.requestTrains as any[])
      .map((rt: any) => rt.train?.number)
      .filter((x: string | undefined): x is string => Boolean(x));

  return {
    id:           r.id,
    photo:        null, // общего фото заявки больше нет
    status:       r.status,
    trainNumbers,
    carriages,
    countEquipment: (r.requestEquipments as any[]).length,
    performer:      r.performer?.name       ?? '—',
    currentLocation:r.currentLocation?.name ?? '—',
    user: {
      id:   r.userId,
      name: r.user?.name ?? '—',
      role: r.user?.role ?? '—',
    },
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

// GET /applications
export const getApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const where: any = {};
    if (userId) where.userId = userId;

    const raws = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
            // requestCarriageId есть как поле, сам объект не обязателен
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
    console.error('Ошибка при получении заявок:', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};

// GET /applications/:id
export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const r = await prisma.request.findUnique({
      where: { id },
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

    if (!r) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const data = formatApplication(r);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error('Ошибка при получении заявки:', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};
