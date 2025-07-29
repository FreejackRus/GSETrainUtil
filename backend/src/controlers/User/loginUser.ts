import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export const loginUser = async (req: Request, res: Response) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: "Не все поля указаны" });
  }
  
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { login } });
  
  await prisma.$disconnect();
  if (!user) {
    return res.status(401).json({ error: "Неверный логин или пароль" });
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    return res.status(401).json({ error: "Неверный логин или пароль" });
  }
  const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
};
