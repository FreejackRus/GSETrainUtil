import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Настройки
const EXCEL_FILE_PATH = './Перечень работ по составам (1).xlsx';
const SHEET_NAME = 'Journal';
const DEFAULT_CURRENT_LOCATION_NAME = 'Главный депо'; // имя локации для всех заявок
const DEFAULT_COMPLETED_JOB_NAME = 'Перемена';    // Кто выполняет заявку (CompletedJob)

async function main() {
    // 1. Создать пользователей (admin и engineer)
    const [adminPwdHash, engineerPwdHash] = await Promise.all([
        bcrypt.hash('admin', 10),
        bcrypt.hash('engineer', 10),
    ]);

    const admin = await prisma.user.upsert({
        where: { login: 'admin' }, update: {}, create: {
            login: 'admin', password: adminPwdHash, role: 'admin', name: 'Администратор'
        }
    });

    const engineer = await prisma.user.upsert({
        where: { login: 'engineer' }, update: {}, create: {
            login: 'engineer', password: engineerPwdHash, role: 'engineer', name: 'Инженер'
        }
    });
    const defaultUserId = engineer.id;

    // 2. Упсерт для default CompletedJob и CurrentLocation
    const [completedJob, currentLocation] = await Promise.all([
        prisma.completedJob.upsert({ where: { name: DEFAULT_COMPLETED_JOB_NAME }, update: {}, create: { name: DEFAULT_COMPLETED_JOB_NAME } }),
        prisma.currentLocation.upsert({ where: { name: DEFAULT_CURRENT_LOCATION_NAME }, update: {}, create: { name: DEFAULT_CURRENT_LOCATION_NAME } }),
    ]);
    const defaultCompletedJobId = completedJob.id;
    const defaultCurrentLocationId = currentLocation.id;

    // 3. Чтение Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_FILE_PATH);
    const sheet = workbook.getWorksheet(SHEET_NAME);

    // Кэши для предотвращения дублирования
    const trainMap = new Map<string, number>();
    const carriageMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();
    const equipmentMap = new Map<string, number>();
    const typeWorkMap = new Map<string, number>();
    const createdRequests = new Set<number>();

    if (!sheet) {
        throw Error('Нет данных');
    }
    // 4. Обход строк
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
        const row = sheet.getRow(rowNumber);
        const date = row.getCell('A').value as Date;
        const requestId = Number(row.getCell('B').value);
        const typeWorkName = String(row.getCell('C').value);
        // MAC2 (столбец J) игнорируется
        const trainNumber = String(row.getCell('D').value);
        const carriageType = String(row.getCell('E').value);
        const carriageNumber = String(row.getCell('F').value);
        const equipmentName = String(row.getCell('G').value);
        const serialNumber = row.getCell('H').value ? String(row.getCell('H').value) : null;
        const macAddress = row.getCell('I').value ? String(row.getCell('I').value) : null;

        // Создать заявку один раз на requestId
        if (!createdRequests.has(requestId)) {
            await prisma.request.create({ data: {
                    id: requestId,
                    status: 'draft',
                    userId: defaultUserId,
                    currentLocationId: defaultCurrentLocationId,
                    completedJobId: defaultCompletedJobId,
                    createdAt: date,
                }});
            createdRequests.add(requestId);
        }

        // Upsert Train
        let trainId: number;
        if (trainMap.has(trainNumber)) {
            trainId = trainMap.get(trainNumber)!;
        } else {
            const t = await prisma.train.upsert({ where: { number: trainNumber }, update: {}, create: { number: trainNumber } });
            trainId = t.id; trainMap.set(trainNumber, trainId);
        }
        await prisma.requestTrain.create({ data: { requestId, trainId } });

        // Upsert Carriage
        const carriageKey = `${carriageNumber}_${trainId}`;
        let carriageId: number;
        if (carriageMap.has(carriageKey)) {
            carriageId = carriageMap.get(carriageKey)!;
        } else {
            const c = await prisma.carriage.upsert({
                where: { number_trainId: { number: carriageNumber, trainId } },
                update: {},
                create: { number: carriageNumber, type: carriageType, trainId }
            });
            carriageId = c.id; carriageMap.set(carriageKey, carriageId);
        }
        await prisma.requestCarriage.create({ data: { requestId, carriageId, carriagePhoto: null } });

        // Upsert Device и Equipment
        let deviceId: number;
        if (deviceMap.has(equipmentName)) {
            deviceId = deviceMap.get(equipmentName)!;
        } else {
            const d = await prisma.device.upsert({ where: { name: equipmentName }, update: {}, create: { name: equipmentName } });
            deviceId = d.id; deviceMap.set(equipmentName, deviceId);
        }
        const equipmentKey = `${equipmentName}_${serialNumber||''}_${macAddress||''}_${carriageId}`;
        let equipmentId: number;
        if (equipmentMap.has(equipmentKey)) {
            equipmentId = equipmentMap.get(equipmentKey)!;
        } else {
            const eq = await prisma.equipment.create({ data: { name: equipmentName, deviceId, serialNumber, macAddress, carriageId } });
            equipmentId = eq.id; equipmentMap.set(equipmentKey, equipmentId);
        }

        // Upsert TypeWork и RequestEquipment
        let typeWorkId: number;
        if (typeWorkMap.has(typeWorkName)) {
            typeWorkId = typeWorkMap.get(typeWorkName)!;
        } else {
            const tw = await prisma.typeWork.upsert({ where: { name: typeWorkName }, update: {}, create: { name: typeWorkName } });
            typeWorkId = tw.id; typeWorkMap.set(typeWorkName, typeWorkId);
        }
        await prisma.requestEquipment.create({ data: { requestId, equipmentId, typeWorkId, quantity: 1 } });
    }

    console.log('Импорт завершён.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
