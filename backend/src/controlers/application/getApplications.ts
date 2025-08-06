import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getApplications = async (req: Request, res: Response) => {
  try {
    // Фильтрация по userId (опционально)
    const userId = req.query.userId
        ? Number(req.query.userId)
        : undefined;

    const where: any = {};
    if (userId) where.userId = userId;

    const raws = await prisma.request.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
      }
    });

    const data = raws.map(r => {
      const trainNumbers = r.requestTrains.map(rt => rt.train.number);

      const carriages = r.requestCarriages.map(rc => ({
        number: rc.carriage.number,
        type:   rc.carriage.type,
        train:  rc.carriage.train.number,
        photo:  rc.carriagePhoto || null,
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
        })),
      }));

      // Агрегация всех equipment-фото
      const allPhotos = equipmentDetails.flatMap(d => d.photos);
      const get = (t: string) =>
          allPhotos.filter(p => p.type === t).map(p => p.path);

      return {
        id:               r.id,
        photo:            r.photo || null,                  // ← фото из Request
        status:           r.status,
        trainNumbers,
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
          role: r.user?.role  || "—",
        },
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Ошибка при получении заявок:", error);
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера"
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Некорректный ID" });
    }

    const r = await prisma.request.findUnique({
      where: { id },
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
      }
    });

    if (!r) {
      return res.status(404).json({ success: false, message: "Заявка не найдена" });
    }

    const trainNumbers = r.requestTrains.map(rt => rt.train.number);

    const carriages = r.requestCarriages.map(rc => ({
      number: rc.carriage.number,
      type:   rc.carriage.type,
      train:  rc.carriage.train.number,
      photo:  rc.carriagePhoto || null,
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
      })),
    }));

    const allPhotos = equipmentDetails.flatMap(d => d.photos);
    const get = (t: string) =>
        allPhotos.filter(p => p.type === t).map(p => p.path);

    const formatted = {
      id:               r.id,
      photo:            r.photo || null,  // ← сюда попадает фотография заявления
      status:           r.status,
      trainNumbers,
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
        role: r.user?.role  || "—",
      },
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Ошибка при получении заявки:", error);
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера"
    });
  } finally {
    await prisma.$disconnect();
  }
};
