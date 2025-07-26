import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";

export const getDevice = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    const equipment = await prisma.equipment.findMany({
      include: {
        connectionTypeWagons: true,
        connectionNumberWagon: true
      }
    });
    
    // Преобразуем данные equipment в формат, ожидаемый frontend
    const devices = equipment.map(item => ({
      id: item.id,
      name: item.type,
      status: item.status,
      count: 1, // Каждое оборудование считается как 1 единица
      snNumber: item.snNumber,
      mac: item.mac,
      lastService: item.lastService,
      photo: item.photo,
      typeWagon: item.connectionTypeWagons?.typeWagon,
      numberWagon: item.connectionNumberWagon?.numberWagon
    }));
    
    await prisma.$disconnect();
    res.status(200).json({ data: devices });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};