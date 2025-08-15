import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const getCompletedJob = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
  
    const completedJobList = await prisma.performer.findMany();

    await prisma.$disconnect();
    res.status(200).json(completedJobList);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};