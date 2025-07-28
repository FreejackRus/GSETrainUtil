import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";
import {
  fontBoldData,
  fontBoldItalicData,
  fontItalicData,
  fontRegularData,
  nameTimesNewRomanBd,
  nameTimesNewRomanBdItalic,
  nameTimesNewRomanItalic,
  nameTimesNewRomanRegular,
} from "./utils/config";

const doc = new jsPDF();

doc.addFileToVFS(nameTimesNewRomanRegular, fontRegularData.toString("base64"));
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

doc.setFont("Font", "normal");
doc.setFontSize(12);
doc.text(
  "Пример текста на русском языке с использованием шрифта Times New Roman.",
  15,
  20
);

doc.setFont("Font", "bold");
doc.setFontSize(12);
doc.text(
  "Пример текста на русском языке с использованием шрифта Times New Roman.",
  15,
  40
);

doc.setFont("Font", "italic");
doc.setFontSize(12);
doc.text(
  "Пример текста на русском языке с использованием шрифта Times New Roman.",
  15,
  60
);

doc.setFont("Font", "italicBold");
doc.setFontSize(12);
doc.text(
  "Пример текста на русском языке с использованием шрифта Times New Roman.",
  15,
  80
);

doc.save("russian_times_new_roman.pdf");

console.log("PDF успешно создан!");
