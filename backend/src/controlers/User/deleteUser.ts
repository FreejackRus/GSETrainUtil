import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { TRequestUser } from "../../utils/types/requestUser";

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const prisma = new PrismaClient();
    await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });
    await prisma.$disconnect();
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};
