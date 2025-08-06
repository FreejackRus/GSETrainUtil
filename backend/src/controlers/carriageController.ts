import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCarriages = async (_req: Request, res: Response) => {
  try {
    // Получаем все вагоны вместе с поездом и оборудованием (включая тип устройства)
    const carriages = await prisma.carriage.findMany({
      include: {
        train:    true,
        equipments: {
          include: { device: true }
        },
      },
    });

    const carriagesData = carriages.map(c => ({
      carriageNumber: c.number,
      carriageType:   c.type,
      trainNumber:    c.train?.number ?? 'Неизвестно',
      equipment: c.equipments.map(item => ({
        id:           item.id,
        name:         item.name,
        deviceType:   item.device?.name ?? '—',
        snNumber:     item.serialNumber ?? '—',
        mac:          item.macAddress ?? '—',
        lastService:  item.lastService,
      })),
    }));

    res.status(200).json({ success: true, data: carriagesData });
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

    const c = await prisma.carriage.findFirst({
      where: { number: carriageNumber },
      include: {
        train:    true,
        equipments: {
          include: { device: true }
        },
      },
    });

    if (!c) {
      return res.status(404).json({
        success: false,
        message: 'Вагон не найден',
      });
    }

    const carriageData = {
      carriageNumber: c.number,
      carriageType:   c.type,
      trainNumber:    c.train?.number ?? 'Неизвестно',
      equipment: c.equipments.map(item => ({
        id:           item.id,
        name:         item.name,
        deviceType:   item.device?.name ?? '—',
        snNumber:     item.serialNumber ?? '—',
        mac:          item.macAddress ?? '—',
        lastService:  item.lastService,
      })),
    };

    res.status(200).json({ success: true, data: carriageData });
  } catch (error) {
    console.error('Error fetching carriage:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении данных о вагоне',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
