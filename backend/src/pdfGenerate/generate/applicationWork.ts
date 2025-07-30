import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs/promises";
import {
  fontBoldData,
  fontBoldItalicData,
  fontItalicData,
  fontRegularData,
  nameTimesNewRomanBd,
  nameTimesNewRomanBdItalic,
  nameTimesNewRomanItalic,
  nameTimesNewRomanRegular,
} from "../utils/config";
import { jsonData } from "../utils/testJson/testJsonAppWork";
import path from "path";

interface Work {
  description: string;
  equipment: string[];
  equipmentCount: number[];
}

interface Wagon {
  wagonNumber: string;
  wagonType: string;
  workPlace: string;
  works: Work[];
}
interface IJson {
  wagons:Wagon[]
}
function generateBody(data: Wagon[]): string[][] {
  const body: string[][] = [];
  let rowIndex = 1;

  data.forEach((wagon: Wagon) => {
    const baseRow = [
      rowIndex.toString(),
      wagon.wagonNumber,
      wagon.wagonType,
      wagon.workPlace,
      "", // Перечень работ
      "", // Наименование оборудования
      "", // Количество оборудования
      "", // Оборудование для обеспечения резерва
      "", // Место доставки оборудования для обеспечения резерва
    ];

    let firstWork = true;

    wagon.works.forEach((work: Work) => {
      if (firstWork) {
        if (work.equipment.length === 0) {
          body.push([...baseRow.slice(0, 4), work.description, "", "", "", ""]);
        } else {
          body.push([
            ...baseRow.slice(0, 4),
            work.description,
            work.equipment[0],
            work.equipmentCount[0]?.toString() || "",
            "",
            "",
          ]);
          for (let i = 1; i < work.equipment.length; i++) {
            body.push([
              "",
              "",
              "",
              "",
              "",
              work.equipment[i],
              work.equipmentCount[i]?.toString() || "",
              "",
              "",
            ]);
          }
        }
        firstWork = false;
      } else {
        if (work.equipment.length === 0) {
          body.push(["", "", "", "", work.description, "", "", "", ""]);
        } else {
          body.push([
            "",
            "",
            "",
            "",
            work.description,
            work.equipment[0],
            work.equipmentCount[0]?.toString() || "",
            "",
            "",
          ]);
          for (let i = 1; i < work.equipment.length; i++) {
            body.push([
              "",
              "",
              "",
              "",
              "",
              work.equipment[i],
              work.equipmentCount[i]?.toString() || "",
              "",
              "",
            ]);
          }
        }
      }
    });

    rowIndex++;
  });

  return body;
}
export const createRequestForm = (doc: jsPDF, data: Wagon[]) => {
  doc.addFileToVFS(
    nameTimesNewRomanRegular,
    fontRegularData.toString("base64")
  );
  doc.addFont(nameTimesNewRomanRegular, "Font", "normal");
  doc.addFileToVFS(nameTimesNewRomanBd, fontBoldData.toString("base64"));
  doc.addFont(nameTimesNewRomanBd, "Font", "bold");
  doc.addFileToVFS(nameTimesNewRomanItalic, fontItalicData.toString("base64"));
  doc.addFont(nameTimesNewRomanItalic, "Font", "italic");
  doc.addFileToVFS(
    nameTimesNewRomanBdItalic,
    fontBoldItalicData.toString("base64")
  );
  doc.addFont(nameTimesNewRomanBdItalic, "Font", "italicBold");

  const marginLeft = 15;
  const indent = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const fontSize = 12;
  const marginRight = 15;
  let currentY = 20;

  doc.setFontSize(16);
  doc.setFont("Font", "bold");
  doc.text("Заявка № 7", pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  const leftText = "г. Москва";
  const rightText = "Дата: ____.07.2025";
  doc.setFontSize(fontSize);
  doc.setFont("Font", "normal");
  doc.text(leftText, marginLeft, currentY);
  const rightTextWidth = doc.getTextWidth(rightText);
  doc.text(rightText, pageWidth - marginRight - rightTextWidth, currentY);

  doc.text(
    "Дата начала выполнения работ ____________________________________________________",
    marginLeft + indent,
    (currentY += 10)
  );
  doc.text(
    "Дата окончания выполнения работ _________________________________________________",
    marginLeft + indent,
    (currentY += 5)
  );
  doc.setFont("Font", "normal");
  doc.text("От Заказчика:", marginLeft + indent, (currentY += 5));
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    body: [
      ["Заказ составил", "______________", "______________", "______________"],
      ["", "должность", "подпись", "расшифровка"],
      [
        "Заказ согласовал",
        "______________",
        "______________",
        "______________",
      ],
      ["", "должность", "подпись", "расшифровка"],
    ],
    styles: {
      font: "Font",
      fontSize: 12,
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
      cellPadding: 0.5,
      lineColor: [221, 221, 221],
      lineWidth: 0.15,
      halign: "center",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      fontStyle: "bold",
      textColor: [0, 0, 0],
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40 },
      2: { cellWidth: 50 },
      3: { cellWidth: 50 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: currentY,
    showHead: "firstPage",
    head: [
      [
        "№ п/п",
        "Номер вагона",
        "Тип вагона",
        "Место проведения работ",
        "Перечень работ",
        "Наименование оборудования",
        "Количество оборудования",
        "Оборудование для обеспечения резерва",
        "Место доставки оборудования для обеспечения резерва",
      ],
    ],
    body: generateBody(data),
    styles: {
      font: "Font",
      fontSize: 9,
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      fontStyle: "bold",
      textColor: [0, 0, 0],
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  doc.setFont("Font", "italic");
  doc.text("Со стороны Подрядчика согласовал:", marginLeft, currentY);
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    body: [
      [
        "_____________________",
        "_____________________",
        "(_____________________)",
      ],
      ["должность", "подпись", "расшифровка"],
      ["", "М.П.", ""],
    ],
    styles: {
      font: "Font",
      fontSize: 12,
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
      cellPadding: 0.5,
      lineColor: [221, 221, 221],
      lineWidth: 0.15,
      halign: "center",
    },
    headStyles: {
      fillColor: [255, 255, 255],
      fontStyle: "bold",
      textColor: [0, 0, 0],
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 60 },
      2: { cellWidth: 60 },
    },
  });
  currentY += 30;
  const text1 = "Дата «____»____________ 20___ года";
  const text2 = "«____» час. «____» мин.";

  doc.setFont("Font", "italic");

  const text1Width = doc.getTextWidth(text1);
  doc.text(text1, pageWidth - marginRight - text1Width, currentY);
  currentY += 5;
  const text2Width = doc.getTextWidth(text2);
  doc.text(text2, pageWidth - marginRight - text2Width - 24, currentY);
};
export const createPdfAppWork = async (json: IJson, outputDir: string) => {
  const doc = new jsPDF();

  createRequestForm(doc, json.wagons);
  // Получаем PDF как Uint8Array
  const pdfBytes = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfBytes);
  // Формируем путь к файлу
  const filePath = path.resolve(outputDir, "Заявка_№7.pdf");

  // Записываем файл
  await fs.writeFile(filePath, buffer);

};

  
