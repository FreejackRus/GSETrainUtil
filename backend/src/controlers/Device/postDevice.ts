import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";
import { TRequestDevice } from "../../utils/types/requestDevice";

export const postDevice = async (req: Request, res: Response) => {
  const { name, status, count } = <TRequestDevice>req.body;

  try {
    const prisma = new PrismaClient();

    if (!name || !status || !count) {
      res.status(500).json({ error: "не все поля указаны в json" });
    }

    await prisma.device.create({
      data: { count: count, name: name, status: status },
    });
    await prisma.$disconnect();
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};
