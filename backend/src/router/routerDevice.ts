/// <reference path="../types/express.d.ts" />
import { Router, Request, Response } from "express";
import { deleteDevice } from "../controlers/Device/deleteDevice";
import { getDevice } from "../controlers/Device/getDevice";
import { patchDevice } from "../controlers/Device/patchDevice";
import { postDevice } from "../controlers/Device/postDevice";
import { updateDevice } from "../controlers/Device/updateDevice";
import { getUser } from "../controlers/User/getUser";
import { postUser } from "../controlers/User/postUser";
import { deleteUser } from "../controlers/User/deleteUser";
import { loginUser } from "../controlers/User/loginUser";
import { authMiddleware } from "../middleware/authMiddleware";
import { getTypeWork } from "../controlers/typeWork/getTypeWork";
import { getEquipment } from "../controlers/equipment/getEquipment";
import { getTrainNumber } from "../controlers/trainNumber/getTrainNumber";
import { getTypeCarriage } from "../controlers/typeCarriage/getTypeCarriage";
import { getCurrentLocation } from "../controlers/currentLocation/getCurrentLocation";
import { getCompletedJob } from "../controlers/completedJob/getCompletedJob";
import { uploadPhoto, uploadMultiplePhotos } from "../controlers/upload/uploadPhoto";
import { createApplication } from "../controlers/application/createApplication";
import { getApplications, getApplicationById } from "../controlers/application/getApplications";

export const routerDevice = Router();

routerDevice.get("/devices", getDevice);
routerDevice.post("/devices", postDevice);
routerDevice.delete("/devices/:id", deleteDevice);
routerDevice.put("/devices/:id", updateDevice);
routerDevice.patch("/devices/:id", patchDevice);

routerDevice.get("/users", getUser);
routerDevice.post("/users", postUser);
routerDevice.delete("/users/:id", deleteUser);
routerDevice.post("/login", loginUser);

routerDevice.get("/typeWork", getTypeWork);
routerDevice.get("/equipment", getEquipment);
routerDevice.get("/trainNumber", getTrainNumber);
routerDevice.get("/typeCarriage", getTypeCarriage);
routerDevice.get("/currentLocation", getCurrentLocation);
routerDevice.get("/completedJob", getCompletedJob);

// Роуты для работы с заявками
routerDevice.post("/applications", createApplication);
routerDevice.get("/applications", getApplications);
routerDevice.get("/applications/:id", getApplicationById);

// Роуты для загрузки файлов
routerDevice.post("/upload/photo", uploadPhoto);
routerDevice.post("/upload/photos", uploadMultiplePhotos);






// Пример защищённого роута:
routerDevice.get("/me", authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

