import express, { Request, Response, Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { routerDevice } from "./router/routerDevice";
import { routerCarriage } from "./router/routerCarriage";
import { routerWorkLog } from "./router/routerWorkLog";

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

app.use("/api/v1", routerDevice);
app.use("/api/v1", routerCarriage);
app.use("/api/v1", routerWorkLog);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
