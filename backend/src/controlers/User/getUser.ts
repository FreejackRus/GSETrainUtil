import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";

export const getUser = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({
      select: { id: true, login: true, role: true }
    });
    await prisma.$disconnect();
    res.status(200).json(users);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};