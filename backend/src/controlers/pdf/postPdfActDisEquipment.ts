import { Request, Response } from "express";
import { createPdfActDisEquipment } from "../../pdfGenerate/generate/actDisEquipment";
import { testJsonActDisEquipment } from "../../pdfGenerate/utils/testJson/testJsonActDisEquipment";

export const postPdfActDisEquipment = async (req: Request, res: Response) => {
  const body = req.body;
  await createPdfActDisEquipment(body,"./src/pdfFiles");
  // await createPdfActDisEquipment(testJsonActDisEquipment,"./src/pdfFiles");
  res.sendStatus(200)
};
