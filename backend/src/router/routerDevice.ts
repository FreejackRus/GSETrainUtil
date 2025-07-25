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
import { getTypeWork } from "../controlers/typeWork/getTypeWork";
import { getEquipment } from "../controlers/equipment/getEquipment";
import { getTrainNumber } from "../controlers/trainNumber/getTrainNumber";
import { getTypeCarriage } from "../controlers/typeCarriage/getTypeCarriage";

export const routerDevice = Router();

routerDevice.get("/devices", getDevice);
routerDevice.post("/devices", postDevice);
routerDevice.delete("/devices/:id", deleteDevice);
routerDevice.put("/devices/:id", updateDevice);
routerDevice.patch("/devices/:id", patchDevice);

routerDevice.get("/users", getUser);
routerDevice.post("/users", postUser);
routerDevice.post("/login", loginUser);

routerDevice.get("/typeWork", getTypeWork);
routerDevice.get("/equipment", getEquipment);
routerDevice.get("/trainNumber", getTrainNumber);
routerDevice.get("/typeCarriage", getTypeCarriage);






// Пример защищённого роута:
routerDevice.get("/me", authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

