import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Настройки импорта
const EXCEL_FILE_PATH = './Перечень работ по составам (1).xlsx';
const SHEET_NAME = 'Journal';
const DEFAULT_COMPLETED_JOB_NAME = 'Перемена';
const DEFAULT_CURRENT_LOCATION_NAME = 'Главный депо';

async function main() {
    // 1. Создание/обновление пользователей
    const [adminPwdHash, engineerPwdHash] = await Promise.all([
        bcrypt.hash('admin', 10),
        bcrypt.hash('engineer', 10),
    ]);

    await prisma.user.upsert({
        where: { login: 'admin' },
        update: {},
        create: { login: 'admin', password: adminPwdHash, role: 'admin', name: 'Администратор' },
    });

    const engineer = await prisma.user.upsert({
        where: { login: 'engineer' },
        update: {},
        create: { login: 'engineer', password: engineerPwdHash, role: 'engineer', name: 'Инженер' },
    });
    const defaultUserId = engineer.id;

    // 2. Upsert CompletedJob и CurrentLocation
    const completedJob = await prisma.completedJob.upsert({
        where: { name: DEFAULT_COMPLETED_JOB_NAME },
        update: {},
        create: { name: DEFAULT_COMPLETED_JOB_NAME },
    });
    const currentLocation = await prisma.currentLocation.upsert({
        where: { name: DEFAULT_CURRENT_LOCATION_NAME },
        update: {},
        create: { name: DEFAULT_CURRENT_LOCATION_NAME },
    });
    const defaultCompletedJobId = completedJob.id;
    const defaultCurrentLocationId = currentLocation.id;

    // 3. Чтение Excel и фильтрация валидных строк
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_FILE_PATH);
    const sheet = workbook.getWorksheet(SHEET_NAME);

    if (!sheet) throw new Error('<UNK> <UNK> <UNK> <UNK> <UNK>');

    const uniqueRequests = new Map<number, Date>();
    const validRows: ExcelJS.Row[] = [];
    for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        const requestCell = row.getCell('B').value;
        const dateValue = row.getCell('A').value;
        const requestId = Number(requestCell);
        const date = dateValue instanceof Date ? dateValue : null;
        // Пропускаем некорректные записи
        if (requestId > 0 && date) {
            if (!uniqueRequests.has(requestId)) {
                uniqueRequests.set(requestId, date);
            }
            validRows.push(row);
        }
    }

    // 4. Массовое создание заявок
    const requestsData = Array.from(uniqueRequests.entries()).map(
        ([requestId, date]) => ({
            id: requestId,
            status: 'draft',
            userId: defaultUserId,
            currentLocationId: defaultCurrentLocationId,
            completedJobId: defaultCompletedJobId,
            createdAt: date,
        })
    );
    await prisma.request.createMany({
        data: requestsData,
        skipDuplicates: true,
    });

    // 5. Инициализация кэшей и множеств для связей
    const trainMap = new Map<string, number>();
    const carriageMap = new Map<string, number>();
    const equipmentMap = new Map<string, number>();
    const typeWorkMap = new Map<string, number>();
    const requestTrainSet = new Set<string>();
    const requestCarriageSet = new Set<string>();
    const requestEquipmentSet = new Set<string>();

    // 6. Обработка каждой валидной строки
    for (const row of validRows) {
        const requestId = Number(row.getCell('B').value);
        const typeWorkName = String(row.getCell('C').value);
        const trainNumber = String(row.getCell('D').value);
        const carriageType = String(row.getCell('E').value);
        const carriageNumber = String(row.getCell('F').value);
        const equipmentName = String(row.getCell('G').value);
        const serialNumber = row.getCell('H').value ? String(row.getCell('H').value) : null;
        const macAddress = row.getCell('I').value ? String(row.getCell('I').value) : null;

        // 6.1 Upsert Train и связь
        let trainId: number;
        if (trainMap.has(trainNumber)) {
            trainId = trainMap.get(trainNumber)!;
        } else {
            const t = await prisma.train.upsert({
                where: { number: trainNumber },
                update: {},
                create: { number: trainNumber },
            });
            trainId = t.id;
            trainMap.set(trainNumber, trainId);
        }
        const rtKey = `${requestId}_${trainId}`;
        if (!requestTrainSet.has(rtKey)) {
            await prisma.requestTrain.create({ data: { requestId, trainId } });
            requestTrainSet.add(rtKey);
        }

        // 6.2 Upsert Carriage и связь
        const carriageKey = `${carriageNumber}_${trainId}`;
        let carriageId: number;
        if (carriageMap.has(carriageKey)) {
            carriageId = carriageMap.get(carriageKey)!;
        } else {
            const c = await prisma.carriage.upsert({
                where: { number_trainId: { number: carriageNumber, trainId } },
                update: {},
                create: { number: carriageNumber, type: carriageType, trainId },
            });
            carriageId = c.id;
            carriageMap.set(carriageKey, carriageId);
        }
        const rcKey = `${requestId}_${carriageId}`;
        if (!requestCarriageSet.has(rcKey)) {
            await prisma.requestCarriage.create({ data: { requestId, carriageId, carriagePhoto: null } });
            requestCarriageSet.add(rcKey);
        }

        // 6.3 Upsert Equipment и связь
        const equipmentKey = `${equipmentName}|${serialNumber || ''}|${macAddress || ''}|${carriageId}`;
        let equipmentId: number;
        if (equipmentMap.has(equipmentKey)) {
            equipmentId = equipmentMap.get(equipmentKey)!;
        } else {
            const existing = await prisma.equipment.findFirst({
                where: { name: equipmentName, serialNumber, macAddress, carriageId },
            });
            if (existing) {
                equipmentId = existing.id;
            } else {
                const eq = await prisma.equipment.create({ data: { name: equipmentName, serialNumber, macAddress, carriageId } });
                equipmentId = eq.id;
            }
            equipmentMap.set(equipmentKey, equipmentId);
        }

        // 6.4 Upsert TypeWork и связь заявки–оборудование
        let typeWorkId: number;
        if (typeWorkMap.has(typeWorkName)) {
            typeWorkId = typeWorkMap.get(typeWorkName)!;
        } else {
            const tw = await prisma.typeWork.upsert({
                where: { name: typeWorkName },
                update: {},
                create: { name: typeWorkName },
            });
            typeWorkId = tw.id;
            typeWorkMap.set(typeWorkName, typeWorkId);
        }
        const reKey = `${requestId}_${equipmentId}`;
        if (!requestEquipmentSet.has(reKey)) {
            await prisma.requestEquipment.create({ data: { requestId, equipmentId, typeWorkId } });
            requestEquipmentSet.add(reKey);
        }
    }

    console.log('Импорт завершён.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
