import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";

export const getUser = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    const getDevice = await prisma.user.findMany();
    await prisma.$disconnect();
    res.status(200).json(getDevice);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};