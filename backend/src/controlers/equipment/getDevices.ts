import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const getDevices = async (_req: Request, res: Response) => {
  const prisma = new PrismaClient();
  try {
    // Находим всё оборудование вместе с привязкой к справочнику Device и к вагонам/поездам
    const equipments = await prisma.equipment.findMany({
      include: {
        carriage: {
          include: { train: true }
        }
      }
    });

    // Форматируем под нужный клиенту вид
    const devices = equipments.map(e => ({
      id:             e.id,
      name:           e.name,
      snNumber:       e.serialNumber ?? null,
      mac:            e.macAddress  ?? null,
      lastService:    e.lastService ? e.lastService.toISOString() : null,
      // Если carriageId отсутствует → не привязано (неактивно)
      isActive:       e.carriageId != null,
      carriageType:   e.carriage?.type    ?? null,
      carriageNumber: e.carriage?.number  ?? null,
      trainNumber:    e.carriage?.train?.number ?? null,
    }));

    return res.status(200).json({ success: true, data: devices });
  } catch (error) {
    console.error("Error fetching devices:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};
