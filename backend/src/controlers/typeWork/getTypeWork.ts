import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const getTypeWork = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
  
    const typeWorkList = await prisma.typeWork.findMany();

    await prisma.$disconnect();
    res.status(200).json(typeWorkList);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};