import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createWordTechnicalActAcceptance } from "../../wordGenerate/generate/technicalActAcceptance";
import { resolveWordDir } from "../../config/word";

export const postWordTechnicalActAcceptance = async (
  req: Request,
  res: Response
) => {
  try {
    const { trainNumber, applicationDate } = req.body || {};
    if (!trainNumber || !applicationDate) {
      return res.status(400).send("trainNumber и applicationDate обязательны");
    }

    const wordDir = resolveWordDir();
    console.log(wordDir);
    
    // генератор создаёт и возвращает полный путь к файлу
    const filePath = await createWordTechnicalActAcceptance(req.body, wordDir);
    const fileName = path.basename(filePath);
    console.log(filePath);

    // Проверка: файл существует?
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Файл не найден после генерации");
    }

    const encoded = encodeURIComponent(fileName);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
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
