/// <reference path="../types/express.d.ts" />
import { Router, Request, Response } from "express";
import { deleteDevice } from "../controlers/Device/deleteDevice";
import { getDevice } from "../controlers/Device/getDevice";
import { patchDevice } from "../controlers/Device/patchDevice";
import { postDevice } from "../controlers/Device/postDevice";
import { updateDevice } from "../controlers/Device/updateDevice";
import { getUser } from "../controlers/User/getUser";
import { postUser } from "../controlers/User/postUser";
import { loginUser } from "../controlers/User/loginUser";
import { authMiddleware } from "../middleware/authMiddleware";

export const routerDevice = Router();

routerDevice.get("/devices", getDevice);
routerDevice.post("/devices", postDevice);
routerDevice.delete("/devices/:id", deleteDevice);
routerDevice.put("/devices/:id", updateDevice);
routerDevice.patch("/devices/:id", patchDevice);

routerDevice.get("/users", getUser);
routerDevice.post("/users", postUser);
routerDevice.post("/login", loginUser);

// Пример защищённого роута:
routerDevice.get("/me", authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

