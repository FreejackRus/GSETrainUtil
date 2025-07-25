import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";

export const getEquipment = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
  
    const getTypeWork = await prisma.equipment.findMany();

    await prisma.$disconnect();
    res.status(200).json(getTypeWork);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};