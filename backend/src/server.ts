import express, { Request, Response, Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { routerDevice } from "./router/routerDevice";
import { routerCarriage } from "./router/routerCarriage";
import { routerWorkLog } from "./router/routerWorkLog";
import { routerPdfGenerate } from "./router/routerPdfGenerate";
import archiveRoutes from "./routes/archiveRoutes";

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
  })
);

// Middleware для обслуживания статических файлов (изображений)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Middleware для обслуживания статических файлов из корневой директории (для временных файлов)
app.use(express.static(process.cwd(), {
  setHeaders: (res, path) => {
    // Добавляем CORS заголовки для изображений
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// Middleware для логирования всех запросов
app.use((req, res, next) => {
  console.log(`MAIN SERVER REQUEST: ${req.method} ${req.url}`);
  next();
});

// Middleware для обработки ошибок
app.use((err: any, req: any, res: any, next: any) => {
  console.error('ERROR:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.use("/api/v1", routerDevice);
app.use("/api/v1", routerCarriage);
app.use("/api/v1", routerWorkLog);
app.use("/api/v1", routerPdfGenerate);
app.use("/api/v1/archive", archiveRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
