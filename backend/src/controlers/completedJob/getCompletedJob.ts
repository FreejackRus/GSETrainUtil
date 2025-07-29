import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const getCompletedJob = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
  
    const getCompletedJob = await prisma.completedJob.findMany();

    await prisma.$disconnect();
    res.status(200).json(getCompletedJob);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};