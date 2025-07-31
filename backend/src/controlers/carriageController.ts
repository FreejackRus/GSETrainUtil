import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCarriages = async (req: Request, res: Response) => {
  try {
    // Получаем все вагоны с оборудованием
    const carriages = await prisma.carriage.findMany({
      include: {
        train: true,
        equipment: {
          include: {
            photos: true,
          },
        },
      },
    });

    const carriagesData = carriages.map((carriage) => ({
      carriageNumber: carriage.number,
      carriageType: carriage.type,
      trainNumber: carriage.train?.number || 'Неизвестно',
      equipment: carriage.equipment.map((item) => ({
        id: item.id,
        type: item.type,
        snNumber: item.serialNumber,
        mac: item.macAddress,
        status: item.status,
        lastService: item.lastService,
        photos: item.photos.map(photo => photo.photoPath),
      })),
    }));

    res.status(200).json({
      success: true,
      data: carriagesData,
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

    const carriage = await prisma.carriage.findFirst({
      where: {
        number: carriageNumber,
      },
      include: {
        train: true,
        equipment: {
          include: {
            photos: true,
          },
        },
      },
    });

    if (!carriage) {
      return res.status(404).json({
        success: false,
        message: 'Вагон не найден',
      });
    }

    const carriageData = {
      carriageNumber: carriage.number,
      carriageType: carriage.type,
      trainNumber: carriage.train?.number || 'Неизвестно',
      equipment: carriage.equipment.map((item) => ({
        id: item.id,
        type: item.type,
        snNumber: item.serialNumber,
        mac: item.macAddress,
        status: item.status,
        lastService: item.lastService,
        photos: item.photos.map(photo => photo.photoPath),
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