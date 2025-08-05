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
import logoBase64 from "../utils/logoBase64";
import path from "path";
import { formatRussianDate } from "../utils/stringConvertDate";
import { equipmentDetails, ResponseJson } from "../../types/types";

interface DismantlingActData {
  actNumber: string; // например "9.1"
  actDate: string; // например "«__» июля 2025 г."
  contractNumber: string; // например "214-СИОИТ/ГСЭ25"
  contractDate: string; // например "«09» июня 2025 г."
  applicationNumber: string; // например "9"
  equipment: equipmentDetails[];
}

function createDismantlingAct(doc: jsPDF, data: DismantlingActData): number {
  // Подключаем шрифты (если вызывается много раз, лучше вынести из функции)
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

  const marginTop = 10;
  const marginLeft = 15;
  const marginRight = 15;
  const fontSize = 12;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Логотип
  const logoWidth = 70;
  const logoHeight = 15;

  const startX = 15;
  const heightLine = 16;
  const lineHeight = 7;

  doc.addImage(logoBase64, "PNG", marginLeft, marginTop, logoWidth, logoHeight);

  // Контактная информация справа от лого
  const contactX = marginLeft + logoWidth + 110;
  const contactY = marginTop + 6;

  doc.setFont("Font", "normal");
  doc.setFontSize(8);
  const contactLines = [
    "ООО «Перемена»",
    "телефон. 8 800 700 8188",
    "e-mail: RLIN info@peremena.ru",
  ];
  contactLines.forEach((line, i) => {
    doc.text(line, contactX, contactY + i * 5, { align: "right" });
  });

  // Заголовок
  doc.setFontSize(fontSize);
  doc.setFont("Font", "bold");
  doc.text("АКТ демонтажа оборудования", pageWidth / 2, 30, {
    align: "center",
  });

  doc.setFont("Font", "normal");
  doc.text(`№ ${data.actNumber} от ${data.actDate}`, pageWidth / 2, 35, {
    align: "center",
  });
  doc.text(
    `в соответствии с Договором № ${data.contractNumber} от ${data.contractDate}`,
    pageWidth / 2,
    40,
    { align: "center" }
  );

  doc.text(
    `1. Подрядчик выполнил демонтаж оборудования Заказчику в соответствии с Заявкой № ${data.applicationNumber} и условиями Договора № ${data.contractNumber} от ${data.contractDate}, а именно:`,
    marginLeft,
    50,
    { maxWidth: pageWidth - marginLeft - marginRight }
  );

  // Формируем тело таблицы с автоматической нумерацией
  const bodyData = data.equipment.map((item, index) => [
    (index + 1).toString(),
    item.carriageNumber ?? "-",
    item.type ?? "-",
    item.serialNumber ?? "-",
    item.quantity ?? "-",
  ]);

  autoTable(doc, {
    startY: 60,
    head: [
      [
        { content: "№ п/п", styles: { halign: "center" } },
        { content: "Номер вагона", styles: { halign: "center" } },
        { content: "Наименование оборудования", styles: { halign: "center" } },
        {
          content: "Серийный номер оборудования",
          styles: { halign: "center" },
        },
        { content: "Кол-во, шт.", styles: { halign: "center" } },
      ],
    ],
    body: bodyData,
    styles: {
      font: "Font",
      fontSize: 9,
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
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
      2: { cellWidth: 85 },
      3: { cellWidth: 50 },
      4: { cellWidth: 15, halign: "center" },
    },
    margin: { left: marginLeft, right: marginRight },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 5;
  doc.text(
    `2. С момента подписания настоящего акта, ответственность за сохранность и безопасность оборудования возлагается на Заказчика.`,
    marginLeft,
    finalY,
    { maxWidth: pageWidth - marginLeft - marginRight }
  );

  // Подписи подрядчика и заказчика
  const blockHeight = 50;
  let startY = (doc as any).lastAutoTable.finalY + 15;

  if (doc.internal.pageSize.getHeight() - startY < blockHeight) {
    doc.addPage();
    startY = 20; // отступ сверху на новой странице
  }

  const blockWidth = 90;

  doc.setFontSize(fontSize);
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

  return startY + heightLine + lineHeight + 20; // пример возвращаемой позиции по вертикали
}

export const createPdfActDisEquipment = async (
  json: ResponseJson,
  outputDir: string
) => {
  const doc = new jsPDF();
  const applicationNumber = json.applicationNumber;
  const carriageNumber = json.carriageNumber;
  const applicationDate = json.applicationDate || "«___»______.____г.";
  const contractNumber = json.contractNumber || "____________________";
  const equipmentDetails = json.equipmentDetails;
  const actDate = "«___»______.____г.";

  const infoEquipmentAndCarriageNumber =
    equipmentDetails?.map((item) => ({
      ...item,
      carriageNumber: carriageNumber,
    })) ?? [];

  const resultJson: DismantlingActData = {
    actNumber: String(applicationNumber),
    actDate: actDate,
    contractNumber: contractNumber,
    contractDate: formatRussianDate(applicationDate),
    applicationNumber: String(applicationNumber),
    equipment: infoEquipmentAndCarriageNumber,
  };

  // createDismantlingAct(doc, resultJson);
  createDismantlingAct(doc, resultJson);

  // Получаем PDF как Uint8Array
  const pdfBytes = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfBytes);
  // Формируем путь к файлу

  const filePath = path.resolve(
    outputDir,
    `Акт демонтажа№${applicationNumber}.pdf`
  );

  // Записываем файл
  await fs.writeFile(filePath, buffer);
};
