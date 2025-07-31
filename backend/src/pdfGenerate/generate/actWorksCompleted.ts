import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoBase64 from "../utils/logoBase64";
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

interface Item {
  name: string;
  count: number;
  unit: string;
  price: number;
}

interface ActData {
  actNumber: string;
  actDate: string;
  contractNumber: string;
  contractDate: string;
  applicationNumber: string;
  items: Item[];
}

function createAct(doc: jsPDF, data: ActData) {
  // Подключение шрифтов
  doc.addFileToVFS(nameTimesNewRomanRegular, fontRegularData.toString("base64"));
  doc.addFont(nameTimesNewRomanRegular, "Font", "normal");
  doc.addFileToVFS(nameTimesNewRomanBd, fontBoldData.toString("base64"));
  doc.addFont(nameTimesNewRomanBd, "Font", "bold");
  doc.addFileToVFS(nameTimesNewRomanItalic, fontItalicData.toString("base64"));
  doc.addFont(nameTimesNewRomanItalic, "Font", "italic");
  doc.addFileToVFS(nameTimesNewRomanBdItalic, fontBoldItalicData.toString("base64"));
  doc.addFont(nameTimesNewRomanBdItalic, "Font", "italicBold");

  const marginLeft = 15;
  const marginRight = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const fontSize = 12;
  const fontSizeTable = 12;
  const blockHeight = 50; // высота блока подписей
  const logoWidth = 70;
  const logoHeight = 15;
  const marginTop = 10;

  // Логотип
  doc.addImage(logoBase64, "PNG", marginLeft, marginTop, logoWidth, logoHeight);

  // Контактная информация справа от логотипа
  const contactX = marginLeft + logoWidth + 110;
  const contactY = marginTop + 6;
  doc.setFont("Font", "normal");
  doc.setFontSize(8);
  [
    "ООО «Перемена»",
    "телефон. 8 800 700 8188",
    "e-mail: RLIN info@peremena.ru",
  ].forEach((line, i) => {
    doc.text(line, contactX, contactY + i * 5, { align: "right" });
  });

  // Заголовок
  doc.setFontSize(fontSize);
  doc.setFont("Font", "bold");
  doc.text("АКТ №7", pageWidth / 2, 30, { align: "center" });
  doc.text("выполненых работ", pageWidth / 2, 35, { align: "center" });

  doc.setFont("Font", "normal");
  doc.text("г. Воронеж", marginLeft, 40);
  const dateText = "16.07.2025";
  const dateWidth = doc.getTextWidth(dateText);
  const xDate = pageWidth - marginRight - dateWidth;
  doc.text(dateText, xDate, 40);

  const maxWidth = pageWidth - marginLeft - marginRight;
  const textHeader = `ООО «Перемена», именуемое в дальнейшем «Подрядчик», в лице Генерального директора Левкина Алексея Алексеевича, действующего на основании Устава, с одной стороны, и АО ТК «Гранд Сервис Экспресс», именуемое в дальнейшем «Заказчик», в лице Генерального директора Ганова Александра Николаевича, действующего на основании Устава, с другой стороны, совместно или раздельно именуемые в дальнейшем «Стороны» или «Сторона», составили настоящий Акт о приеме выполненных работ (далее – «Акт») к Договору № 214-СИОИТ/ГС25 от «09» июня 2025 г. (далее – «Договор») о нижеследующем:`;

  doc.setFont("Font", "normal");
  doc.setFontSize(12);
  doc.text(textHeader, marginLeft, 50, {
    maxWidth: maxWidth,
    align: "left",
  });

  const textHeaderWagons =
    "Подрядчик выполнил работы Заказчику в соответствии с Заявкой № 7 и условиями Договора № 214-СИОИТ/ГСЭ25 от «09» июня 2025 г., на вагоне(ах) 085 65012, 020 20121, 078 25136, 088 20029, 088 20052, 024 20198, 053 22730, 097 12308, 024 11569, 081 24448, 059 21465, 063 21152, 020 20444, 096 27449, 024 20412, 063 20121, 024 20149, а именно:";

  doc.text(textHeaderWagons, marginLeft, 90, {
    maxWidth: maxWidth,
    align: "left",
  });

  // Таблица
  const bodyData = data.items.map((item, i) => {
    const sum = item.count * item.price;
    return [
      (i + 1).toString(),
      item.name,
      item.unit,
      item.count.toString(),
      item.price.toFixed(2),
      sum.toFixed(2),
    ];
  });

  const totalSum = data.items.reduce(
    (acc, item) => acc + item.price * item.count,
    0
  );

  autoTable(doc, {
    startY: 107,
    head: [
      [
        { content: "№ п/п", styles: { halign: "center" } },
        { content: "Наименование работ", styles: { halign: "center" } },
        { content: "Ед. изм.", styles: { halign: "center" } },
        { content: "Кол-во", styles: { halign: "center" } },
        { content: "Цена за ед., руб.", styles: { halign: "center" } },
        { content: "Стоимость с НДС, руб.", styles: { halign: "center" } },
      ],
    ],
    body: [
      ...bodyData,
      [
        {
          content: "Итого:",
          colSpan: 5,
          styles: { halign: "left", fontStyle: "bold" },
        },
        {
          content: totalSum.toFixed(2),
          styles: { halign: "right", fontStyle: "bold" },
        },
      ],
    ],
    styles: {
      font: "Font",
      fontSize: fontSizeTable,
      textColor: [0, 0, 0],
      fillColor: [255, 255, 255],
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
      halign: "center",
      cellPadding: 1.5,
    },
    headStyles: {
      font: "Font",
      fillColor: [255, 255, 255],
      fontStyle: "bold",
      textColor: [0, 0, 0],
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 80, halign: "left" },
      2: { cellWidth: 15 },
      3: { cellWidth: 15 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    margin: { left: marginLeft, right: marginRight },
  });

  // Нумерованный список после таблицы
  const list = [
    "Заказчик выполненные работы принял, претензий по качеству и срокам их выполнения не имеет.",
    "Работы подлежат оплате согласно условиям Договора.",
    "Стоимость выполненных работ составляет 2 576 509,54 руб. (два миллиона пятьсот семьдесят шесть тысяч пятьсот девять рублей 54 копейки), в том числе НДС - 20% - 429 418,26 руб. (четыреста двадцать девять тысяч четыреста восемнадцать рублей 26 копеек).",
    "Акт составлен в 2 (Двух) подлинных экземплярах, имеющих одинаковую юридическую силу, по одному для каждой из Сторон.",
  ];

  const leftMarginList = marginLeft;
  const maxLineWidthList = pageWidth - marginLeft - marginRight;

  doc.setFont("Font", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  let currentY = (doc as any).lastAutoTable.finalY + 5;
  const bottomMargin = 20; // отступ снизу страницы
  const lineHeight = 7; // высота строки

  list.forEach((item, index) => {
    const prefix = `${index + 1}. `;

    // Разбиваем текст на строки, учитывая ширину без префикса для последующих строк
    const splittedText = doc.splitTextToSize(
      item,
      maxLineWidthList - doc.getTextWidth(prefix)
    );

    // Проверяем, хватит ли места для отрисовки этого пункта (высота = количество строк * lineHeight + небольшой отступ)
    const neededHeight = splittedText.length * lineHeight + 5;
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = 20; // отступ сверху на новой странице
    }

    // Первая строка с номером
    doc.text(prefix + splittedText[0], leftMarginList, currentY);

    // Остальные строки с отступом под номером
    for (let i = 1; i < splittedText.length; i++) {
      currentY += lineHeight;
      doc.text(splittedText[i], leftMarginList + doc.getTextWidth(prefix), currentY);
    }

    currentY += lineHeight ; // отступ между пунктами
  });

  // Блок подписей
  let startY = currentY +5;

  if (pageHeight - startY < blockHeight) {
    doc.addPage();
    startY = 20;
  }

  const heightLine = 16;
  const blockWidth = 90;

  doc.setFontSize(fontSize);
  doc.setFont("Font", "bold");
  doc.text("Подрядчик:", marginLeft, startY);

  doc.setFont("Font", "normal");
  doc.text("Генеральный директор", marginLeft, startY + 8);
  doc.text("АО ТК «Гранд Сервис Экспресс»", marginLeft, startY + 13);

  doc.line(
    marginLeft,
    startY + heightLine + lineHeight,
    marginLeft + blockWidth * 0.39,
    startY + heightLine + lineHeight
  );
  doc.text(
    "(А.Н. Ганов)",
    marginLeft + blockWidth * 0.4,
    startY + heightLine + lineHeight
  );
  doc.text("М.П.", marginLeft, startY + 2 + heightLine + lineHeight +3);

  const secondBlockX = marginLeft + blockWidth + 8;

  doc.setFont("Font", "bold");
  doc.text("Заказчик:", secondBlockX, startY);
  doc.setFont("Font", "normal");
  doc.text("Генеральный директор ООО «Перемена»", secondBlockX, startY + 8);

  doc.line(
    secondBlockX,
    startY + heightLine + lineHeight,
    secondBlockX + blockWidth * 0.39,
    startY + heightLine + lineHeight
  );

  doc.text(
    "(А.А. Левыкин)",
    secondBlockX + blockWidth * 0.4,
    startY + heightLine + lineHeight
  );

  doc.text("М.П.", secondBlockX, startY + 2 + heightLine + lineHeight + 3);
}

export const createActWorksCompleted = async (json:ActData , outputDir: string) => {
  const doc = new jsPDF();

  createAct(doc, json);
  // Получаем PDF как Uint8Array
  const pdfBytes = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfBytes);
  // Формируем путь к файлу
  const filePath = path.resolve(outputDir, "actWorksCompleted.pdf");

  // Записываем файл
  await fs.writeFile(filePath, buffer);

};
