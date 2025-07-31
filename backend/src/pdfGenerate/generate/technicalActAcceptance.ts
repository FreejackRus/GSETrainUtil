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
import { IJsonTechAct } from "../utils/testJson/testJsonTechnicalActAcceptance";
import path from "path";

interface WagonData {
  number: string;
  type: string;
}

interface EquipmentItem {
  name: string;
  serial: string;
  note?: string;
}

interface Act {
  actNumber: string;
  date: string;
  contractNumber: string;
  contractDate: string;
  wagonData: WagonData;
  equipmentData: EquipmentItem[];
}


function createAct(doc: jspdf.jsPDF, acts: Act[]): void {
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

  acts.forEach((act, index) => {
    if (index > 0) {
      doc.addPage();
    }

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
        ["1", "Номер линейного вагона", act.wagonData.number],
        ["2", "Тип линейного вагона", act.wagonData.type],
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

    const equipmentBody = act.equipmentData.map((item, idx) => [
      (idx + 1).toString(),
      item.name,
      item.serial,
      item.note || "",
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
    // Здесь можно добавить подписи и прочее по вашему шаблону
  });
}
export const createTechnicalActAcceptance = async (
  json: IJsonTechAct,
  outputDir: string
) => {
  const doc = new jspdf.jsPDF();

  createAct(doc, json.acts);
  // Получаем PDF как Uint8Array
  const pdfBytes = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfBytes);
  // Формируем путь к файлу
  const filePath = path.resolve(outputDir, "technicalActAcceptance.pdf");

  // Записываем файл
  await fs.writeFile(filePath, buffer);
};
