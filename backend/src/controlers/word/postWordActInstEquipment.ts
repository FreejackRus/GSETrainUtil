import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import {resolvePdfDir} from "../../config/pdf";
import { createPdfActInstEquipment } from "../../pdfGenerate/generate/actInstEquipment";
import { resolveWordDir } from "../../config/word";
import { createWordActInstEquipment } from "../../wordGenerate/generate/actInstEquipment";

export const postWordActInstEquipment = async (req: Request, res: Response) => {
  const body = req.body;
  console.log(body);
   try {
       const WORD_DIR = resolveWordDir();
       const fileName = `Акт монтажа №${String(body.applicationNumber).trim() || "unknown"}.docx`;

       // генерим прямо в WORD_DIR, генератор вернёт полный путь
       const filePath = await createWordActInstEquipment(body, WORD_DIR);
        console.log(filePath);
    
    // Проверка: файл существует?
       if (!fs.existsSync(filePath)) {
           // подстрахуемся на случай иного имени
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
    console.error("Ошибка генерации PDF:", err);
    res.status(500).send("Ошибка при генерации PDF");
  }
};
