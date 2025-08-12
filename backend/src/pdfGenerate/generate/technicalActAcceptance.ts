import * as jspdf from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs/promises";

// Импорты шрифтов (здесь подставьте свои данные шрифтов)
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
import { equipmentDetails, ResponseJson } from "../../types/types";
import { formatRussianDate } from "../utils/stringConvertDate";

interface WagonData {
  number: string;
  type: string;
}
interface arrEquipment  {
   carriageNumber: string,
    carriageType: string,
    equipment: equipmentDetails[]
}
interface Act {
  actNumber: string;
  date: string;
  contractNumber: string;
  contractDate: string;
  equipmentData: arrEquipment[];
}

function safeName(s: string) {
  return String(s).replace(/[\\/:*?"<>|]+/g, "").trim();
}

function createAct(doc: jspdf.jsPDF, act: Act): void {
  // Добавляем шрифты один раз
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

  act.equipmentData.forEach((item,index) => {
    doc.setFontSize(12);
    doc.setFont("Font", "bold");
    doc.text("Технический Акт (приемки)", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("Font", "normal");
    doc.text(`№ ${act.actNumber} от ${act.date}`, 105, 30, { align: "center" });

    doc.text(
      `в соответствии с Договором № ${act.contractNumber} от ${act.contractDate}`,
      105,
      35,
      { align: "center" }
    );

    doc.text("Оборудование смонтировано на линейном вагоне:", 20, 45);

    autoTable(doc, {
      startY: 48,
      head: [
        ["№ п/п", { content: "Данные по составу", colSpan: 2 }, "Примечание"],
      ],
      body: [
        ["1", "Номер линейного вагона", item.carriageNumber || "-"],
        ["2", "Тип линейного вагона", item.carriageType || "-"],
      ],
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        font: "Font",
        fontStyle: "normal",
        lineWidth: 0.1,
        lineColor: 0,
      },
      styles: {
        fontSize: 12,
        font: "Font",
        textColor: [0, 0, 0],
        fontStyle: "normal",
        lineWidth: 0.1,
        lineColor: 0,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 },
      },
      margin: { left: 20, right: 10 },
      tableLineColor: 0,
      tableLineWidth: 0.1,
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
    });

    doc.text(
      "Данные по смонтированному оборудованию:",
      20,
      (doc as any).lastAutoTable.finalY + 5
    );

    const equipmentBody = item.equipment.map((item, idx) => [
      (idx + 1).toString(),
      item.name || "-",
      item.serialNumber ||"-",
      "",
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["№ п/п", "Оборудование", "Серийный номер", "Примечание"]],
      body: equipmentBody,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        font: "Font",
        fontStyle: "normal",
        lineWidth: 0.1,
        lineColor: 0,
      },
      styles: {
        fontSize: 12,
        textColor: [0, 0, 0],
        font: "Font",
        fontStyle: "normal",
        lineWidth: 0.1,
        lineColor: 0,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 },
      },
      margin: { left: 20, right: 10 },
      tableLineColor: 0,
      tableLineWidth: 0.1,
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
    });

    const startX = 20;
    const blockHeight = 50;
    let startY = (doc as any).lastAutoTable.finalY + 10;

    if (doc.internal.pageSize.getHeight() - startY < blockHeight) {
      doc.addPage();
      startY = 20; // отступ сверху на новой странице
    }
    const blockWidth = 90;
    const lineHeight = 7;
    const heightLine = 16;

    // Подрядчик
    doc.setFontSize(12);
    doc.setFont("Font", "bold");
    doc.text("Подрядчик:", startX, startY);
    doc.line(startX, startY + 8, startX + blockWidth * 0.37, startY + 8);
    doc.line(
      startX + blockWidth * 0.4,
      startY + 8,
      startX + blockWidth * 0.9,
      startY + 8
    );
    doc.setFont("Font", "italic");
    doc.text(
      "(должность) (наименование организации)",
      startX,
      startY + 5 + lineHeight
    );
    doc.line(
      startX,
      startY + heightLine + lineHeight,
      startX + blockWidth * 0.39,
      startY + heightLine + lineHeight
    );
    doc.text("(", startX + blockWidth * 0.39, startY + heightLine + lineHeight);
    doc.line(
      startX + blockWidth * 0.4,
      startY + heightLine + lineHeight,
      startX + blockWidth * 0.9,
      startY + heightLine + lineHeight
    );
    doc.text(")", startX + blockWidth * 0.9, startY + heightLine + lineHeight);
    doc.setFont("Font", "normal");
    doc.text("(подпись)", startX, startY + 2 + lineHeight + 5 + 7 + lineHeight);
    doc.text(
      "(Ф.И.О.)",
      startX + blockWidth * 0.5,
      startY + 2 + lineHeight + 5 + 7 + lineHeight
    );

    // Заказчик
    const secondBlockX = startX + blockWidth + 8;

    doc.setFont("Font", "bold");
    doc.text("Заказчик:", secondBlockX, startY);
    doc.line(
      secondBlockX,
      startY + 8,
      secondBlockX + blockWidth * 0.37,
      startY + 8
    );
    doc.line(
      secondBlockX + blockWidth * 0.4,
      startY + 8,
      secondBlockX + blockWidth * 0.9,
      startY + 8
    );
    doc.setFont("Font", "italic");
    doc.text(
      "(должность) (наименование организации)",
      secondBlockX,
      startY + 5 + lineHeight
    );
    doc.line(
      secondBlockX,
      startY + heightLine + lineHeight,
      secondBlockX + blockWidth * 0.39,
      startY + heightLine + lineHeight
    );
    doc.text(
      "(",
      secondBlockX + blockWidth * 0.39,
      startY + heightLine + lineHeight
    );
    doc.line(
      secondBlockX + blockWidth * 0.4,
      startY + heightLine + lineHeight,
      secondBlockX + blockWidth * 0.9,
      startY + heightLine + lineHeight
    );
    doc.text(
      ")",
      secondBlockX + blockWidth * 0.9,
      startY + heightLine + lineHeight
    );
    doc.setFont("Font", "normal");
    doc.text(
      "(подпись)",
      secondBlockX,
      startY + 2 + lineHeight + 5 + 7 + lineHeight
    );
    doc.text(
      "(Ф.И.О.)",
      secondBlockX + blockWidth * 0.5,
      startY + 2 + lineHeight + 5 + 7 + lineHeight
    );
      if (index !== act.equipmentData.length - 1) {
    doc.addPage();
  }
  });
}
export const createTechnicalActAcceptance = async (
  json: ResponseJson,
  outputDir: string
) => {
  const applicationNumber = json.applicationNumber;
  const applicationDate = json.applicationDate;
  const contractNumber = json.contractNumber;
  const contractDate = json.contractDate;
  const equipmentDetails = json.equipmentDetails;
  const carriageNumbers = json.carriageNumbers;
  const trainNumber = json.trainNumber;
// Создаем Map для быстрого поиска типа вагона по номеру
const carriageTypeMap = new Map(
  carriageNumbers.map((carriage) => [carriage.number, carriage.type])
);

// Группируем оборудование по вагону и добавляем тип вагона из carriageTypeMap
const arrEquipment = Object.values(
  (equipmentDetails ?? []).reduce((acc, item) => {
    if (!item.carriageNumber) return acc;
    const number = item.carriageNumber;
    if (!acc[number]) {
      acc[number] = {
        carriageNumber: number,
        carriageType: carriageTypeMap.get(number) || "Неизвестный тип",
        equipment: [], // <-- массив, не undefined
      };
    }
    acc[number].equipment.push(item);
    return acc;
  }, {} as Record<
    string,
    {
      carriageNumber: string;
      carriageType: string;
      equipment: equipmentDetails[]; // Обязательно массив, не undefined
    }
  >)
);

console.log(equipmentDetails);
console.log(carriageNumbers);

  const resultJson: Act = {
    actNumber: String(applicationNumber),
    contractNumber: contractNumber,
    contractDate: contractDate ?? "«__».____.____ г.",
    date: formatRussianDate(applicationDate),
    equipmentData: arrEquipment ?? [],
  };
  const doc = new jspdf.jsPDF();
  // console.log(resultJson);

  createAct(doc, resultJson);
  // Получаем PDF как Uint8Array
  const pdfBytes = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfBytes);
  // гарантируем каталог
  await fs.mkdir(outputDir, { recursive: true });

  // имя файла: "<поезд> от <дата>.pdf"
  const prettyDate = formatRussianDate(applicationDate);
  const fileName = `${safeName(trainNumber)} от ${safeName(prettyDate)}.pdf`;
  const filePath = path.resolve(outputDir, fileName);

  await fs.writeFile(filePath, buffer);
  return filePath;
};
