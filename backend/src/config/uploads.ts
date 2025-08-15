import path from "path";
import fs from "fs";

export function resolveUploadsDir(): string {
    const dir = process.env.UPLOADS_DIR || "var/uploads";
    const abs = path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
    try { fs.mkdirSync(abs, { recursive: true }); } catch {}
    return abs;
}

export const UPLOADS_DIR = resolveUploadsDir();

export function safeJoinUpload(...parts: string[]): string {
    const joined = path.resolve(UPLOADS_DIR, ...parts);
    if (!joined.startsWith(UPLOADS_DIR)) {
        throw new Error("Path traversal detected");
    }
    return joined;
}

export function toAbsUploadPath(relOrAbs: string): string {
    if (!relOrAbs) return "";
    if (path.isAbsolute(relOrAbs)) return relOrAbs;
    const rel = relOrAbs.replace(/^[/\\]+/, "").replace(/\\/g, "/");
    return safeJoinUpload(rel);
}

export function toRelUploadPath(absPath: string): string {
    const abs = path.resolve(absPath);
    const rel = path.relative(UPLOADS_DIR, abs);
    return rel.split(path.sep).join("/");
}

const PRECREATE_DIRS = [
    "carriage/carriage",
    "carriage/equipment",
    "equipment/equipment",
    "equipment/serial",
    "equipment/mac",
];

for (const d of PRECREATE_DIRS) {
    try { fs.mkdirSync(safeJoinUpload(d), { recursive: true }); } catch {}
}
