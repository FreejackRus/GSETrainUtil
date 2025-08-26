import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  TextRun,
  BorderStyle,
  TabStopType,
} from "docx";
import * as fs from "fs/promises";
import * as path from "path";
import { ResponseJson } from "../../types/types";

interface Work {
  equipment: string;
  equipmentCount: string;
  typeWork: string;
}

interface Wagon {
  wagonNumber: string;
  wagonType: string;
  workPlace: string;
  arrEquipment: Work[];
}

interface TWagonDocx {
  applicationNumber: number;
  wagons: Wagon[];
}

function generateBodyRows(data: TWagonDocx): TableRow[] {
  const rows: TableRow[] = [];

  const commonWorks = [
    "Выезд специалиста в депо",
    "Дополнительные работы по демонтажу оборудования",
    "Дополнительные работы по монтажу оборудования",
  ];

  // --- Общие работы ---
  commonWorks.forEach((work) => {
    rows.push(
      new TableRow({
        children: [
          ...Array(4)
            .fill(null)
            .map(() => new TableCell({ children: [new Paragraph("")] })),
          new TableCell({ children: [new Paragraph(work)] }),
          ...Array(4)
            .fill(null)
            .map(() => new TableCell({ children: [new Paragraph("")] })),
        ],
      })
    );
  });


  // --- Вагоны ---
  data.wagons.forEach((wagon, index) => {
    // фильтруем только нужное оборудование
    const filteredEquipment = wagon.arrEquipment.filter(
      (eq) => eq.typeWork === "Монтаж" && !eq.equipment.includes("Mikrotik")
    );

    // если в вагоне есть подходящее оборудование
    filteredEquipment.forEach((eq, i) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(i === 0 ? `${index + 1}` : "")],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(i === 0 ? wagon.wagonNumber : "")],
            }),
            new TableCell({
              children: [new Paragraph(i === 0 ? wagon.wagonType : "")],
            }),
            new TableCell({
              children: [new Paragraph(i === 0 ? wagon.workPlace : "")],
            }),
            new TableCell({
              children: [new Paragraph(`Монтаж ${eq.equipment}`)],
            }),
            ...Array(4)
              .fill(null)
              .map(() => new TableCell({ children: [new Paragraph("")] })),
          ],
        })
      );
    });

    // Проверка кабельных трасс (только один раз, после первого вагона с оборудованием)
      rows.push(
        new TableRow({
          children: [
            ...Array(4)
              .fill(null)
              .map(() => new TableCell({ children: [new Paragraph("")] })),
            new TableCell({
              children: [new Paragraph("Проверка кабельных трасс")],
            }),
            ...Array(4)
              .fill(null)
              .map(() => new TableCell({ children: [new Paragraph("")] })),
          ],
        })
      );

    // --- Перечень оборудования ---
    filteredEquipment.forEach((eq) => {
      rows.push(
        new TableRow({
          children: [
            ...Array(5)
              .fill(null)
              .map(() => new TableCell({ children: [new Paragraph("")] })),
            new TableCell({ children: [new Paragraph(eq.equipment)] }),
            new TableCell({ children: [new Paragraph(eq.equipmentCount)] }),
            new TableCell({ children: [new Paragraph("")] }),
            new TableCell({ children: [new Paragraph("")] }),
          ],
        })
      );
    });
  });

  return rows;
}

export const createWordAppWork = async (
  json: ResponseJson,
  outputDir: string
) => {
  const wagons: Wagon[] = (json.carriageNumbers || []).map((carriage) => {
    const eqs =
      (json.equipmentDetails || [])
        .filter((e) => e.carriageNumber === carriage.number)
        .map((e) => ({
          equipment: e.name ?? "-",
          equipmentCount: "",
          typeWork: e.typeWork,
        })) ?? [];

    return {
      wagonNumber: carriage.number,
      wagonType: carriage.type,
      workPlace: json.currentLocation ?? "",
      arrEquipment: eqs,
    };
  });

  const resultJson: TWagonDocx = {
    applicationNumber: json.applicationNumber,
    wagons,
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 850, right: 850, bottom: 850, left: 850 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Заявка № ${resultJson.applicationNumber}`,
                bold: true,
                size: 32,
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "г. Москва",
                font: "Times New Roman",
                size: 24,
              }),
              new TextRun({
                text: "\tДата: _____________",
                font: "Times New Roman",
                size: 24,
              }),
            ],
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: 10000, // ширина страницы в twips (примерно 15.6 см)
              },
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 200 } }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 700 },
            children: [
              new TextRun({
                text: "Дата начала выполнения работ __________________________________________________",
                size: 24,
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 700 },
            children: [
              new TextRun({
                text: "Дата окончания выполнения работ ______________________________________________",
                size: 24,
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 700 },
            children: [
              new TextRun({
                text: "От Заказчика:",
                size: 24,
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 200 } }),

          // Таблица "шапки подписей"
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "DDDDDD",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "DDDDDD",
              },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "Заказ составил",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "______________",
                            size: 24,
                            font: "Times New Roman",
                            color: "DDDDDD",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "______________",
                            size: 24,
                            font: "Times New Roman",
                            color: "DDDDDD",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "______________",
                            size: 24,
                            font: "Times New Roman",
                            color: "DDDDDD",
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
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [new Paragraph("")],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "должность",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "подпись",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "расшифровка",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "DDDDDD",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "DDDDDD",
              },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "Заказ согласовал",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "______________",
                            size: 24,
                            font: "Times New Roman",
                            color: "DDDDDD",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "______________",
                            size: 24,
                            font: "Times New Roman",
                            color: "DDDDDD",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "______________",
                            size: 24,
                            font: "Times New Roman",
                            color: "DDDDDD",
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
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [new Paragraph("")],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "должность",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "подпись",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },

                    children: [
                      new Paragraph({
                        alignment: "center",

                        children: [
                          new TextRun({
                            text: "расшифровка",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 200 } }),

          // Таблица заявка
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  ...[
                    "№ п/п",
                    "Номер вагона",
                    "Тип вагона",
                    "Место проведения работ",
                    "Перечень работ",
                    "Наименование оборудования",
                    "Количество оборудования",
                    "Оборудование для резерва",
                    "Место доставки оборудования резерва",
                  ].map(
                    (text) =>
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text,
                                bold: true,
                                font: "Times New Roman",
                                size: 18,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                      })
                  ),
                ],
              }),
              ...generateBodyRows(resultJson),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 100 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Со стороны Подрядчика согласовал:",
                italics: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "DDDDDD",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 1,
                color: "DDDDDD",
              },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "_________________",
                            size: 24,
                            font: "Times New Roman",
                            color: "DDDDDD",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "_________________",
                            size: 24,
                            font: "Times New Roman",
                            color: "DDDDDD",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "(_________________)",
                            size: 24,
                            font: "Times New Roman",
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
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "должность",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "подпись",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "расшифровка",
                            size: 24,
                            font: "Times New Roman",
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
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "М.П.",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "",
                            size: 24,
                            font: "Times New Roman",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 200 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT, // прижали вправо
            children: [
              new TextRun({
                italics: true,
                text: "Дата «______»____________20____года",
                size: 24,
                font: "Times New Roman",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT, // прижали вправо
            children: [
              new TextRun({
                italics: true,
                text: "«______» час. «______» мин.",
                size: 24,
                font: "Times New Roman",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.resolve(
    outputDir,
    `Заявка_№${json.applicationNumber}.docx`
  );
  await fs.writeFile(filePath, buffer);

  return filePath;
};
