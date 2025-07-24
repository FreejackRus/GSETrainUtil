import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";
import { TRequestDevice } from "../../utils/types/requestDevice";

export const deleteDevice = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const prisma = new PrismaClient();
    await prisma.device.delete({
      where: {
        id: Number(id),
      },
    });
    await prisma.$disconnect();
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};
