import { Request, Response } from "express";
import { createTechnicalActAcceptance } from "../../pdfGenerate/generate/technicalActAcceptance";
import { testJsonTechnicalActAcceptance } from "../../pdfGenerate/utils/testJson/testJsonTechnicalActAcceptance";
import { formatRussianDate } from "../../pdfGenerate/utils/stringConvertDate";
import path from "path";
import fs from "fs";

export const postPdfTechnicalActAcceptance = async (
  req: Request,
  res: Response
) => {
  const body = req.body;
  try {
    await createTechnicalActAcceptance(req.body, "./src/pdfFiles");

    // Название файла (то, что ты ожидаешь скачать)
    const fileName = `${req.body.trainNumber} от ${formatRussianDate(
      req.body.applicationDate
    )}pdf`;

    // Путь к файлу на сервере
    const filePath = path.resolve(__dirname, "../../pdfFiles", fileName);
    console.log(filePath);

    // Проверка: файл существует?
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Файл не найден");
    }

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
