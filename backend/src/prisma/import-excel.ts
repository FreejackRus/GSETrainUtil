// scripts/import-journal.ts
// Импорт листа "Journal" из xlsx в БД (Prisma).
// Идентификация оборудования: S/N → MAC → placeholder (только если обоих нет).
// MAC храним без разделителей, UPPERCASE. DEBUG_IMPORT=1 — подробные логи.

import { Prisma, PrismaClient, RequestStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();
const DEBUG = process.env.DEBUG_IMPORT === '1';
const RESET_UNK = process.env.RESET_UNK === '1';

/* ---------------------- Настройки ---------------------- */
const EXCEL_FILE_PATH = process.env.EXCEL_FILE_PATH ?? './perechen.xlsx';
const SHEET_NAME = 'Journal';
const DEFAULT_PERFORMER = 'Перемена';
const DEFAULT_LOCATION = 'Главный депо';

/* ---------------------- Хелперы ------------------------ */
function norm(s: string): string {
    return s.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
}
function simplifyHeader(s: string): string {
    return norm(s).toLowerCase().replace(/[^a-zа-я0-9/]+/g, '');
}
function cellToString(cell: ExcelJS.Cell | undefined | null): string | null {
    if (!cell) return null;
    const t = (cell as any).text;
    if (typeof t === 'string' && t.trim()) return norm(t);

    const v: any = cell.value;
    if (v == null) return null;
    if (typeof v === 'string') return norm(v);
    if (typeof v === 'number') return String(v);
    if (v instanceof Date) return v.toISOString();

    if (v && Array.isArray(v.richText)) return norm(v.richText.map((rt: any) => rt?.text ?? '').join(''));
    if (v && typeof v === 'object' && 'formula' in v) {
        const res = (v as any).result;
        if (res != null) return norm(String(res));
        const t2 = (v as any).text;
        if (t2) return norm(String(t2));
    }
    if (v && typeof v === 'object' && 'text' in v && 'hyperlink' in v) {
        return norm((v as any).text || (v as any).hyperlink || '');
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
    const t = s.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
    return t.length ? t : null;
}
function shortHex(s: string, len = 20): string {
    return crypto.createHash('sha1').update(s).digest('hex').slice(0, len);
}

/* ---------------------- Главная ------------------------ */
async function main() {
    if (RESET_UNK) {
        console.log('🧹 Чищу placeholders UNK-*...');
        await prisma.requestEquipment.deleteMany({
            where: { equipment: { is: { serialNumber: { startsWith: 'UNK-' } } } },
        });
        await prisma.equipment.deleteMany({
            where: { serialNumber: { startsWith: 'UNK-' } },
        });
    }

    // 0) базовые сущности
    const [adminHash, engHash] = await Promise.all([bcrypt.hash('admin', 10), bcrypt.hash('engineer', 10)]);
    await prisma.user.upsert({ where: { login: 'admin' }, update: {}, create: { login: 'admin', password: adminHash, role: 'admin', name: 'Администратор' } });
    const engineer = await prisma.user.upsert({ where: { login: 'engineer' }, update: {}, create: { login: 'engineer', password: engHash, role: 'engineer', name: 'Инженер' } });
    const performer = await prisma.performer.upsert({ where: { name: DEFAULT_PERFORMER }, update: {}, create: { name: DEFAULT_PERFORMER } });
    const location = await prisma.currentLocation.upsert({ where: { name: DEFAULT_LOCATION }, update: {}, create: { name: DEFAULT_LOCATION } });

    // Кэш типов работ
    const typeWorkCache = new Map<string, number>();
    async function getTypeWorkId(name: string) {
        if (typeWorkCache.has(name)) return typeWorkCache.get(name)!;
        const tw = await prisma.typeWork.upsert({ where: { name }, update: {}, create: { name } });
        typeWorkCache.set(name, tw.id);
        return tw.id;
    }

    // 1) читаем Excel
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(EXCEL_FILE_PATH);
    const sheet = wb.getWorksheet(SHEET_NAME);
    if (!sheet) throw new Error(`Лист "${SHEET_NAME}" не найден в ${EXCEL_FILE_PATH}`);

    // 2) сопоставляем колонки
    const header = sheet.getRow(1);
    const mapHeaders = () => {
        const res: any = {};
        const lastCol = Math.max(sheet.columnCount, header.cellCount, 50);
        for (let c = 1; c <= lastCol; c++) {
            const txt = cellToString(header.getCell(c));
            if (!txt) continue;
            const h = simplifyHeader(txt);

            if (!res.date && /дата/.test(h)) res.date = c;
            else if (!res.requestNo && /заявк/.test(h)) res.requestNo = c;
            else if (!res.typeWork && /типработ/.test(h)) res.typeWork = c;
            else if (!res.trainNumber && /номерпоезд/.test(h)) res.trainNumber = c;
            else if (!res.carriageType && /типвагон/.test(h)) res.carriageType = c;
            else if (!res.carriageNumber && /номервагон/.test(h)) res.carriageNumber = c;
            else if (!res.equipmentName && /оборуд/.test(h) && !/s\/n|серийн/.test(h)) res.equipmentName = c;
            else if (!res.serialNumber && (/s\/n/.test(h) || /серийн/.test(h))) res.serialNumber = c;
            else if (!res.mac && /mac/.test(h)) res.mac = c;
        }
        // fallback — A..I
        res.date ??= 1; res.requestNo ??= 2; res.typeWork ??= 3; res.trainNumber ??= 4;
        res.carriageType ??= 5; res.carriageNumber ??= 6; res.equipmentName ??= 7;
        res.serialNumber ??= 8; res.mac ??= 9;
        return res as { date: number; requestNo: number; typeWork: number; trainNumber: number; carriageType: number; carriageNumber: number; equipmentName: number; serialNumber: number; mac: number; };
    };
    const COL = mapHeaders();
    if (DEBUG) console.log('Header mapping:', COL);

    type RowData = {
        rowIndex: number;
        date: Date;
        requestNo: number;
        typeWork: string;
        trainNumber: string;
        carriageType: string;
        carriageNumber: string;
        equipmentName: string;
        serialNumber: string | null;
        macAddress: string | null;
    };

    const rows: RowData[] = [];
    const uniqueRequests = new Map<number, Date>();
    let snCnt = 0, macCnt = 0, noneCnt = 0;

    // 3) читаем строки
    for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);

        const dateVal = row.getCell(COL.date).value;
        const date = dateVal instanceof Date ? dateVal : null;
        const reqStr = cellToString(row.getCell(COL.requestNo));
        const requestNo = reqStr ? Number(reqStr) : NaN;
        if (!date || !Number.isFinite(requestNo) || requestNo <= 0) continue;

        const typeWork       = cellToString(row.getCell(COL.typeWork)) ?? '';
        const trainNumber    = cellToString(row.getCell(COL.trainNumber)) ?? '';
        const carriageType   = cellToString(row.getCell(COL.carriageType)) ?? '';
        const carriageNumber = cellToString(row.getCell(COL.carriageNumber)) ?? '';
        const equipmentName  = cellToString(row.getCell(COL.equipmentName)) ?? '';
        const serialNumber   = cellToString(row.getCell(COL.serialNumber));
        const macAddress     = normalizeMac(cellToString(row.getCell(COL.mac)));

        if (!typeWork || !trainNumber || !carriageNumber || !equipmentName) continue;

        if (serialNumber) snCnt++;
        if (macAddress) macCnt++;
        if (!serialNumber && !macAddress) noneCnt++;

        if (DEBUG && i < 12) {
            console.log(`[ROW ${i}] SN="${serialNumber}" MACraw="${cellToString(row.getCell(COL.mac))}" → MAC="${macAddress}"`);
        }

        rows.push({ rowIndex: i, date, requestNo, typeWork, trainNumber, carriageType, carriageNumber, equipmentName, serialNumber, macAddress });
        if (!uniqueRequests.has(requestNo)) uniqueRequests.set(requestNo, date);
    }

    // 4) сортировка по дате
    rows.sort((a, b) => a.date.getTime() - b.date.getTime() || a.rowIndex - b.rowIndex);

    // 5) создаём заявки (id = номер из Excel)
    if (uniqueRequests.size > 0) {
        const createBulk = Array.from(uniqueRequests.entries()).map(([id, createdAt]) => ({
            id,
            status: RequestStatus.completed,
            userId: engineer.id,
            currentLocationId: location.id,
            performerId: performer.id,
            createdAt,
        }));
        await prisma.request.createMany({ data: createBulk, skipDuplicates: true });
    }

    // 6) кэши и помощники
    const trainIdByNumber = new Map<string, number>();
    const carriageIdByNumber = new Map<string, number>();
    const requestTrainIdCache = new Map<string, number>();
    const requestCarriageIdCache = new Map<string, number>();

    async function getTrainId(number: string) {
        if (trainIdByNumber.has(number)) return trainIdByNumber.get(number)!;
        const t = await prisma.train.upsert({ where: { number }, update: {}, create: { number } });
        trainIdByNumber.set(number, t.id);
        return t.id;
    }
    async function getCarriageId(number: string, type: string) {
        if (carriageIdByNumber.has(number)) return carriageIdByNumber.get(number)!;
        const existing = await prisma.carriage.findUnique({ where: { number } });
        let c;
        if (existing) {
            if (!existing.type && type) c = await prisma.carriage.update({ where: { number }, data: { type } });
            else c = existing;
        } else {
            c = await prisma.carriage.create({ data: { number, type } });
        }
        carriageIdByNumber.set(number, c.id);
        return c.id;
    }
    async function getRequestTrainId(requestId: number, trainId: number) {
        const key = `${requestId}:${trainId}`;
        if (requestTrainIdCache.has(key)) return requestTrainIdCache.get(key)!;
        const rt = await prisma.requestTrain.upsert({
            where: { requestId_trainId: { requestId, trainId } },
            update: {},
            create: { requestId, trainId },
        });
        requestTrainIdCache.set(key, rt.id);
        return rt.id;
    }
    async function getRequestCarriageId(requestTrainId: number, carriageId: number) {
        const key = `${requestTrainId}:${carriageId}`;
        if (requestCarriageIdCache.has(key)) return requestCarriageIdCache.get(key)!;
        const rc = await prisma.requestCarriage.upsert({
            where: { requestTrainId_carriageId: { requestTrainId, carriageId } },
            update: {},
            create: { requestTrainId, carriageId },
        });
        requestCarriageIdCache.set(key, rc.id);
        return rc.id;
    }

    // Главная «умная» функция: найти/создать/слить Equipment по SN/MAC
    async function getOrCreateEquipment(opts: {
        name: string;
        serialNumber: string | null;
        macAddress: string | null; // UPPERCASE, без разделителей
    }) {
        const { name, serialNumber, macAddress } = opts;

        const [bySN, byMAC] = await Promise.all([
            serialNumber ? prisma.equipment.findUnique({ where: { serialNumber } }) : Promise.resolve(null),
            macAddress   ? prisma.equipment.findUnique({ where: { macAddress } })   : Promise.resolve(null),
        ]);

        // 1) Нашлись обе (разные) → MERGE (без конфликтов уникальных ключей)
        if (bySN && byMAC && bySN.id !== byMAC.id) {
            const primary   = bySN;   // с SN
            const secondary = byMAC;  // с MAC

            await prisma.$transaction(async (tx) => {
                // переносим связи RE по одной, уважая уникальный ключ (requestId, equipmentId, typeWorkId)
                const secREs = await tx.requestEquipment.findMany({
                    where: { equipmentId: secondary.id },
                    select: { id: true, requestId: true, typeWorkId: true },
                });

                for (const re of secREs) {
                    const dup = await tx.requestEquipment.findFirst({
                        where: { requestId: re.requestId, typeWorkId: re.typeWorkId, equipmentId: primary.id },
                        select: { id: true },
                    });

                    if (dup) {
                        // перенос фото, затем удаляем вторичную строку
                        await tx.requestEquipmentPhoto.updateMany({
                            where: { requestEquipmentId: re.id },
                            data:  { requestEquipmentId: dup.id },
                        });
                        await tx.requestEquipment.delete({ where: { id: re.id } });
                    } else {
                        await tx.requestEquipment.update({
                            where: { id: re.id },
                            data:  { equipmentId: primary.id },
                        });
                    }
                }

                // удаляем secondary → освобождаем уникальный MAC
                await tx.equipment.delete({ where: { id: secondary.id } });

                // патчим primary
                const patch: any = {};
                if (!primary.macAddress && macAddress) patch.macAddress = macAddress;
                if (name && name !== primary.name)     patch.name = name;
                if (Object.keys(patch).length) {
                    await tx.equipment.update({ where: { id: primary.id }, data: patch });
                }
            });

            return bySN.id;
        }

        // 2) Есть только SN → дописать MAC/имя
        if (bySN && !byMAC) {
            const patch: any = {};
            if (macAddress && !bySN.macAddress) patch.macAddress = macAddress;
            if (name && name !== bySN.name)     patch.name = name;
            if (Object.keys(patch).length) {
                await prisma.equipment.update({ where: { id: bySN.id }, data: patch });
            }
            return bySN.id;
        }

        // 3) Есть только MAC → дописать SN/имя
        if (!bySN && byMAC) {
            const patch: any = {};
            if (serialNumber && !byMAC.serialNumber) patch.serialNumber = serialNumber;
            if (name && name !== byMAC.name)         patch.name = name;
            if (Object.keys(patch).length) {
                await prisma.equipment.update({ where: { id: byMAC.id }, data: patch });
            }
            return byMAC.id;
        }

        // 4) Ни SN, ни MAC — создаём (placeholder только если действительно оба отсутствуют)
        if (serialNumber) {
            try {
                const created = await prisma.equipment.create({
                    data: { name, serialNumber, ...(macAddress ? { macAddress } : {}) },
                });
                return created.id;
            } catch (e: any) {
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    // гонка: пересчитываем и при необходимости — MERGE тем же алгоритмом
                    const againBySN  = await prisma.equipment.findUnique({ where: { serialNumber } });
                    const againByMAC = macAddress ? await prisma.equipment.findUnique({ where: { macAddress } }) : null;

                    if (againBySN && againByMAC && againBySN.id !== againByMAC.id) {
                        const primary   = againBySN;
                        const secondary = againByMAC;

                        await prisma.$transaction(async (tx) => {
                            const secREs = await tx.requestEquipment.findMany({
                                where: { equipmentId: secondary.id },
                                select: { id: true, requestId: true, typeWorkId: true },
                            });

                            for (const re of secREs) {
                                const dup = await tx.requestEquipment.findFirst({
                                    where: { requestId: re.requestId, typeWorkId: re.typeWorkId, equipmentId: primary.id },
                                    select: { id: true },
                                });

                                if (dup) {
                                    await tx.requestEquipmentPhoto.updateMany({
                                        where: { requestEquipmentId: re.id },
                                        data:  { requestEquipmentId: dup.id },
                                    });
                                    await tx.requestEquipment.delete({ where: { id: re.id } });
                                } else {
                                    await tx.requestEquipment.update({
                                        where: { id: re.id },
                                        data:  { equipmentId: primary.id },
                                    });
                                }
                            }

                            await tx.equipment.delete({ where: { id: secondary.id } });

                            const patch: any = {};
                            if (!primary.macAddress && macAddress) patch.macAddress = macAddress;
                            if (name && name !== primary.name)     patch.name = name;
                            if (Object.keys(patch).length) {
                                await tx.equipment.update({ where: { id: primary.id }, data: patch });
                            }
                        });

                        return primary.id;
                    }
                    if (againBySN) return againBySN.id;
                }
                throw e;
            }
        }

        if (macAddress) {
            try {
                const created = await prisma.equipment.create({ data: { name, macAddress } });
                return created.id;
            } catch (e: any) {
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    const againByMAC = await prisma.equipment.findUnique({ where: { macAddress } });
                    if (againByMAC) {
                        const patch: any = {};
                        if (name && name !== againByMAC.name)         patch.name = name;
                        if (serialNumber && !againByMAC.serialNumber) patch.serialNumber = serialNumber;
                        if (Object.keys(patch).length) {
                            await prisma.equipment.update({ where: { id: againByMAC.id }, data: patch });
                        }
                        return againByMAC.id;
                    }
                }
                throw e;
            }
        }

        // 5) Placeholder — только когда нет ни SN, ни MAC
        const placeholderSN = `UNK-${shortHex(name, 20)}`;
        const existed = await prisma.equipment.findUnique({ where: { serialNumber: placeholderSN } });
        if (existed) return existed.id;
        const created = await prisma.equipment.create({ data: { name, serialNumber: placeholderSN } });
        return created.id;
    }

    // 7) основной проход
    let placeholders = 0;
    for (const r of rows) {
        const {
            date, requestNo, typeWork, trainNumber, carriageType, carriageNumber,
            equipmentName, serialNumber, macAddress,
        } = r;

        const requestId = requestNo;
        const trainId = await getTrainId(trainNumber);
        const carriageId = await getCarriageId(carriageNumber, carriageType);
        const requestTrainId = await getRequestTrainId(requestId, trainId);
        const requestCarriageId = await getRequestCarriageId(requestTrainId, carriageId);
        const typeWorkId = await getTypeWorkId(typeWork);

        const equipmentId = await getOrCreateEquipment({ name: equipmentName, serialNumber, macAddress });

        await prisma.requestEquipment.upsert({
            where: { requestId_equipmentId_typeWorkId: { requestId, equipmentId, typeWorkId } },
            update: {},
            create: { requestId, requestCarriageId, equipmentId, typeWorkId },
        });

        if (typeWork === 'Монтаж') {
            await prisma.equipment.update({ where: { id: equipmentId }, data: { carriageId, lastService: date } });
        } else if (typeWork === 'Демонтаж') {
            await prisma.equipment.update({ where: { id: equipmentId }, data: { carriageId: null, lastService: date } });
        } else if (typeWork === 'Обслуживание') {
            await prisma.equipment.update({ where: { id: equipmentId }, data: { lastService: date } });
        }

        if (!serialNumber && !macAddress) placeholders++;
    }

    // 8) фикс sequence после явных id
    await prisma.$executeRawUnsafe(`
        SELECT setval(
                       pg_get_serial_sequence('"requests"', 'id'),
                       GREATEST((SELECT COALESCE(MAX(id), 1) FROM "requests"), 1)
               );
    `);

    console.log(`✅ Импорт завершён. Строк: ${rows.length}. S/N: ${snCnt}, MAC: ${macCnt}, без идентификаторов: ${noneCnt}, placeholders: ${placeholders}.`);

    // 📊 Итоговая статистика по БД
    const [total, realSN, withMAC, unk] = await Promise.all([
        prisma.equipment.count(),
        prisma.equipment.count({
            where: { serialNumber: { not: null }, NOT: { serialNumber: { startsWith: 'UNK-' } } },
        }),
        prisma.equipment.count({ where: { macAddress: { not: null } } }),
        prisma.equipment.count({ where: { serialNumber: { startsWith: 'UNK-' } } }),
    ]);

    console.log(`📊 Equipment in DB: total=${total}, realSN=${realSN}, withMAC=${withMAC}, UNK=${unk}`);

    if (DEBUG) {
        const sample = await prisma.equipment.findMany({
            where: { serialNumber: { not: null }, NOT: { serialNumber: { startsWith: 'UNK-' } } },
            select: { id: true, name: true, serialNumber: true, macAddress: true },
            take: 10,
        });
        console.log('🔎 Sample real SN rows:', sample);
    }
}

main()
    .catch((e) => {
        console.error('❌ Ошибка импорта:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
