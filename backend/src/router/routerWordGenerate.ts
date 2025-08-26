import { Router } from "express";
import { postWordTechnicalActAcceptance } from "../controlers/word/postWordTechnicalActAcceptance";
import { postWordActInstEquipment } from "../controlers/word/postWordActInstEquipment";
import { postWordActDisEquipment } from "../controlers/word/postWordActDisEquipment";
import { postWordAppWork } from "../controlers/word/postWordAppWork";

export const routerWordGenerate = Router();


routerWordGenerate.post("/wordAppWork",postWordAppWork)
routerWordGenerate.post("/wordActDisEquipment",postWordActDisEquipment)
routerWordGenerate.post("/wordActInstEquipment",postWordActInstEquipment)
// routerWordGenerate.post("/pdfActWorksCompleted",postPdfActWorksCompleted)
routerWordGenerate.post("/wordTechnicalActAcceptance",postWordTechnicalActAcceptance)