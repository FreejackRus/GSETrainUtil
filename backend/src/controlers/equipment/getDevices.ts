import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDevices = async (_req: Request, res: Response) => {
  try {
    const equipments = await prisma.equipment.findMany({
      include: {
        carriage: {
          include: {
            // Carriage -> RequestCarriage -> RequestTrain -> Train
            requestCarriages: {
              include: {
                requestTrain: { include: { train: true } },
              },
            },
          },
        },
      },
    });

    const devices = equipments.map((e) => {
      const trainNums =
          e.carriage?.requestCarriages
              .map((rc) => rc.requestTrain?.train?.number)
              .filter((n): n is string => Boolean(n)) ?? [];
      const trainNumbers = Array.from(new Set(trainNums));

      return {
        id: e.id,
        name: e.name,
        snNumber: e.serialNumber ?? null,
        mac: e.macAddress ?? null,
        lastService: e.lastService ? e.lastService.toISOString() : null,
        isActive: e.carriageId != null,
        carriageType: e.carriage?.type ?? null,
        carriageNumber: e.carriage?.number ?? null,
        // для обратной совместимости
        trainNumber: trainNumbers[0] ?? null,
        trainNumbers,
      };
    });

    return res.status(200).json({ success: true, data: devices });
  } catch (error) {
    console.error("Error fetching devices:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Ошибка при получении данных об оборудовании",
    });
  }
};
