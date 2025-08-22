import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  PageBreak,
  TextRun,
  SectionType,
} from "docx";
import * as fs from "fs/promises";
import path from "path";
import { equipmentDetails, ResponseJson } from "../../types/types";
import { formatRussianDate } from "../../pdfGenerate/utils/stringConvertDate";

interface arrEquipment {
  carriageNumber: string;
  carriageType: string;
  equipment: equipmentDetails[];
}

interface Act {
  actNumber: string;
  date: string;
  contractNumber: string;
  contractDate: string;
  equipmentData: arrEquipment[];
}

function safeName(s: string) {
  return String(s)
    .replace(/[\\/:*?"<>|]+/g, "")
    .trim();
}

function createSections(act: Act) {
  const sections: any[] = [];

  act.equipmentData.forEach((item, index) => {
    // Разделяем оборудование на Mikrotik Hex и остальное
    const mikrotikEquipment = item.equipment.filter((eq) =>
      eq.name?.includes("Mikrotik Hex")
    );
    const otherEquipment = item.equipment.filter(
      (eq) => !eq.name?.includes("Mikrotik Hex")
    );

    // Функция для генерации секции
    const generateSection = (equipmentList: equipmentDetails[]) => ({
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          margin: { top: 850, right: 850, bottom: 1440, left: 850 },
        },
      },
      children: [
        // Заголовок
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Технический Акт (приемки)",
              bold: true,
              font: "Arial",
              size: 24,
            }),
          ],
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `№ ${act.actNumber} от ${act.date}`,
              font: "Times New Roman",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `в соответствии с Договором № ${act.contractNumber} от ${act.contractDate}`,
              font: "Times New Roman",
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: "Оборудование смонтировано на линейном вагоне:",
              font: "Times New Roman",
              size: 24,
            }),
          ],
        }),

        // Таблица линейного вагона
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "№ п/п",
                          bold: true,
                          font: "Times New Roman",
                          size: 20,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "Данные по составу",
                          bold: true,
                          font: "Times New Roman",
                          size: 20,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "Примечание",
                          bold: true,
                          font: "Times New Roman",
                          size: 20,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "1",
                          font: "Times New Roman",
                          size: 24,
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
                          text: "Номер линейного вагона",
                          font: "Times New Roman",
                          size: 24,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: item.carriageNumber || "-",
                          font: "Times New Roman",
                          size: 24,
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
                          text: "",
                          font: "Times New Roman",
                          size: 24,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "2",
                          font: "Times New Roman",
                          size: 24,
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
                          text: "Тип линейного вагона",
                          font: "Times New Roman",
                          size: 24,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: item.carriageType || "-",
                          font: "Times New Roman",
                          size: 24,
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
                          text: "",
                          font: "Times New Roman",
                          size: 24,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: "Данные по смонтированному оборудованию:",
              font: "Times New Roman",
              size: 24,
            }),
          ],
        }),

        // Таблица оборудования для текущей секции
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "№ п/п",
                          font: "Times New Roman",
                          size: 20,
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "Оборудование",
                          font: "Times New Roman",
                          size: 20,
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "Серийный номер",
                          font: "Times New Roman",
                          size: 20,
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "Примечание",
                          font: "Times New Roman",
                          size: 20,
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            ...equipmentList.map(
              (eq, idx) =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: (idx + 1).toString(),
                              font: "Times New Roman",
                              size: 24,
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
                              text: eq.name || "-",
                              font: "Times New Roman",
                              size: 24,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: eq.serialNumber || "-",
                              font: "Times New Roman",
                              size: 24,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "",
                              font: "Times New Roman",
                              size: 24,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                })
            ),
          ],
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "", font: "Times New Roman", size: 24 }),
          ],
          spacing: { before: 200 },
        }),

        // Блок подписей
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

        // Разделитель страницы, кроме последней секции
        ...(index !== act.equipmentData.length - 1
          ? [new Paragraph({ children: [new PageBreak()] })]
          : []),
      ],
    });

    // Секция с остальным оборудованием
    if (otherEquipment.length > 0)
      sections.push(generateSection(otherEquipment));

    // Секция с Mikrotik Hex
    if (mikrotikEquipment.length > 0)
      sections.push(generateSection(mikrotikEquipment));
  });

  return sections;
}

export const createWordTechnicalActAcceptance = async (
  json: ResponseJson,
  outputDir: string
) => {
  const carriageTypeMap = new Map(
    (json.carriageNumbers ?? []).map((c) => [c.number, c.type])
  );

  const arrEquipment = Object.values(
    (json.equipmentDetails ?? []).reduce((acc, item) => {
      if (!item.carriageNumber) return acc;
      const number = item.carriageNumber;
      if (!acc[number]) {
        acc[number] = {
          carriageNumber: number,
          carriageType: carriageTypeMap.get(number) || "Неизвестный тип",
          equipment: [],
        };
      }
      acc[number].equipment.push(item);
      return acc;
    }, {} as Record<string, arrEquipment>)
  );

  const resultJson: Act = {
    actNumber: String(json.applicationNumber),
    contractNumber: json.contractNumber,
    contractDate: json.contractDate ?? "«__».____.____ г.",
    date: formatRussianDate(json.applicationDate),
    equipmentData: arrEquipment,
  };

  const doc = new Document({
    sections: createSections(resultJson),
  });

  await fs.mkdir(outputDir, { recursive: true });
  const fileName = `${safeName(json.trainNumber)} от ${safeName(
    formatRussianDate(json.applicationDate)
  )}docx`;
  const filePath = path.resolve(outputDir, fileName);

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(filePath, buffer);
  return filePath;
};
