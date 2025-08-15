import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { TRequestUser } from "../../utils/types/requestUser";
import bcrypt from "bcrypt";

function handleRole(role: string): 'admin' | 'engineer' {
  switch (role) {
    case 'admin': return 'admin';
    case 'engineer': return 'engineer';
    default: return 'engineer';
  }
}

export const postUser = async (req: Request, res: Response) => {
  const { login, password, role, name } = <TRequestUser>req.body;
  console.log(login, password, role, name);

  try {
    if (!login || !password ) {
      return res.status(400).json({ error: "не все поля указаны в json" });
    }
    const prisma = new PrismaClient();
    const existingUser = await prisma.user.findUnique({
      where:{
        login:login
      },
    });
    if (existingUser) {
      await prisma.$disconnect();
      return res.status(409).json({ error: "Пользователь уже существует" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { login: login, password: hashPassword, role: handleRole(role), name: name || "" },
    });
    await prisma.$disconnect();
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};
