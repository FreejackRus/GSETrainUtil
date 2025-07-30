import { Request, Response } from "express";
import { createPdfAppWork } from "../../pdfGenerate/generate/applicationWork";
import { jsonData } from "../../pdfGenerate/utils/testJson/testJsonAppWork";

export const postPdfAppWork = async (req: Request, res: Response) => {
  const body = req.body;
  await createPdfAppWork(body,"./src/pdfFiles");
  res.sendStatus(200)
};
