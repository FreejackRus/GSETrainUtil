import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const prisma = new PrismaClient();
    const users = await prisma.user.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        name: true,
        role: true,
      },
    });
    await prisma.$disconnect();
    res.status(200).json(users);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};
