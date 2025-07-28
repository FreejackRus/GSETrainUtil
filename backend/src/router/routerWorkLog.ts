import { Router } from 'express';
import { getWorkLog, getWorkLogById, updateWorkLogById } from '../controlers/workLogController';

const routerWorkLog = Router();

// GET /api/v1/work-log - получить весь журнал работ
routerWorkLog.get('/work-log', getWorkLog);

// GET /api/v1/work-log/:id - получить конкретную запись журнала
routerWorkLog.get('/work-log/:id', getWorkLogById);

// PUT /api/v1/work-log/:id - обновить конкретную запись журнала
routerWorkLog.put('/work-log/:id', updateWorkLogById);

export { routerWorkLog };