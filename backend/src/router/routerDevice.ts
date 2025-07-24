import { Router } from "express";
import { deleteDevice } from "../controlers/Device/deleteDevice";
import { getDevice } from "../controlers/Device/getDevice";
import { patchDevice } from "../controlers/Device/patchDevice";
import { postDevice } from "../controlers/Device/postDevice";
import { updateDevice } from "../controlers/Device/updateDevice";
import { getUser } from "../controlers/User/getUser";
import { postUser } from "../controlers/User/postUser";

export const routerDevice = Router();

routerDevice.get("/devices", getDevice);
routerDevice.post("/devices", postDevice);
routerDevice.delete("/devices/:id", deleteDevice);
routerDevice.put("/devices/:id", updateDevice);
routerDevice.patch("/devices/:id", patchDevice);

routerDevice.get("/users", getUser);
routerDevice.post("/users", postUser);

