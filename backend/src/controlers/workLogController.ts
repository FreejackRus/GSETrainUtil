import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /work-log
export const getWorkLog = async (_req: Request, res: Response) => {
  try {
    const entries = await prisma.request.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    const formatted = entries.map(r => {
      // Вагоны
      const carriages = r.requestCarriages.map(rc => ({
        number: rc.carriage.number,
        type:   rc.carriage.type,
        train:  rc.carriage.train.number,
        photo:  rc.carriagePhoto || null,
      }));

      // Оборудование
      const equipmentDetails = r.requestEquipments.map(re => ({
        id:           re.id,
        name:         re.equipment?.name               || "—",
        deviceType:   re.equipment?.device?.name       || "—",
        typeWork:     re.typeWork?.name                || "—",
        serialNumber: re.equipment?.serialNumber       || "—",
        macAddress:   re.equipment?.macAddress         || "—",
        quantity:     re.quantity,
        photos:       re.photos.map(p => ({
          type: p.photoType,
          path: p.photoPath,
        })),
      }));

      // Сбор фотографий оборудования
      const allPhotos = equipmentDetails.flatMap(d => d.photos);
      const get = (t: string) =>
          allPhotos.filter(p => p.type === t).map(p => p.path);

      return {
        id:             r.id,
        // **Новое поле** — фото заявки (generalPhoto → photo)
        photo:          r.photo || null,
        status:         r.status,
        trainNumbers:   r.requestTrains.map(rt => rt.train.number),
        carriages,
        equipmentDetails,
        countEquipment: equipmentDetails.reduce((sum, d) => sum + d.quantity, 0),
        equipmentTypes: equipmentDetails.map(d => d.typeWork),
        serialNumbers:  equipmentDetails.map(d => d.serialNumber),
        macAddresses:   equipmentDetails.map(d => d.macAddress),
        equipmentPhoto:  get("equipment")[0] || null,
        equipmentPhotos: get("equipment"),
        serialPhoto:     get("serial")[0]    || null,
        serialPhotos:    get("serial"),
        macPhoto:        get("mac")[0]       || null,
        macPhotos:       get("mac"),
        completedJob:    r.completedJob?.name    || "—",
        currentLocation: r.currentLocation?.name || "—",
        user: {
          id:   r.userId,
          name: r.user?.name  || "—",
          role: r.user?.role  || "—"
        },
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString()
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (e) {
    console.error("Ошибка при получении журнала работ:", e);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// PUT /work-log/:id
export const updateWorkLogById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    photo,               // <— принимаем новое поле
    status,
    completedJob,
    currentLocation,
    userId,
    requestTrains,
    requestCarriages,
    requestEquipment
  } = req.body;

  try {
    const [cj, loc] = await Promise.all([
      prisma.completedJob.findUnique({    where: { name: completedJob } }),
      prisma.currentLocation.findUnique({ where: { name: currentLocation } }),
    ]);

    const updated = await prisma.request.update({
      where: { id: parseInt(id) },
      data: {
        // Обновляем поле photo
        photo:             photo ?? undefined,
        status,
        completedJobId:    cj?.id,
        currentLocationId: loc?.id,
        userId,
        requestTrains: {
          deleteMany: {},
          create:     requestTrains.map((t: any) => ({ trainId: t.trainId }))
        },
        requestCarriages: {
          deleteMany: {},
          create:     requestCarriages.map((c: any) => ({
            carriageId:    c.carriageId,
            carriagePhoto: c.carriagePhoto || null
          }))
        },
        requestEquipments: {
          deleteMany: {},
          create:     await Promise.all(
              requestEquipment.map(async (e: any) => {
                const tw = await prisma.typeWork.findUnique({ where: { name: e.typeWork } });
                return {
                  equipmentId: e.equipmentId,
                  typeWorkId:  tw?.id,
                  quantity:    e.quantity,
                  photos: {
                    create: e.photos.map((p: any) => ({
                      photoType: p.type,
                      photoPath: p.path
                    }))
                  }
                };
              })
          )
        }
      },
      include: {
        requestTrains:    { include: { train: true } },
        requestCarriages: { include: { carriage: { include: { train: true } } } },
        requestEquipments: {
          include: {
            typeWork:  true,
            photos:    true,
            equipment: { include: { device: true } }
          }
        },
        completedJob:    true,
        currentLocation: true,
        user:            true
      }
    });

    return res.json({ success: true, data: updated });
  } catch (e) {
    console.error("Ошибка при обновлении записи журнала работ:", e);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// GET /work-log/:id
export const getWorkLogById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const r = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: {
        requestTrains:    { include: { train: true } },
        requestCarriages: { include: { carriage: { include: { train: true } } } },
        requestEquipments: {
          include: {
            typeWork:  true,
            photos:    true,
            equipment: { include: { device: true } }
          }
        },
        completedJob:    true,
        currentLocation: true,
        user:            true
      }
    });

    if (!r) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const carriages = r.requestCarriages.map(rc => ({
      number: rc.carriage.number,
      type:   rc.carriage.type,
      train:  rc.carriage.train.number,
      photo:  rc.carriagePhoto || null
    }));

    const equipmentDetails = r.requestEquipments.map(re => ({
      id:           re.id,
      name:         re.equipment?.name             || "—",
      deviceType:   re.equipment?.device?.name     || "—",
      typeWork:     re.typeWork?.name              || "—",
      serialNumber: re.equipment?.serialNumber     || "—",
      macAddress:   re.equipment?.macAddress       || "—",
      quantity:     re.quantity,
      photos:       re.photos.map(p => ({
        type: p.photoType,
        path: p.photoPath,
      }))
    }));

    const allPhotos = equipmentDetails.flatMap(d => d.photos);
    const get = (t: string) => allPhotos.filter(p => p.type === t).map(p => p.path);

    const formatted = {
      id:               r.id,
      photo:            r.photo || null,    // <— добавили сюда
      status:           r.status,
      trainNumbers:     r.requestTrains.map(rt => rt.train.number),
      carriages,
      equipmentDetails,
      countEquipment:   equipmentDetails.reduce((sum, d) => sum + d.quantity, 0),
      equipmentTypes:   equipmentDetails.map(d => d.typeWork),
      serialNumbers:    equipmentDetails.map(d => d.serialNumber),
      macAddresses:     equipmentDetails.map(d => d.macAddress),
      equipmentPhoto:   get("equipment")[0] || null,
      equipmentPhotos:  get("equipment"),
      serialPhoto:      get("serial")[0]    || null,
      serialPhotos:     get("serial"),
      macPhoto:         get("mac")[0]       || null,
      macPhotos:        get("mac"),
      completedJob:     r.completedJob?.name    || "—",
      currentLocation:  r.currentLocation?.name || "—",
      user: {
        id:   r.userId,
        name: r.user?.name  || "—",
        role: r.user?.role  || "—"
      },
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    };

    return res.json({ success: true, data: formatted });
  } catch (e) {
    console.error("Ошибка при получении записи журнала работ:", e);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};
