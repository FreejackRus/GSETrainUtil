import { Request, Response } from "express";
import { createPdfAppWork } from "../../pdfGenerate/generate/applicationWork";
import { jsonData } from "../../pdfGenerate/utils/testJson/testJsonAppWork";
import { createTechnicalActAcceptance } from "../../pdfGenerate/generate/technicalActAcceptance";
import { actsData } from "../../pdfGenerate/utils/testJson/testJsonTechnicalActAcceptance";

export const postPdfTechnicalActAcceptance = async (req: Request, res: Response) => {
  const body = req.body;
  
  await createTechnicalActAcceptance(body,"./src/pdfFiles");
  res.sendStatus(200)
};
