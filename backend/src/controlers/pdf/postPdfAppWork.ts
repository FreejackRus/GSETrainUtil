import { Request, Response } from "express";
import { createPdfAppWork } from "../../pdfGenerate/generate/applicationWork";
import { testJsonAppWork } from "../../pdfGenerate/utils/testJson/testJsonAppWork";
import path from "path";
import fs from "fs";
import {makePdfFilename, resolvePdfDir} from "../../config/pdf";

export const postPdfAppWork = async (req: Request, res: Response) => {
  const body = req.body;
  // await createPdfAppWork(testJsonAppWork,"./src/pdfFiles");
try {
    const PDF_DIR = resolvePdfDir();
    const fileName = makePdfFilename(body.applicationNumber);

    const filePath = await createPdfAppWork(body, PDF_DIR);

    // Проверка: файл существует?
    if (!fs.existsSync(filePath)) {
        const alt = path.resolve(PDF_DIR, fileName);
        if (!fs.existsSync(alt)) {
            return res.status(404).send("Файл не найден после генерации");
        }
    }

    const encoded = encodeURIComponent(fileName);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encoded}`);

    // Отправка файла клиенту
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Ошибка при отправке файла:", err);
        res.status(500).send("Не удалось скачать файл");
      }
    });
  } catch (err) {
    console.error("Ошибка генерации PDF:", err);
    res.status(500).send("Ошибка при генерации PDF");
  }
};
