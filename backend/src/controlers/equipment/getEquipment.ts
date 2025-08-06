import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const getEquipment = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
  
    const equipmentList = await prisma.equipment.findMany({
      include: {
        carriage: {
          include: {
            train: true
          }
        },
      }
    });

    await prisma.$disconnect();
    res.status(200).json(equipmentList);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};