import * as XLSX from 'xlsx';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JournalEntry {
  dateCompleted: string;
  applicationNumber: string;
  workType: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  equipment: string;
  serialNumber: string;
  macAddress: string;
  quantity: string;
  completedBy: string;
  currentLocation: string;
}

interface WagonEntry {
  wagonNumber: string;
  type: string;
  [key: string]: string; // для различного оборудования
}

interface EquipmentItem {
  equipmentType: string;
  serialNumber: string | null;
  macAddress: string | null;
  countEquipment: number;
}

interface RequestData {
  applicationNumber: string;
  applicationDate: Date;
  typeWork: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  completedJob: string;
  currentLocation: string;
  userId: number;
  userName: string;
  userRole: string;
  equipment: EquipmentItem[];
}

export async function importExcelData(filePath: string) {
  try {
    console.log('Начинаю импорт данных из Excel файла...');
    
    // Читаем Excel файл
    const workbook = XLSX.readFile(filePath);
    
    // Импортируем данные из листа Journal
    await importJournalData(workbook);
    
    // Импортируем данные из листа Вагоны
    // await importWagonData(workbook);
    
    console.log('Импорт данных завершен успешно!');
  } catch (error) {
    console.error('Ошибка при импорте данных:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function importJournalData(workbook: XLSX.WorkBook) {
  console.log('Импорт данных из листа Journal...');

  const journalSheet = workbook.Sheets['Journal'];
  if (!journalSheet) {
    console.log('Лист Journal не найден');
    return;
  }

  const journalData: any[] = XLSX.utils.sheet_to_json(journalSheet);
  console.log(`Найдено ${journalData.length} записей в листе Journal`);

  const requestsMap = new Map<string, RequestData>();

  for (const row of journalData) {
    const applicationNumber = String(row['Заявка'] || '').trim();
    if (!applicationNumber) continue;

    const typeWork = String(row['Тип работ'] || '').trim();
    const trainNumber = String(row['Номер поезда'] || '').trim();
    const carriageType = String(row['Тип вагона'] || '').trim();
    const carriageNumber = String(row['Номер вагона'] || '').trim();
    const completedJob = String(row['Работы выполнил'] || '').trim();
    const currentLocation = String(row['Тек.место'] || '').trim();

    if (!typeWork || !trainNumber || !carriageType || !carriageNumber || !completedJob || !currentLocation) {
      console.log('Пропускаем строку с незаполненными обязательными полями:', row);
      continue;
    }

    let applicationDate: Date;
    if (row['Дата выполнения работ']) {
      if (typeof row['Дата выполнения работ'] === 'number') {
        const excelDate = XLSX.SSF.parse_date_code(row['Дата выполнения работ']);
        applicationDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
      } else {
        const parsedDate = new Date(row['Дата выполнения работ']);
        applicationDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      }
    } else {
      applicationDate = new Date();
    }

    const equipment: EquipmentItem[] = row['Оборудование']
      ? [{
          equipmentType: row['Оборудование'],
          serialNumber: row['S/N оборудования'] ? String(row['S/N оборудования']) : null,
          macAddress: row['MAC адрес'] || null,
          countEquipment: row['Кол-во'] ? parseInt(String(row['Кол-во'])) : 1
        }]
      : [];

    if (requestsMap.has(applicationNumber)) {
      const existing = requestsMap.get(applicationNumber);
      if (row['Оборудование'] && existing) {
        existing.equipment.push(...equipment);
      }
    } else {
      requestsMap.set(applicationNumber, {
        applicationNumber,
        applicationDate,
        typeWork,
        trainNumber,
        carriageType,
        carriageNumber,
        completedJob,
        currentLocation,
        userId: 1,
        userName: 'System',
        userRole: 'admin',
        equipment
      });
    }
  }

  console.log(`Обработано ${requestsMap.size} уникальных заявок`);

  for (const [applicationNumber, requestData] of requestsMap) {
    try {
      const appNumberInt = parseInt(applicationNumber);
      if (isNaN(appNumberInt)) {
        console.log(`Пропускаем заявку с некорректным номером: ${applicationNumber}`);
        continue;
      }

      const typeWork = await prisma.typeWork.upsert({
        where: { name: requestData.typeWork },
        update: {},
        create: { name: requestData.typeWork }
      });

      const train = await prisma.train.upsert({
        where: { number: requestData.trainNumber },
        update: {},
        create: { number: requestData.trainNumber }
      });

      const carriage = await prisma.carriage.upsert({
        where: {
          number_trainId: {
            number: requestData.carriageNumber,
            trainId: train.id
          }
        },
        update: {},
        create: {
          number: requestData.carriageNumber,
          type: requestData.carriageType,
          trainId: train.id
        }
      });

      const completedJob = await prisma.completedJob.upsert({
        where: { name: requestData.completedJob },
        update: {},
        create: { name: requestData.completedJob }
      });

      const location = await prisma.currentLocation.upsert({
        where: { name: requestData.currentLocation },
        update: {},
        create: { name: requestData.currentLocation }
      });

      const createdEquipments = await Promise.all(
        requestData.equipment.map(e =>
          prisma.equipment.create({
            data: {
              type: e.equipmentType,
              serialNumber: e.serialNumber,
              macAddress: e.macAddress,
              status: 'installed',
              lastService: new Date(),
              carriageId: carriage.id
            }
          })
        )
      );

      const equipmentId = createdEquipments[0]?.id;
      const countEquipment = requestData.equipment.reduce((sum, e) => sum + (e.countEquipment || 0), 0);

      if (!equipmentId) {
        console.warn(`Оборудование не создано для заявки ${applicationNumber}`);
        continue;
      }

      await prisma.request.upsert({
        where: { applicationNumber: appNumberInt },
        update: {
          applicationDate: requestData.applicationDate,
          typeWorkId: typeWork.id,
          trainId: train.id,
          carriageId: carriage.id,
          equipmentId,
          completedJobId: completedJob.id,
          currentLocationId: location.id,
          userId: requestData.userId,
          countEquipment
        },
        create: {
          applicationNumber: appNumberInt,
          applicationDate: requestData.applicationDate,
          typeWorkId: typeWork.id,
          trainId: train.id,
          carriageId: carriage.id,
          equipmentId,
          completedJobId: completedJob.id,
          currentLocationId: location.id,
          userId: requestData.userId,
          countEquipment
        }
      });
    } catch (err) {
      console.error(`Ошибка при обработке заявки ${applicationNumber}:`, err);
    }
  }

  console.log('Импорт данных из листа Journal завершен успешно');
}


// async function importWagonData(workbook: XLSX.WorkBook) {
//   console.log('Импорт данных из листа Вагоны...');
  
//   // Пробуем найти лист с вагонами (может быть "Вагоны" или "Вагоны (2)")
//   let wagonSheet = workbook.Sheets['Вагоны'] || workbook.Sheets['Вагоны (2)'];
  
//   if (!wagonSheet) {
//     console.log('Лист Вагоны не найден');
//     return;
//   }
  
//   const wagonData: any[] = XLSX.utils.sheet_to_json(wagonSheet);
//   console.log(`Найдено ${wagonData.length} записей в листе Вагоны`);
  
//   for (const row of wagonData) {
//     try {
//       // Пропускаем пустые строки
//       if (!row['Номера вагонов'] && !row['Тип']) continue;
      
//       const wagonNumber = row['Номера вагонов'] || '';
//       const wagonType = row['Тип'] || '';
      
//       // Добавляем тип вагона в справочник
//       if (wagonType) {
//         await prisma.typeWagons.upsert({
//           where: { typeWagon: wagonType },
//           update: {},
//           create: { typeWagon: wagonType }
//         });
//       }
      
//       // Добавляем номер вагона в справочник
//       if (wagonNumber) {
//         await prisma.numberWagons.upsert({
//           where: { numberWagon: wagonNumber },
//           update: {},
//           create: { numberWagon: wagonNumber }
//         });
//       }
      
//       // Создаем записи оборудования для каждого типа
//       const equipmentTypes = [
//         { type: 'Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)', status: row['Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)'] },
//         { type: 'Маршрутизатор Mikrotik Hex RB750Gr3', status: row['Маршрутизатор Mikrotik Hex RB750Gr3'] },
//         { type: 'Коммутатор, черт. ТСФВ.467000.008', status: row['Коммутатор, черт. ТСФВ.467000.008'] },
//         { type: 'Источник питания (24V, 150W)', status: row['Источник питания (24V, 150W)'] },
//         { type: 'Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)', status: row['Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)'] },
//         { type: 'Выключатель автоматический двухполюсный MD63 2P 16А C 6kA', status: row['Выключатель автоматический двухполюсный MD63 2P 16А C 6kA'] },
//         { type: 'Точка доступа ТСФВ.465000.006-005', status: row['Точка доступа ТСФВ.465000.006-005'] }
//       ];
      
//       // Получаем ID типа вагона и номера вагона
//       const typeWagon = await prisma.typeWagons.findFirst({
//         where: { typeWagon: wagonType }
//       });
      
//       const numberWagon = await prisma.numberWagons.findFirst({
//         where: { numberWagon: wagonNumber }
//       });
      
//       if (typeWagon && numberWagon) {
//         for (const equipment of equipmentTypes) {
//           if (equipment.status && equipment.status !== '') {
//             // Определяем статус оборудования
//             let status = 'not_installed'; // по умолчанию не установлено
//             if (equipment.status === 'OK') {
//               status = 'installed';
//             } else if (equipment.status === '!') {
//               status = 'not_installed';
//             }
            
//             // Создаем запись об оборудовании
//             await prisma.equipment.create({
//               data: {
//                 type: equipment.type,
//                 snNumber: null,
//                 mac: null,
//                 status: status,
//                 lastService: new Date(),
//                 typeWagonsId: typeWagon.id,
//                 numberWagonId: numberWagon.id,
//                 photo: ''
//               }
//             });
//           }
//         }
//       }
      
//     } catch (error) {
//       console.error('Ошибка при обработке строки Вагоны:', row, error);
//     }
//   }
  
//   console.log('Импорт данных из листа Вагоны завершен');
// }

// Запуск импорта, если файл запущен напрямую
if (require.main === module) {
  const excelFilePath = path.join(__dirname, '../../../Перечень работ по составам.xlsx');
  importExcelData(excelFilePath)
    .then(() => {
      console.log('Импорт завершен успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Ошибка импорта:', error);
      process.exit(1);
    });
}
