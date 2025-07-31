import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const getTypeCarriage = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
  
    const carriageTypes = await prisma.carriage.findMany({
      select: {
        type: true
      },
      distinct: ['type']
    });

    await prisma.$disconnect();
    res.status(200).json(carriageTypes.map(c => ({ type: c.type })));
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};