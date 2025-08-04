import { Request, Response } from "express";
import { createPdfAppWork } from "../../pdfGenerate/generate/applicationWork";
import { testJsonAppWork } from "../../pdfGenerate/utils/testJson/testJsonAppWork";
import path from "path";
import fs from "fs";

export const postPdfAppWork = async (req: Request, res: Response) => {
  const body = req.body;
  // await createPdfAppWork(testJsonAppWork,"./src/pdfFiles");
try {
     await createPdfAppWork(body,"./src/pdfFiles");

    // Название файла (то, что ты ожидаешь скачать)
    const fileName = `Заявка_№${body.applicationNumber}.pdf`;

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
