import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getEquipment = async (_req: Request, res: Response) => {
  try {
    const equipmentList = await prisma.equipment.findMany({
      include: {
        carriage: {
          include: {
            requestCarriages: {
              include: {
                requestTrain: { include: { train: true } },
              },
            },
          },
        },
      },
    });

    const data = equipmentList.map((e) => {
      const allTrainNumbers =
          e.carriage?.requestCarriages
              ?.map((rc) => rc.requestTrain?.train?.number)
              .filter((n): n is string => Boolean(n)) ?? [];
      const trainNumbers = Array.from(new Set(allTrainNumbers));

      return {
        id: e.id,
        name: e.name,
        snNumber: e.serialNumber ?? null,
        mac: e.macAddress ?? null,
        lastService: e.lastService ? e.lastService.toISOString() : null,

        // Привязка к вагону (если есть)
        isActive: e.carriageId != null,
        carriageType: e.carriage?.type ?? null,
        carriageNumber: e.carriage?.number ?? null,

        // Поезда через заявки (для совместимости оставляем одиночное поле)
        trainNumber: trainNumbers[0] ?? null,
        trainNumbers,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Ошибка при получении списка оборудования",
    });
  }
};
