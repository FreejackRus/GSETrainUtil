import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const getTrainNumber = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
  
    const trainNumbers = await prisma.train.findMany({
      select: {
        number: true
      }
    });

    await prisma.$disconnect();
    res.status(200).json(trainNumbers.map(t => ({ number: t.number })));
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};