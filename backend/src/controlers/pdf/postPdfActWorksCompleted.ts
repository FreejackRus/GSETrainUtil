import { Request, Response } from "express";
import { createActWorksCompleted } from "../../pdfGenerate/generate/actWorksCompleted";
import {  testJsonActWorksCompleted } from "../../pdfGenerate/utils/testJson/testJsonActWorksCompleted";

export const postPdfActWorksCompleted = async (req: Request, res: Response) => {
  const body = req.body;
  
  // await createActWorksCompleted(body,"./src/pdfFiles");
  // await createActWorksCompleted(testJsonActWorksCompleted,"./src/pdfFiles");
  res.sendStatus(200)
};
