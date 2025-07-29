import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const getDevices = async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  
  try {
    const equipmentData = await prisma.equipment.findMany({
      include: {
        connectionTypeWagons: true,
        connectionNumberWagon: true,
      },
    });

    const devices = equipmentData.map((item) => ({
      id: item.id,
      name: item.type,
      status: item.status,
      snNumber: item.snNumber,
      mac: item.mac,
      lastService: item.lastService,
      photo: item.photo,
      typeWagon: item.connectionTypeWagons?.typeWagon,
      numberWagon: item.connectionNumberWagon?.numberWagon,
    }));

    res.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};