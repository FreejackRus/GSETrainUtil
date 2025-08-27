import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDevices = async (_req: Request, res: Response) => {
  const { needAll = false } = _req.body;

  try {
    const equipments = await prisma.equipment.findMany({
      where: {
        requestEquipments: {
          some: {
            request: { status: "completed" },
          },
        },
      },
      include: {
        carriage: true,
        requestEquipments: {
          include: {
            request: true,
            requestCarriage: {
              include: {
                requestTrain: {
                  include: { train: true },
                },
              },
            },
          },
        },
      },
    });

    const devices = equipments.map((e) => {
      // берём только заявки completed
      const completedRE = needAll
        ? e.requestEquipments
        : e.requestEquipments.filter((re) => re.request.status === "completed");

      const trainNums = completedRE
        .map((re) => re.requestCarriage?.requestTrain?.train?.number)
        .filter((n): n is string => Boolean(n));
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
