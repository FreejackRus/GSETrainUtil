import fs from "fs";
import path from "path";

const correctUrl = __dirname.split("/").slice(0, -1).join("/");

export const nameTimesNewRomanRegular = "TimesNewRomanRegular.ttf";
export const nameTimesNewRomanItalic = "TimesNewRomanItalic.ttf";
export const nameTimesNewRomanBdItalic = "TimesNewRomanBoldItalic.ttf";
export const nameTimesNewRomanBd = "TimesNewRomanBold.ttf";

const fontRegularPath = path.join(
  correctUrl,
  "fonts",
  nameTimesNewRomanRegular
);
const fontItalicPath = path.join(correctUrl, "fonts", nameTimesNewRomanItalic);

const fontBoldItalicPath = path.join(
  correctUrl,
  "fonts",
  nameTimesNewRomanBdItalic
);
const fontBoldPath = path.join(correctUrl, "fonts", nameTimesNewRomanBd);

export const fontRegularData = fs.readFileSync(fontRegularPath);
export const fontItalicData = fs.readFileSync(fontItalicPath);
export const fontBoldItalicData = fs.readFileSync(fontBoldItalicPath);
export const fontBoldData = fs.readFileSync(fontBoldPath);
