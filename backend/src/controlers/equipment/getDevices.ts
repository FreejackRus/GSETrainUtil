import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const getDevices = async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  
  try {
    const equipmentData = await prisma.equipment.findMany({
      include: {
        carriage: {
          include: {
            train: true
          }
        },
        photos: true
      },
    });

    const devices = equipmentData.map((item) => ({
      id: item.id,
      name: item.type,
      status: item.status,
      snNumber: item.serialNumber,
      mac: item.macAddress,
      lastService: item.lastService,
      photos: item.photos,
      typeWagon: item.carriage?.type,
      numberWagon: item.carriage?.number,
      trainNumber: item.carriage?.train?.number,
    }));

    res.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};