import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCarriages = async (_req: Request, res: Response) => {
  try {
    const carriagesData = await prisma.carriage.findMany({
      include: {
        equipments: true,
        requestCarriages: {
          include: {
            requestTrain: {
              include: { train: true },
            },
          },
        },
      },
    });

    const carriages = carriagesData.map((carriage) => {
      const allTrainNumbers = carriage.requestCarriages
          .map((rc) => rc.requestTrain?.train?.number)
          .filter((n): n is string => Boolean(n));

      const trainNumbers = Array.from(new Set(allTrainNumbers));

      return {
        carriageNumber: carriage.number,
        carriageType: carriage.type,
        // для обратной совместимости со старым фронтом
        trainNumber: trainNumbers[0] ?? "Неизвестно",
        trainNumbers,
        equipment: carriage.equipments.map((equipment) => ({
          id: equipment.id,
          snNumber: equipment.serialNumber ?? "—",
          mac: equipment.macAddress ?? "—",
          lastService: equipment.lastService ?? null, // можно .toISOString() если нужен строковый формат
          name:equipment.name
        })),
      };
    });

    res.json({
      success: true,
      data: carriages,
    });
  } catch (error) {
    console.error("Error fetching carriages:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Ошибка при получении данных о вагонах",
    });
  }
};
