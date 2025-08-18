import { Router } from "express";
import { postPdfAppWork } from "../controlers/pdf/postPdfAppWork";
import { postPdfActDisEquipment } from "../controlers/pdf/postPdfActDisEquipment";
import { postPdfActWorksCompleted } from "../controlers/pdf/postPdfActWorksCompleted";
import { postPdfTechnicalActAcceptance } from "../controlers/pdf/postPdfTechnicalActAcceptance";
import { postPdfActInstEquipment } from "../controlers/pdf/postPdfActInstEquipment";

export const routerPdfGenerate = Router();


routerPdfGenerate.post("/pdfAppWork",postPdfAppWork)
routerPdfGenerate.post("/pdfActDisEquipment",postPdfActDisEquipment)
routerPdfGenerate.post("/pdfActInstEquipment",postPdfActInstEquipment)
routerPdfGenerate.post("/pdfActWorksCompleted",postPdfActWorksCompleted)
routerPdfGenerate.post("/pdfTechnicalActAcceptance",postPdfTechnicalActAcceptance)