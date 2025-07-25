import express, { Request, Response, Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { routerDevice } from "./router/routerDevice";

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5175"],
  })
);

app.use("/api/v1", routerDevice);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
