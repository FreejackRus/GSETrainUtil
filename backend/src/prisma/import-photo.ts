/* eslint-disable no-console */
// Импорт фото из таблицы c одной колонкой "Фото" (относительные пути).
// Поддерживает пути вида:
//   carriage/carriage/<file>        → RequestCarriagePhoto(carriage)
//   carriage/equipment/<file>       → RequestCarriagePhoto(equipment)
//   equipment/equipment/<file>      → RequestEquipmentPhoto(equipment)
//   equipment/serial/<file>         → RequestEquipmentPhoto(serial)
//   equipment/mac/<file>            → RequestEquipmentPhoto(mac)
//
// Минимально необходимые поля по строке:
//  - Для фото вагона:   Заявка + Номер вагона + Фото
//  - Для фото оборудования: Заявка + (S/N оборудования ИЛИ MAC адрес) + Фото
//
// Пример запуска:
// ts-node src/prisma/import-photo.ts --xlsx ./photos.xlsx --src ./GSE --sheet "Лист1" --dry-run

import * as path from "path";
import * as fs from "fs/promises";
import fsSync from "fs";
import * as ExcelJS from "exceljs";
import { PrismaClient, CarriagePhotoType, EquipmentPhotoType } from "@prisma/client";
import { safeJoinUpload, toRelUploadPath } from "../config/uploads"; // путь подкорректируй при необходимости
import { v4 as uuidv4 } from "uuid";

type Argv = {
    xlsx: string;
    src: string;
    sheet?: string;
    dryRun: boolean;
};

const prisma = new PrismaClient();

const ALLOWED_EQUIP_KEYS = new Set<EquipmentPhotoType>(["equipment", "serial", "mac"]);

// ---------- CLI args ----------
function parseArgs(): Argv {
    const a = process.argv.slice(2);
    const get = (k: string) => {
        const i = a.findIndex((x) => x === `--${k}`);
        return i >= 0 ? a[i + 1] : undefined;
    };
    const xlsx = get("xlsx") || "./photos.xlsx";
    const src  = get("src")  || "./GSE";
    const sheet = get("sheet");
    const dryRun = a.includes("--dry-run");
    return { xlsx, src, sheet, dryRun };
}

// ---------- хелперы ----------
function norm(s: string): string {
    return s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}
function cellToString(cell: ExcelJS.Cell | undefined | null): string | null {
    if (!cell) return null;
    const t = (cell as any).text;
    if (typeof t === "string" && t.trim()) return norm(t);

    const v: any = cell.value;
    if (v == null) return null;
    if (typeof v === "string") return norm(v);
    if (typeof v === "number") return String(v);
    if (v instanceof Date) return v.toISOString();

    if (v && Array.isArray(v.richText))
        return norm(v.richText.map((rt: any) => rt?.text ?? "").join(""));
    if (v && typeof v === "object" && "formula" in v) {
        const res = (v as any).result;
        if (res != null) return norm(String(res));
        const t2 = (v as any).text;
        if (t2) return norm(String(t2));
    }
    if (v && typeof v === "object" && "text" in v && "hyperlink" in v) {
        return norm((v as any).text || (v as any).hyperlink || "");
    }
    try {
        const js = JSON.stringify(v);
        const m = js.match(/"text"\s*:\s*"([^"]+)"/);
        if (m) return norm(m[1]);
    } catch {}
    const s = String(v).trim();
    return s ? norm(s) : null;
}
function normalizeMac(s: string | null): string | null {
    if (!s) return null;
    const t = s.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
    return t.length ? t : null;
}
function toPOSIX(p: string): string {
    return p.replace(/\\/g, "/").replace(/^\/+/, "");
}

async function ensureDir(p: string) {
    try { await fs.mkdir(p, { recursive: true }); } catch {}
}

async function generateUniqueFilename(absDir: string, ext: string): Promise<{rel: string, full: string}> {
    while (true) {
        const name = uuidv4() + ext;
        const full = path.join(absDir, name);
        const rel  = toRelUploadPath(full);
        try {
            await fs.access(full); // уже есть — повторить
            continue;
        } catch {}
        return { rel, full };
    }
}

// ---------- сопоставление колонок ----------
type ColMap = {
    requestNo?: number;
    trainNumber?: number;      // не обязателен
    carriageNumber?: number;
    equipmentName?: number;    // на случай fallback
    serialNumber?: number;
    mac?: number;
    photo?: number;            // единственная колонка с путями
};

function simplifyHeader(s: string): string {
    return norm(s).toLowerCase().replace(/[^a-zа-я0-9/]+/g, "");
}

function mapColumns(header: ExcelJS.Row): ColMap {
    const res: ColMap = {};
    const lastCol = Math.max(header.cellCount, 50);
    for (let c = 1; c <= lastCol; c++) {
        const txt = cellToString(header.getCell(c));
        if (!txt) continue;
        const h = simplifyHeader(txt);

        if (!res.requestNo && /заявк/.test(h)) res.requestNo = c;
        else if (!res.trainNumber && /номерпоезд|поезд/.test(h)) res.trainNumber = c;
        else if (!res.carriageNumber && /номервагон|вагон/.test(h)) res.carriageNumber = c;
        else if (!res.equipmentName && /оборуд/.test(h) && !/s\/n|серийн/.test(h)) res.equipmentName = c;
        else if (!res.serialNumber && (/s\/n/.test(h) || /серийн/.test(h))) res.serialNumber = c;
        else if (!res.mac && /mac/.test(h)) res.mac = c;
        else if (!res.photo && /фото|photo|изображен/.test(h)) res.photo = c;
    }
    return res;
}

// ---------- основная логика поиска связей ----------
async function findRequest(id: number) {
    return prisma.request.findUnique({ where: { id } });
}

async function findCarriageByNumber(carriageNumber: string) {
    return prisma.carriage.findUnique({ where: { number: carriageNumber } });
}

async function findRequestCarriage(requestId: number, carriageId: number) {
    // Ищем RequestCarriage, привязанный к этому Request через RequestTrain
    return prisma.requestCarriage.findFirst({
        where: {
            carriageId,
            requestTrain: { requestId },
        },
        include: { requestTrain: true },
    });
}

async function findEquipmentBySNorMAC(sn: string | null, mac: string | null) {
    if (sn) {
        const bySN = await prisma.equipment.findUnique({ where: { serialNumber: sn } });
        if (bySN) return bySN;
    }
    if (mac) {
        const byMAC = await prisma.equipment.findUnique({ where: { macAddress: mac } });
        if (byMAC) return byMAC;
    }
    return null;
}

async function guessRequestEquipmentId(opts: {
    requestId: number;
    equipmentId?: number | null;
    equipmentName?: string | null;
    carriageNumber?: string | null;
}) {
    const { requestId, equipmentId, equipmentName, carriageNumber } = opts;

    // 1) по equipmentId — желательно и надёжно
    if (equipmentId) {
        const reqEqs = await prisma.requestEquipment.findMany({
            where: { requestId, equipmentId },
            select: { id: true, requestCarriageId: true, typeWorkId: true },
            orderBy: { id: "asc" },
        });
        if (reqEqs.length === 1) return reqEqs[0].id;
        if (reqEqs.length > 1) {
            // если есть номер вагона — уточняем
            if (carriageNumber) {
                const carriage = await prisma.carriage.findUnique({ where: { number: carriageNumber } });
                if (carriage) {
                    const found = await prisma.requestEquipment.findFirst({
                        where: {
                            requestId,
                            equipmentId,
                            requestCarriage: { carriageId: carriage.id },
                        },
                        select: { id: true },
                    });
                    if (found) return found.id;
                }
            }
            // иначе — берём первый, но предупреждаем (в логи)
            console.warn(`  ⚠️  Несколько RequestEquipment для request=${requestId}, equipment=${equipmentId}; беру первый.`);
            return reqEqs[0].id;
        }
    }

    // 2) fallback: по имени оборудования (менее надёжно)
    if (equipmentName) {
        const reqEqs = await prisma.requestEquipment.findMany({
            where: {
                requestId,
                equipment: { name: equipmentName },
            },
            select: { id: true, requestCarriageId: true },
            orderBy: { id: "asc" },
        });
        if (reqEqs.length === 1) return reqEqs[0].id;
        if (reqEqs.length > 1 && carriageNumber) {
            const carriage = await prisma.carriage.findUnique({ where: { number: carriageNumber } });
            if (carriage) {
                const found = reqEqs.find((x) => !!x.requestCarriageId); // можно дополнить уточнение по вагону
                if (found) return found.id;
            }
        }
        if (reqEqs.length > 0) {
            console.warn(`  ⚠️  Найдено несколько по имени "${equipmentName}" → беру первый.`);
            return reqEqs[0].id;
        }
    }

    return null;
}

// ---------- вставка фото ----------
async function insertCarriagePhoto(requestId: number, carriageNumber: string, rel: string, kind: "carriage" | "equipment", dry: boolean) {
    const carriage = await findCarriageByNumber(carriageNumber);
    if (!carriage) throw new Error(`Вагон ${carriageNumber} не найден в БД`);

    const rc = await findRequestCarriage(requestId, carriage.id);
    if (!rc) throw new Error(`RequestCarriage не найден: request=${requestId}, carriage=${carriageNumber}`);

    if (dry) return;

    await prisma.requestCarriagePhoto.create({
        data: {
            requestCarriageId: rc.id,
            photoType: kind === "carriage" ? CarriagePhotoType.carriage : CarriagePhotoType.equipment,
            photoPath: rel,
        },
    });
}

async function insertEquipmentPhoto(requestId: number, args: {
    sn: string | null;
    mac: string | null;
    equipmentName: string | null;
    carriageNumber: string | null;
    rel: string;
    key: EquipmentPhotoType;
    dry: boolean;
}) {
    const { sn, mac, equipmentName, carriageNumber, rel, key, dry } = args;

    const equip = await findEquipmentBySNorMAC(sn, mac);
    const reqEqId = await guessRequestEquipmentId({
        requestId,
        equipmentId: equip?.id ?? null,
        equipmentName,
        carriageNumber,
    });

    if (!reqEqId) {
        throw new Error(
            `RequestEquipment не найден: request=${requestId}, ` +
            `SN=${sn || "-"}, MAC=${mac || "-"}, name=${equipmentName || "-"}`
        );
    }

    if (dry) return;

    await prisma.requestEquipmentPhoto.create({
        data: {
            requestEquipmentId: reqEqId,
            photoType: key,
            photoPath: rel,
        },
    });
}

// ---------- main ----------
(async function main() {
    const args = parseArgs();
    const { xlsx, src, sheet, dryRun } = args;

    const uploadsRoot = safeJoinUpload();
    console.log(`\n➡️  Reading: xlsx=${xlsx}, sheet=${sheet || "(first)"}; src=${src}; uploads=${uploadsRoot}; dry=${dryRun}\n`);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(xlsx);
    const ws = sheet ? wb.getWorksheet(sheet) : wb.worksheets[0];
    if (!ws) {
        console.error(`❌ Лист "${sheet}" не найден.`);
        process.exit(1);
    }

    const header = ws.getRow(1);
    const cols = mapColumns(header);
    // Мини-лог по заголовкам
    const headerNames = header.values
        ? (Array.isArray(header.values) ? header.values.slice(1) : [])
        : [];
    console.log("Headers:", headerNames);
    console.log("Mapping indexes:", cols);
    console.log("Sheet rowCount:", ws.rowCount);

    const warnings: string[] = [];
    let rows = 0;
    let photosFound = 0;
    let copied = 0;
    let skipped = 0;
    let copiedCar = 0;
    let copiedEq = 0;

    for (let i = 2; i <= ws.rowCount; i++) {
        const row = ws.getRow(i);
        rows++;

        const requestNoStr = cols.requestNo ? cellToString(row.getCell(cols.requestNo)) : null;
        const requestNo = requestNoStr ? Number(requestNoStr) : NaN;

        const trainNumber = cols.trainNumber ? cellToString(row.getCell(cols.trainNumber)) : null; // не обязателен
        const carriageNumber = cols.carriageNumber ? cellToString(row.getCell(cols.carriageNumber)) : null;

        const equipmentName = cols.equipmentName ? cellToString(row.getCell(cols.equipmentName)) : null;
        const sn = cols.serialNumber ? cellToString(row.getCell(cols.serialNumber)) : null;
        const mac = normalizeMac(cols.mac ? cellToString(row.getCell(cols.mac)) : null);
        const photoCell = cols.photo ? cellToString(row.getCell(cols.photo)) : null;

        if (!requestNo || !Number.isFinite(requestNo) || !photoCell) {
            skipped++;
            warnings.push(`  - Row ${i}: нет requestNo/Фото — пропущено`);
            continue;
        }

        // Парсим фото-значение: допускаем перечисление через ; , | или перенос строки
        const rawPieces = photoCell.split(/[\n\r;|,]+/).map(norm).filter(Boolean);
        if (rawPieces.length === 0) {
            skipped++;
            warnings.push(`  - Row ${i}: пустая ячейка Фото — пропущено`);
            continue;
        }

        const req = await findRequest(requestNo);
        if (!req) {
            skipped++;
            warnings.push(`  - Row ${i}: Заявка ${requestNo} не найдена в БД — пропущено`);
            continue;
        }

        for (const raw of rawPieces) {
            // Нормализуем путь из Excel (бэкслэши → слэши)
            const relExcel = toPOSIX(raw);
            // Определяем тип
            const m = relExcel.match(/^(carriage|equipment)\/(carriage|equipment|serial|mac)\/([^/\\]+)$/i);
            if (!m) {
                warnings.push(`  - Row ${i}: непонятный путь "${relExcel}" — пропущено`);
                continue;
            }

            const top = m[1].toLowerCase();            // carriage | equipment
            const sub = m[2].toLowerCase();            // carriage|equipment|serial|mac
            const filename = m[3];

            // где лежит исходник
            const srcAbs = path.resolve(src, relExcel);
            if (!fsSync.existsSync(srcAbs)) {
                warnings.push(`  - Row ${i}: файл не найден в src: ${relExcel}`);
                continue;
            }

            // куда копировать в uploads
            let destAbsDir: string;
            let photoKey: "carriage/equipment" | EquipmentPhotoType;
            if (top === "carriage") {
                destAbsDir = safeJoinUpload("carriage", sub); // carriage/carriage | carriage/equipment
                photoKey = sub as "carriage/equipment";
            } else {
                // equipment/equipment | equipment/serial | equipment/mac
                if (!ALLOWED_EQUIP_KEYS.has(sub as EquipmentPhotoType)) {
                    warnings.push(`  - Row ${i}: недопустимый тип фото оборудования "${sub}"`);
                    continue;
                }
                destAbsDir = safeJoinUpload("equipment", sub);
                photoKey = sub as EquipmentPhotoType;
            }
            await ensureDir(destAbsDir);

            const ext = path.extname(filename) || path.extname(srcAbs) || ".jpg";
            const { rel, full } = await generateUniqueFilename(destAbsDir, ext);

            photosFound++;

            // dry-run: просто считаем и валидируем связи; на настоящем импорте — копируем и пишем БД
            if (!dryRun) {
                await fs.copyFile(srcAbs, full);
            }

            try {
                if (top === "carriage") {
                    // нужно: requestNo + carriageNumber
                    if (!carriageNumber) {
                        throw new Error("нет Номер вагона для фото вагона");
                    }
                    await insertCarriagePhoto(requestNo, carriageNumber, rel, (sub as "carriage" | "equipment"), dryRun);
                    copiedCar++;
                } else {
                    // фото оборудования — нужно: requestNo + (SN или MAC), иначе попробуем по названию
                    await insertEquipmentPhoto(requestNo, {
                        sn,
                        mac,
                        equipmentName,
                        carriageNumber,
                        rel,
                        key: photoKey as EquipmentPhotoType,
                        dry: dryRun,
                    });
                    copiedEq++;
                }
                if (!dryRun) copied++;
            } catch (e: any) {
                // если связи не нашли — удалим скопированный файл (в реальном режиме)
                if (!dryRun) {
                    try { await fs.unlink(full); } catch {}
                }
                warnings.push(`  - Row ${i}: ${e?.message || e}`);
            }
        }
    }

    console.log("\n✅ Done.");
    console.log(`Rows: ${rows}`);
    console.log(`Photos found: ${photosFound}`);
    console.log(`Copied (or would copy in dry-run): ${dryRun ? 0 : copied}`);
    console.log(`  carriage photos:  ${copiedCar}`);
    console.log(`  equipment photos: ${copiedEq}`);
    console.log(`Skipped rows: ${skipped}`);

    if (warnings.length) {
        console.log("\nWarnings:");
        // чтобы не заливать консоль — выведем первые 50
        warnings.slice(0, 50).forEach((w) => console.log(w));
        if (warnings.length > 50) {
            console.log(`  ...и ещё ${warnings.length - 50} предупреждений`);
        }
    }
})()
    .catch((e) => {
        console.error("❌ Ошибка импорта фото:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
