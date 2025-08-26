import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import {makePdfFilename, resolvePdfDir} from "../../config/pdf";
import { createWordAppWork } from "../../wordGenerate/generate/applicationWork";
import { makeWordFilename, resolveWordDir } from "../../config/word";

export const postWordAppWork = async (req: Request, res: Response) => {
  const body = req.body;
try {
    const WORD_DIR = resolveWordDir();
    const fileName = makeWordFilename(body.applicationNumber);

    const filePath = await createWordAppWork(body, WORD_DIR);

    // Проверка: файл существует?
    if (!fs.existsSync(filePath)) {
        const alt = path.resolve(WORD_DIR, fileName);
        if (!fs.existsSync(alt)) {
            return res.status(404).send("Файл не найден после генерации");
        }
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
    console.error("Ошибка генерации Word:", err);
    res.status(500).send("Ошибка при генерации Word");
  }
};
