import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageOrientation,
  TableBorders,
  ImageRun,
} from "docx";
import fs from "fs/promises";
import path from "path";
import { equipmentDetails, ResponseJson } from "../../types/types";
import { formatRussianDate } from "../../pdfGenerate/utils/stringConvertDate";

interface InstallationingActData {
  actNumber: string;
  actDate: string;
  contractNumber: string;
  contractDate: string;
  applicationNumber: string;
  equipment: equipmentDetails[];
}

export const createWordActInstEquipment = async (
  json: ResponseJson,
  outputDir: string
) => {
//  const imageBuffer: Buffer = await fs.readFile("./logo.png");
  const applicationNumber = json.applicationNumber;
  const applicationDate = json.applicationDate || "«___»______.____г.";
  const contractNumber = json.contractNumber || "____________________";
  const equipmentDetails = json.equipmentDetails || [];
  const actDate = "«___»______.____г.";

  const resultJson: InstallationingActData = {
    actNumber: String(applicationNumber),
    actDate: actDate,
    contractNumber: contractNumber,
    contractDate: formatRussianDate(applicationDate),
    applicationNumber: String(applicationNumber),
    equipment: equipmentDetails,
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT, // правильный синтаксис
            },
            margin: { top: 850, right: 850, bottom: 1440, left: 850 },
          },
        },
        children: [
          // // Маленький текст сверху
          // new Paragraph({
          //   children: [
          //     new TextRun({
          //       text: "Организация: ООО «Пример»",
          //       font: "Times New Roman",
          //       size: 16, // маленький размер
          //     }),
          //   ],
          //   spacing: { after: 100 },
          // }),

          // // Логотип/картинка сверху
          // new Paragraph({
          //   children: [
          //     new ImageRun({
          //       data: imageBuffer,
          //       transformation: { width: 100, height: 100 },
          //     }),
          //   ],
          //   alignment: AlignmentType.CENTER,
          // }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "АКТ монтажа оборудования",
                bold: true,
                size: 24,
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `№ ${resultJson.actNumber} от ${resultJson.actDate}`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `в соответствии с Договором № ${resultJson.contractNumber} от ${resultJson.contractDate}`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: `1. Подрядчик выполнил демонтаж оборудования Заказчику в соответствии с Заявкой № ${resultJson.applicationNumber} и условиями Договора № ${resultJson.contractNumber} от ${resultJson.contractDate}, а именно:`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "", font: "Times New Roman", size: 24 }),
            ],
            spacing: { before: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "000000",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "000000",
              },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "№ п/п",
                            bold: true,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Номер вагона",
                            bold: true,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Наименование оборудования",
                            bold: true,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Серийный номер оборудования",
                            bold: true,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                ],
              }),
              ...resultJson.equipment.map(
                (item, index) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: `${String(index + 1)}.`,
                                font: "Times New Roman",
                                size: 24,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: item.carriageNumber || "-",
                                size: 24,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: item.name || "-", size: 24 }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: item.serialNumber || "-",
                                size: 24,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),
          new Paragraph({
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: `2. С момента подписания настоящего акта, ответственность за сохранность и безопасность оборудования возлагается на Заказчика.`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "", font: "Times New Roman", size: 24 }),
            ],
            spacing: { before: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Подрядчик:",
                            font: "Times New Roman",
                            size: 24,
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({ children: [new TextRun({ text: "" })] }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "________________ ________________________",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "(должность) (наименование организации)",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({ children: [new TextRun({ text: "" })] }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "_______________________(________________________)",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "(подпись)                                    (Ф.И.О.)",
                            font: "Times New Roman",
                            size: 18,
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Заказчик:",
                            font: "Times New Roman",
                            size: 24,
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({ children: [new TextRun({ text: "" })] }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "________________ ________________________",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "(должность) (наименование организации)",
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({ children: [new TextRun({ text: "" })] }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "_______________________(________________________)",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "(подпись)                                    (Ф.И.О.)",
                            font: "Times New Roman",
                            size: 18,
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });
  // Формируем путь к файлу
  await fs.mkdir(outputDir, { recursive: true });
  const fileName = `Акт монтажа №${
    String(applicationNumber).trim() || "unknown"
  }.docx`;
  const filePath = path.resolve(outputDir, fileName);

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(filePath, buffer);

  return filePath;
};
