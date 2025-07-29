import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCarriages = async (req: Request, res: Response) => {
  try {
    // Получаем все оборудование с информацией о вагонах
    const equipment = await prisma.equipment.findMany({
      include: {
        connectionTypeWagons: true,
        connectionNumberWagon: true,
      },
    });

    // Группируем оборудование по номерам вагонов
    const carriagesMap = new Map();

    equipment.forEach((item: { 
      id: number;
      type: string;
      snNumber: string | null;
      mac: string | null;
      status: string;
      lastService: Date;
      photo: string;
      connectionNumberWagon: { numberWagon: string };
      connectionTypeWagons: { typeWagon: string };
    }) => {
      const carriageNumber = item.connectionNumberWagon.numberWagon;
      const carriageType = item.connectionTypeWagons.typeWagon;
      
      if (!carriagesMap.has(carriageNumber)) {
        carriagesMap.set(carriageNumber, {
          carriageNumber,
          carriageType,
          equipment: [],
        });
      }
      
      carriagesMap.get(carriageNumber).equipment.push({
        id: item.id,
        type: item.type,
        snNumber: item.snNumber,
        mac: item.mac,
        status: item.status,
        lastService: item.lastService,
        photo: item.photo,
      });
    });

    const carriages = Array.from(carriagesMap.values());

    res.status(200).json({
      success: true,
      data: carriages,
    });
  } catch (error) {
    console.error('Error fetching carriages:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении данных о вагонах',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getCarriageById = async (req: Request, res: Response) => {
  try {
    const { carriageNumber } = req.params;

    const equipment = await prisma.equipment.findMany({
      where: {
        connectionNumberWagon: {
          numberWagon: carriageNumber,
        },
      },
      include: {
        connectionTypeWagons: true,
        connectionNumberWagon: true,
      },
    });

    if (equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Вагон не найден',
      });
    }

    const carriageData = {
      carriageNumber,
      carriageType: equipment[0].connectionTypeWagons.typeWagon,
      equipment: equipment.map((item: { id: number; type: string; snNumber: string | null; mac: string | null; status: string; lastService: Date; photo: string; }) => ({
        id: item.id,
        type: item.type,
        snNumber: item.snNumber,
        mac: item.mac,
        status: item.status,
        lastService: item.lastService,
        photo: item.photo,
      })),
    };

    res.status(200).json({
      success: true,
      data: carriageData,
    });
  } catch (error) {
    console.error('Error fetching carriage:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении данных о вагоне',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};