import path from "path";

export function resolveWordDir(): string {
    const dir = process.env.WORD_DIR || "var/word";
    console.log(dir);
    
    return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
}

export function makeWordFilename(applicationNumber: string | number) {
    const num = String(applicationNumber ?? "").trim();
    // Фолбэк, если номер пустой
    return `Заявка_№${num || "unknown"}.docx`;
}