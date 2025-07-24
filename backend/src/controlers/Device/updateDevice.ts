import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";
import { TRequestDevice } from "../../utils/types/requestDevice";

export const updateDevice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status, count } = <TRequestDevice>req.body;

  try {
    if (!name || !status || !count) {
      res.status(500).json({ error: "не все поля указаны в json" });
    }
    
    const prisma = new PrismaClient();
    await prisma.device.update({
      where: {
        id: Number(id),
      },
      data: {
        count: count,
        name: name,
        status: status,
      },
    });

    await prisma.$disconnect();
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};
