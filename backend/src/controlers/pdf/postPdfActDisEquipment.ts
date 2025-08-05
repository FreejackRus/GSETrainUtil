import { Request, Response } from "express";
import { createPdfActDisEquipment } from "../../pdfGenerate/generate/actDisEquipment";
import { testJsonActDisEquipment } from "../../pdfGenerate/utils/testJson/testJsonActDisEquipment";
import path from "path";
import fs from "fs";

export const postPdfActDisEquipment = async (req: Request, res: Response) => {
  const body = req.body;
  console.log(body);
   try {
    // Генерация PDF (или любого файла)
    await createPdfActDisEquipment(req.body, "./src/pdfFiles");

    // Название файла (то, что ты ожидаешь скачать)
    const fileName = `Акт демонтажа№${req.body.applicationNumber}.pdf`;

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
