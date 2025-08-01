/// <reference path="../types/express.d.ts" />
import { Router, Request, Response } from "express";
import { getUser } from "../controlers/User/getUser";
import { postUser } from "../controlers/User/postUser";
import { deleteUser } from "../controlers/User/deleteUser";
import { loginUser } from "../controlers/User/loginUser";
import { authMiddleware } from "../middleware/authMiddleware";
import { getTypeWork } from "../controlers/typeWork/getTypeWork";
import { getEquipment } from "../controlers/equipment/getEquipment";
import { getDevices } from "../controlers/equipment/getDevices";
import { getCarriages } from "../controlers/carriage/getCarriages";
import { getTrainNumber } from "../controlers/trainNumber/getTrainNumber";
import { getTypeCarriage } from "../controlers/typeCarriage/getTypeCarriage";
import { getCurrentLocation } from "../controlers/currentLocation/getCurrentLocation";
import { getCompletedJob } from "../controlers/completedJob/getCompletedJob";
import { uploadPhoto, uploadMultiplePhotos } from "../controlers/upload/uploadPhoto";
import { createApplication } from "../controlers/application/createApplication";
import { getApplications, getApplicationById } from "../controlers/application/getApplications";
import { getDrafts, completeDraft, deleteDraft } from "../controlers/application/draftController";
import { upload, uploadFiles, getFile } from "../controlers/application/fileController";

export const routerDevice = Router();

// Middleware для логирования всех запросов
routerDevice.use((req: Request, res: Response, next) => {
  console.log(`REQUEST: ${req.method} ${req.path}`);
  next();
});

// Маршрут для получения оборудования (совместимость с фронтендом)
routerDevice.get("/devices", getDevices);

// Маршрут для получения информации о вагонах
routerDevice.get("/carriages", getCarriages);

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

// Роуты для работы с черновиками (должны быть ПЕРЕД роутами с параметрами)
routerDevice.post("/applications/draft", createApplication); // Создание черновика
routerDevice.get("/applications/drafts", (req: Request, res: Response) => {
  console.log('DRAFTS ROUTE CALLED!');
  return getDrafts(req, res);
}); // Получение всех черновиков
routerDevice.put("/applications/draft/:id", createApplication); // Обновление черновика
routerDevice.delete("/applications/drafts/:id", deleteDraft); // Удаление черновика

// Роуты с параметрами для завершения черновика (специфичный путь)
routerDevice.put("/applications/:id/complete", completeDraft); // Завершение черновика

// Общие роуты с параметрами (должны быть В САМОМ КОНЦЕ)
routerDevice.get("/applications/:id", (req: Request, res: Response) => {
  console.log('ID ROUTE CALLED with id:', req.params.id);
  return getApplicationById(req, res);
});
routerDevice.put("/applications/:id", createApplication); // Обновление заявки

// Роуты для загрузки файлов
routerDevice.post("/upload/photo", uploadPhoto);
routerDevice.post("/upload/photos", uploadMultiplePhotos);
routerDevice.post("/applications/upload", upload.fields([
  { name: 'carriagePhoto', maxCount: 1 },
  { name: 'generalPhoto', maxCount: 1 },
  { name: 'finalPhoto', maxCount: 1 },
  { name: 'equipmentPhoto', maxCount: 10 },
  { name: 'serialPhoto', maxCount: 10 },
  { name: 'macPhoto', maxCount: 10 }
]), uploadFiles);
routerDevice.get("/uploads/:filename", getFile); // Получение загруженного файла

// Пример защищённого роута:
routerDevice.get("/me", authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

