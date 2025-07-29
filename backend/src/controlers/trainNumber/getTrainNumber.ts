import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const getTrainNumber = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
  
    const getTypeWork = await prisma.trainNumber.findMany();

    await prisma.$disconnect();
    res.status(200).json(getTypeWork);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};