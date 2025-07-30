import { Request, Response } from "express";
import { jsonData } from "../../pdfGenerate/utils/testJson/testJsonAppWork";
import { actData } from "../../pdfGenerate/utils/testJson/testJsonActDisEquipment";
import { createPdfActDisEquipment } from "../../pdfGenerate/generate/actDisEquipment";

export const postPdfActDisEquipment = async (req: Request, res: Response) => {
  const body = req.body;
  await createPdfActDisEquipment(body,"./src/pdfFiles");
  res.sendStatus(200)
};
