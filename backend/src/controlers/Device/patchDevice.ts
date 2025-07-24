import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";
import { TRequestDevice } from "../../utils/types/requestDevice";

export const patchDevice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status, count } = <TRequestDevice>req.body;
    console.log(name,status,count);
    
  try {
    const prisma = new PrismaClient();
    await prisma.device.update({
      where: {
        id: Number(id),
      },
      data: {
        count: count || undefined,
        name: name || undefined,
        status: status || undefined,
      },
    });

    await prisma.$disconnect();
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};
