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
import path from "path";
import { ResponseJson } from "../../types/types";

interface Work {
  equipment: string;
  equipmentCount: number;
}

interface Wagon {
  wagonNumber: string;
  wagonType: string;
  workPlace: string;
  works: string[];
  arrEquipment: Work[];
}

interface TWagonPdf {
  wagons: Wagon[];
}

const generateBody = (data: { wagons: Wagon[] }): string[][] => {
  const body: string[][] = [];
  const commonWorks = [
    "Выезд специалиста в депо",
    "Дополнительные работы по демонтажу оборудования",
    "Дополнительные работы по монтажу оборудования",
  ];
  commonWorks.forEach((work, i) => {
    body.push(["", "", "", "", work, "", "", "", ""]);
  });
  data.wagons.forEach((wagon, index) => {
    // 1. Общие работы

    // 2. Монтаж работ
    wagon.arrEquipment.forEach((eq, i) => {
      body.push([
        i === 0 ? (index + 1).toString() : "", // № п/п
        i === 0 ? wagon.wagonNumber : "", // Номер вагона
        i === 0 ? wagon.wagonType : "", // Тип вагона
        i === 0 ? wagon.workPlace : "", // Место проведения работ
        `Монтаж ${eq.equipment}`,
        "",
        "",
        "",
        "",
      ]);
    });

    // 3. Проверка кабельных трасс
    body.push(["", "", "", "", "Проверка кабельных трасс", "", "", "", ""]);

    // 4. Перечень оборудования
    wagon.arrEquipment.forEach((eq) => {
      body.push([
        "",
        "",
        "",
        "",
        "", // Первые 5 колонок пустые
        eq.equipment, // Наименование оборудования
        eq.equipmentCount.toString(), // Кол-во
        "",
        "", // Остальные тоже пустые
      ]);
    });
  });

  return body;
};

export const createRequestForm = (doc: jsPDF, data: { wagons: Wagon[] }) => {
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
  const marginRight = 15;
  const fontSize = 12;
  let currentY = 20;

  doc.setFontSize(16).setFont("Font", "bold");
  doc.text("Заявка № 7", pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  const leftText = "г. Москва";
  const rightText = "Дата: ____.__.____";
  doc.setFontSize(fontSize).setFont("Font", "normal");
  doc.text(leftText, marginLeft, currentY);
  doc.text(
    rightText,
    pageWidth - marginRight - doc.getTextWidth(rightText),
    currentY
  );

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
      lineWidth: 0.1,
      halign: "center",
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
       alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 60 },
      2: { cellWidth: 60 },
    },
  });

  currentY += 30;
  doc.text(
    "Дата «____»____________ 20___ года",
    pageWidth - marginRight - 72,
    currentY
  );
  currentY += 5;
  doc.text("«____» час. «____» мин.", pageWidth - marginRight - 45, currentY);
};

export const createPdfAppWork = async (
  json: ResponseJson,
  outputDir: string
) => {
  const doc = new jsPDF();

  const carriageNumber = json.carriageNumber;
  const carriageType = json.carriageType;
  const equipmentTypes = json.equipmentTypes;
  const countEquipments = json.countEquipments;
  const currentLocation = json.currentLocation;
  const applicationNumber = json.applicationNumber;

  let arrEquipment: { equipment: string; equipmentCount: number }[] = [];
  equipmentTypes.map((item, index) => {
    arrEquipment.push({
      equipment: item,
      equipmentCount: countEquipments[index],
    });
  });

  const resultJson = {
    wagons: [
      {
        wagonNumber: carriageNumber,
        wagonType: carriageType,
        workPlace: currentLocation ?? "",
        works: [
          "Выезд специалиста в депо",
          "Дополнительные работы по демонтажу оборудования",
          "Дополнительные Работы по монтажу оборудования",
          "Проверка кабельных трасс",
        ],
        arrEquipment,
      }
    ],
  };

  createRequestForm(doc, { wagons: resultJson.wagons });
  // Получаем PDF как Uint8Array
  const pdfBytes = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfBytes);
  // Формируем путь к файлу
  const filePath = path.resolve(outputDir, `Заявка_№${applicationNumber}.pdf`);

  // Записываем файл
  await fs.writeFile(filePath, buffer);
};
