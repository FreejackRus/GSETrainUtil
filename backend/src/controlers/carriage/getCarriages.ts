import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const getCarriages = async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  
  try {
    // Получаем все вагоны с оборудованием и информацией о поезде
    const carriagesData = await prisma.carriage.findMany({
      include: {
        train: true,
        equipments: true,
      },
    });

    // Преобразуем данные в нужный формат
    const carriages = carriagesData.map(carriage => ({
      carriageNumber: carriage.number,
      carriageType: carriage.type,
      trainNumber: carriage.train?.number || 'Неизвестно',
      equipment: carriage.equipments.map(equipment => ({
        id: equipment.id,
        snNumber: equipment.serialNumber,
        mac: equipment.macAddress,
        lastService: equipment.lastService,
      })),
    }));

    res.json({ 
      success: true,
      data: carriages,
    });
  } catch (error) {
    console.error('Error fetching carriages:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Ошибка при получении данных о вагонах'
    });
  } finally {
    await prisma.$disconnect();
  }
};