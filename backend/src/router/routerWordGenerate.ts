import { Router } from "express";
import { postPdfAppWork } from "../controlers/pdf/postPdfAppWork";
import { postPdfActDisEquipment } from "../controlers/pdf/postPdfActDisEquipment";
import { postPdfActWorksCompleted } from "../controlers/pdf/postPdfActWorksCompleted";
import { postPdfActInstEquipment } from "../controlers/pdf/postPdfActInstEquipment";
import { postWordTechnicalActAcceptance } from "../controlers/word/postWordTechnicalActAcceptance";
import { postWordActInstEquipment } from "../controlers/word/postWordActInstEquipment";

export const routerWordGenerate = Router();


// routerWordGenerate.post("/pdfAppWork",postPdfAppWork)
// routerWordGenerate.post("/pdfActDisEquipment",postPdfActDisEquipment)
routerWordGenerate.post("/wordActInstEquipment",postWordActInstEquipment)
// routerWordGenerate.post("/pdfActWorksCompleted",postPdfActWorksCompleted)
routerWordGenerate.post("/wordTechnicalActAcceptance",postWordTechnicalActAcceptance)