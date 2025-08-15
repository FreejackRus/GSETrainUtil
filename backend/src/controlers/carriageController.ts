import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const uniq = <T, K extends keyof any>(arr: T[], by: (x: T) => K) => {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const x of arr) {
    const k = by(x);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
};

export const getCarriages = async (_req: Request, res: Response) => {
  try {
    // У Carriage больше нет прямой связи с Train — берём поезда через заявки:
    // Carriage -> RequestCarriage -> RequestTrain -> Train
    const carriages = await prisma.carriage.findMany({
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

    const carriagesData = carriages.map((c) => {
      const trainNumsAll = c.requestCarriages
          .map((rc) => rc.requestTrain?.train?.number)
          .filter((n): n is string => Boolean(n));

      const trainNumbers = uniq(trainNumsAll, (n) => n);

      return {
        carriageNumber: c.number,
        carriageType: c.type,
        // для обратной совместимости — первый номер поезда (если нужен)
        trainNumber: trainNumbers[0] ?? '—',
        trainNumbers, // новый массив с уникальными номерами поездов
        equipment: c.equipments.map((item) => ({
          id: item.id,
          name: item.name,
          snNumber: item.serialNumber ?? '—',
          mac: item.macAddress ?? '—',
          lastService: item.lastService, // можно .toISOString(), если фронт ждёт строку
        })),
      };
    });

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
        equipments: true,
        requestCarriages: {
          include: {
            requestTrain: { include: { train: true } },
          },
        },
      },
    });

    if (!c) {
      return res.status(404).json({
        success: false,
        message: 'Вагон не найден',
      });
    }

    const trainNumsAll = c.requestCarriages
        .map((rc) => rc.requestTrain?.train?.number)
        .filter((n): n is string => Boolean(n));

    const trainNumbers = uniq(trainNumsAll, (n) => n);

    const carriageData = {
      carriageNumber: c.number,
      carriageType: c.type,
      // для обратной совместимости
      trainNumber: trainNumbers[0] ?? '—',
      trainNumbers,
      equipment: c.equipments.map((item) => ({
        id: item.id,
        name: item.name,
        snNumber: item.serialNumber ?? '—',
        mac: item.macAddress ?? '—',
        lastService: item.lastService,
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
