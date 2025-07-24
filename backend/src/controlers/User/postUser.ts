import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";
import { TRequestUser } from "../../utils/types/requestDevice";
import crypto from "crypto";
export const postUser = async (req: Request, res: Response) => {
  const { login, password, role } = <TRequestUser>req.body;
  console.log(login,password,role);
  
  const hashPassword = crypto.createHash("md5").update(password).digest("hex");

  try {
    if (!login || !password) {
      res.status(500).json({ error: "не все поля указаны в json" });
    }

    const prisma = new PrismaClient();
    await prisma.user.create({
      data: { login: login, password: hashPassword, role: role || "user" },
    });
    await prisma.$disconnect();
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};
