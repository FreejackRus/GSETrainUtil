import { Request, Response } from "express";
import { createTechnicalActAcceptance } from "../../pdfGenerate/generate/technicalActAcceptance";
import { testJsonTechnicalActAcceptance } from "../../pdfGenerate/utils/testJson/testJsonTechnicalActAcceptance";

export const postPdfTechnicalActAcceptance = async (
  req: Request,
  res: Response
) => {
  const body = req.body;

  await createTechnicalActAcceptance(body, "./src/pdfFiles");
  // await createTechnicalActAcceptance(
  //   testJsonTechnicalActAcceptance,
  //   "./src/pdfFiles"
  // );

  res.sendStatus(200);
};
