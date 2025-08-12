import path from "path";

export function resolvePdfDir(): string {
    const dir = process.env.PDF_DIR || "var/pdf";
    return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
}

export function makePdfFilename(applicationNumber: string | number) {
    const num = String(applicationNumber ?? "").trim();
    // Фолбэк, если номер пустой
    return `Заявка_№${num || "unknown"}.pdf`;
}