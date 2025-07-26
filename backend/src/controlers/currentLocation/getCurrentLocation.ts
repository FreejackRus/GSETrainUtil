import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";

export const getCurrentLocation = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
  
    const getCurrentLocation = await prisma.currentLocation.findMany();

    await prisma.$disconnect();
    res.status(200).json(getCurrentLocation);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};