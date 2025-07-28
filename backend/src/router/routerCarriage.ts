import { Router } from 'express';
import { getCarriages } from '../controlers/carriage/getCarriages';
import { getCarriageById } from '../controlers/carriageController';

const routerCarriage = Router();

// GET /api/v1/carriages - получить все вагоны с оборудованием
routerCarriage.get('/carriages', getCarriages);

// GET /api/v1/carriages/:carriageNumber - получить конкретный вагон
routerCarriage.get('/carriages/:carriageNumber', getCarriageById);

export { routerCarriage };