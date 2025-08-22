import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import * as fs from "fs";

// Создаем документ
const doc = new Document({
    sections: [
        {
            children: [
                // Заголовок
                new Paragraph({
                    text: "Пример документа",
                    heading: "Title",
                }),

                // Обычный текст
                new Paragraph({
                    children: [
                        new TextRun("Привет! Это пример документа Word, созданного на TypeScript."),
                        new TextRun({
                            text: " Жирный текст",
                            bold: true,
                        }),
                    ],
                }),

                // Таблица
                new Table({
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Ячейка 1")] }),
                                new TableCell({ children: [new Paragraph("Ячейка 2")] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph("Ячейка 3")] }),
                                new TableCell({ children: [new Paragraph("Ячейка 4")] }),
                            ],
                        }),
                    ],
                }),
            ],
        },
    ],
});

// Генерация файла
Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("example.docx", buffer);
    console.log("Документ создан!");
});
