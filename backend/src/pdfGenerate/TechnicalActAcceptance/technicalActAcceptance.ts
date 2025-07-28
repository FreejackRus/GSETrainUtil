import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

interface WagonData {
  number: string;
  type: string;
}

interface EquipmentItem {
  name: string;
  serial: string;
  note?: string;
}

function createAct(
  doc: jsPDF,
  actNumber: string,
  date: string,
  contractNumber: string,
  contractDate: string,
  wagonData: WagonData,
  equipmentData: EquipmentItem[],
  isLast: boolean = false
): void {
  // Добавляем шрифты (если нужно, можно вынести из функции)
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

  doc.setFontSize(12);
  doc.setFont("Font", "bold");
  doc.text("Технический Акт (приемки)", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("Font", "normal");
  doc.text(`№ ${actNumber} от ${date}`, 105, 30, { align: "center" });

  doc.text(
    `в соответствии с Договором № ${contractNumber} от ${contractDate}`,
    105,
    35,
    { align: "center" }
  );

  doc.text("Оборудование смонтировано на линейном вагоне:", 20, 45);

  const marginLeft = 20;
  const marginRight = 10;

  autoTable(doc, {
    startY: 48,
    head: [
      ["№ п/п", { content: "Данные по составу", colSpan: 2 }, "Примечание"],
    ],
    body: [
      ["1", "Номер линейного вагона", wagonData.number],
      ["2", "Тип линейного вагона", wagonData.type],
    ],
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      font: "Font",
      lineWidth: 0.1,
      lineColor: 0,
    },
    styles: {
      fontSize: 10,
      font: "Font",
      lineWidth: 0.1,
      lineColor: 0,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 80 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30 },
    },
    margin: { left: marginLeft, right: marginRight },
    tableLineColor: 0,
    tableLineWidth: 0.1,
  });

  doc.text(
    "Данные по смонтированному оборудованию:",
    20,
    (doc as any).lastAutoTable.finalY + 5
  );

  const equipmentBody = equipmentData.map((item, index) => [
    (index + 1).toString(),
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
      lineWidth: 0.1,
      lineColor: 0,
    },
    styles: {
      fontSize: 10,
      font: "Font",
      lineWidth: 0.1,
      lineColor: 0,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 80 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30 },
    },
    margin: { left: marginLeft, right: marginRight },
    tableLineColor: 0,
    tableLineWidth: 0.1,
  });

  const startX = 20;
  const startY = (doc as any).lastAutoTable.finalY + 10;
  const blockWidth = 90;
  const lineHeight = 7;
  const heightLine = 16;

  // Подрядчик
  doc.setFontSize(12);
  doc.setFont("Font", "bold");
  doc.text("Подрядчик:", startX, startY);

  doc.line(startX, startY + 8, startX + blockWidth * 0.37, startY + 8);
  doc.line(startX + blockWidth * 0.4, startY + 8, startX + blockWidth * 0.9, startY + 8);

  doc.setFont("Font", "italic");
  doc.text("(должность) (наименование организации)", startX, startY + 5 + lineHeight);

  doc.line(startX, startY + heightLine + lineHeight, startX + blockWidth * 0.39, startY + heightLine + lineHeight);
  doc.text("(", startX + blockWidth * 0.39, startY + heightLine + lineHeight);
  doc.line(startX + blockWidth * 0.4, startY + heightLine + lineHeight, startX + blockWidth * 0.9, startY + heightLine + lineHeight);
  doc.text(")", startX + blockWidth * 0.9, startY + heightLine + lineHeight);

  doc.setFont("Font", "normal");
  doc.text("(подпись)", startX, startY + 2 + lineHeight + 5 + 7 + lineHeight);
  doc.text("(Ф.И.О.)", startX + blockWidth * 0.5, startY + 2 + lineHeight + 5 + 7 + lineHeight);

  // Заказчик
  const secondBlockX = startX + blockWidth + 8;

  doc.setFont("Font", "bold");
  doc.text("Заказчик:", secondBlockX, startY);

  doc.line(secondBlockX, startY + 8, secondBlockX + blockWidth * 0.37, startY + 8);
  doc.line(secondBlockX + blockWidth * 0.4, startY + 8, secondBlockX + blockWidth * 0.9, startY + 8);

  doc.setFont("Font", "italic");
  doc.text("(должность) (наименование организации)", secondBlockX, startY + 5 + lineHeight);

  doc.line(secondBlockX, startY + heightLine + lineHeight, secondBlockX + blockWidth * 0.39, startY + heightLine + lineHeight);
  doc.text("(", secondBlockX + blockWidth * 0.39, startY + heightLine + lineHeight);
  doc.line(secondBlockX + blockWidth * 0.4, startY + heightLine + lineHeight, secondBlockX + blockWidth * 0.9, startY + heightLine + lineHeight);
  doc.text(")", secondBlockX + blockWidth * 0.9, startY + heightLine + lineHeight);

  doc.setFont("Font", "normal");
  doc.text("(подпись)", secondBlockX, startY + 2 + lineHeight + 5 + 7 + lineHeight);
  doc.text("(Ф.И.О.)", secondBlockX + blockWidth * 0.5, startY + 2 + lineHeight + 5 + 7 + lineHeight);

  if (!isLast) {
    doc.addPage();
  }
}

function generateTechnicalActs(): void {
  const doc = new jsPDF();

  const actsData = [
    {
      actNumber: "7.1",
      date: "«16» июля 2025 г.",
      contractNumber: "214-СИОИТ/ГСЭ25",
      contractDate: "«09» июня 2025 г.",
      wagonData: {
        number: "085 65012",
        type: "Одноэтажный (ресторан)",
      },
      equipmentData: [
        { name: "Маршрутизатор Mikrotik Hex RB750Gr3", serial: "HGW0AA2QSCX" },
        { name: "Коммутатор, черт. ТСФВ.467000.008", serial: "DT005581" },
        { name: "Источник питания (24V, 150W)", serial: "SC554F4469" },
        {
          name: "Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)",
          serial: "-",
          note: "2 шт.",
        },
        {
          name: "Выключатель автоматический двухполюсный MD63 2P 16А C 6kA",
          serial: "-",
        },
        { name: "Точка доступа ТСФВ.465000.006-005", serial: "HGY0AD1VA0C" },
        { name: "Точка доступа ТСФВ.465000.006-005", serial: "HGN09PS3ZSQ" },
      ],
    },
    {
      actNumber: "7.2",
      date: "«17» июля 2025 г.",
      contractNumber: "214-СИОИТ/ГСЭ25",
      contractDate: "«09» июня 2025 г.",
      wagonData: {
        number: "085 65013",
        type: "Двухэтажный",
      },
      equipmentData: [
        { name: "Коммутатор Cisco", serial: "CS123456" },
        { name: "Источник питания", serial: "PS987654", note: "Резервный" },
      ],
    },
  ];

  actsData.forEach((act, index) => {
    createAct(
      doc,
      act.actNumber,
      act.date,
      act.contractNumber,
      act.contractDate,
      act.wagonData,
      act.equipmentData,
      index === actsData.length - 1
    );
  });

  doc.save("technicalActAcceptance.pdf");
  console.log("PDF с техническими актами успешно создан!");
}

generateTechnicalActs();
