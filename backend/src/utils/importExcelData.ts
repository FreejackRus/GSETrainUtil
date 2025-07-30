// import * as XLSX from 'xlsx';
// import { PrismaClient } from '@prisma/client';
// import path from 'path';

// const prisma = new PrismaClient();

// interface JournalEntry {
//   dateCompleted: string;
//   applicationNumber: string;
//   workType: string;
//   trainNumber: string;
//   carriageType: string;
//   carriageNumber: string;
//   equipment: string;
//   serialNumber: string;
//   macAddress: string;
//   quantity: string;
//   completedBy: string;
//   currentLocation: string;
// }

// interface WagonEntry {
//   wagonNumber: string;
//   type: string;
//   [key: string]: string; // для различного оборудования
// }

// interface EquipmentItem {
//   equipmentType: string;
//   serialNumber: string | null;
//   macAddress: string | null;
//   countEquipment: number;
// }

// interface RequestData {
//   applicationNumber: string;
//   applicationDate: Date;
//   typeWork: string;
//   trainNumber: string;
//   carriageType: string;
//   carriageNumber: string;
//   completedJob: string;
//   currentLocation: string;
//   userId: number;
//   userName: string;
//   userRole: string;
//   equipment: EquipmentItem[];
// }

// export async function importExcelData(filePath: string) {
//   try {
//     console.log('Начинаю импорт данных из Excel файла...');
    
//     // Читаем Excel файл
//     const workbook = XLSX.readFile(filePath);
    
//     // Импортируем данные из листа Journal
//     await importJournalData(workbook);
    
//     // Импортируем данные из листа Вагоны
//     await importWagonData(workbook);
    
//     console.log('Импорт данных завершен успешно!');
//   } catch (error) {
//     console.error('Ошибка при импорте данных:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// async function importJournalData(workbook: XLSX.WorkBook) {
//   console.log('Импорт данных из листа Journal...');
  
//   const journalSheet = workbook.Sheets['Journal'];
//   if (!journalSheet) {
//     console.log('Лист Journal не найден');
//     return;
//   }
  
//   const journalData: any[] = XLSX.utils.sheet_to_json(journalSheet);
//   console.log(`Найдено ${journalData.length} записей в листе Journal`);
  
//   // Группируем данные по номеру заявки
//   const requestsMap = new Map<string, RequestData>();
  
//   for (const row of journalData) {
//     // Пропускаем пустые строки
//       if (!row['Заявка']) continue;
      
//       const applicationNumber = String(row['Заявка']);
    
//     // Если заявка уже есть в карте, добавляем к ней оборудование
//     if (requestsMap.has(applicationNumber)) {
//       // Добавляем оборудование к существующей заявке
//       if (row['Оборудование']) {
//         const existingRequest = requestsMap.get(applicationNumber);
//         if (existingRequest) {
//           existingRequest.equipment.push({
//             equipmentType: row['Оборудование'],
//             serialNumber: row['S/N оборудования'] ? String(row['S/N оборудования']) : null,
//             macAddress: row['MAC адрес'] || null,
//             countEquipment: row['Кол-во'] ? parseInt(String(row['Кол-во'])) : 1
//           });
//         }
//       }
//     } else {
//       // Создаем новую заявку
//       // Проверяем наличие обязательных полей
//       if (!row['Тип работ'] || !row['Номер поезда'] || !row['Тип вагона'] || 
//           !row['Номер вагона'] || !row['Работы выполнил'] || !row['Тек.место']) {
//         console.log('Пропускаем строку с незаполненными обязательными полями:', row);
//         continue;
//       }
      
//       // Парсим дату заявки
//       let applicationDate: Date;
//       if (row['Дата выполнения работ']) {
//         // Если это Excel дата (число)
//         if (typeof row['Дата выполнения работ'] === 'number') {
//           const excelDate = XLSX.SSF.parse_date_code(row['Дата выполнения работ']);
//           applicationDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
//         } else {
//           // Если это строка
//           const parsedDate = new Date(row['Дата выполнения работ']);
//           if (isNaN(parsedDate.getTime())) {
//             console.log('Некорректная дата:', row['Дата выполнения работ'], 'в строке:', row);
//             applicationDate = new Date(); // Используем текущую дату как fallback
//           } else {
//             applicationDate = parsedDate;
//           }
//         }
//       } else {
//         applicationDate = new Date(); // Используем текущую дату если дата не указана
//       }

//       const requestData: RequestData = {
//         applicationNumber,
//         applicationDate,
//         typeWork: row['Тип работ'],
//         trainNumber: row['Номер поезда'],
//         carriageType: row['Тип вагона'],
//         carriageNumber: row['Номер вагона'],
//         completedJob: row['Работы выполнил'],
//         currentLocation: row['Тек.место'],
//         userId: 1,
//         userName: 'System',
//         userRole: 'admin',
//         equipment: []
//       };

//       // Добавляем оборудование
//       if (row['Оборудование']) {
//         requestData.equipment.push({
//           equipmentType: row['Оборудование'],
//           serialNumber: row['S/N оборудования'] ? String(row['S/N оборудования']) : null,
//           macAddress: row['MAC адрес'] || null,
//           countEquipment: row['Кол-во'] ? parseInt(String(row['Кол-во'])) : 1
//         });
//       }

//       requestsMap.set(applicationNumber, requestData);
//     }
//   }
  
//   console.log(`Обработано ${requestsMap.size} уникальных заявок`);
  
//   // Создаем справочники
//     for (const [applicationNumber, requestData] of requestsMap) {
//       // Создаем записи в справочниках только если значения не пустые
//       if (requestData.typeWork) {
//         await prisma.typeWork.upsert({
//           where: { typeWork: requestData.typeWork },
//           update: {},
//           create: { typeWork: requestData.typeWork }
//         });
//       }
      
//       if (requestData.trainNumber) {
//         await prisma.trainNumber.upsert({
//           where: { trainNumber: requestData.trainNumber },
//           update: {},
//           create: { trainNumber: requestData.trainNumber }
//         });
//       }
      
//       if (requestData.completedJob) {
//         await prisma.completedJob.upsert({
//           where: { completedJob: requestData.completedJob },
//           update: {},
//           create: { completedJob: requestData.completedJob }
//         });
//       }
      
//       if (requestData.currentLocation) {
//         await prisma.currentLocation.upsert({
//           where: { currentLocation: requestData.currentLocation },
//           update: {},
//           create: { currentLocation: requestData.currentLocation }
//         });
//       }
//     }
  
//   // Создаем заявки с оборудованием
//   for (const [applicationNumber, requestData] of requestsMap) {
//     // Проверяем, что у нас есть обязательные данные
//     if (!applicationNumber || !requestData.applicationDate || isNaN(requestData.applicationDate.getTime())) {
//       console.log('Пропускаем заявку с некорректными данными:', applicationNumber, requestData);
//       continue;
//     }
    
//     // Проверяем, что все обязательные поля заполнены
//     if (!requestData.typeWork || !requestData.trainNumber || !requestData.carriageType || 
//         !requestData.carriageNumber || !requestData.completedJob || !requestData.currentLocation) {
//       console.log('Пропускаем заявку с незаполненными обязательными полями:', applicationNumber);
//       continue;
//     }
    
//     // Преобразуем applicationNumber в число
//     const appNumberInt = parseInt(applicationNumber);
//     if (isNaN(appNumberInt)) {
//       console.log('Пропускаем заявку с некорректным номером:', applicationNumber);
//       continue;
//     }
    
//     const request = await prisma.requests.upsert({
//       where: { applicationNumber: appNumberInt },
//       update: {
//         applicationDate: requestData.applicationDate,
//         typeWork: requestData.typeWork,
//         trainNumber: requestData.trainNumber,
//         carriageType: requestData.carriageType,
//         carriageNumber: requestData.carriageNumber,
//         completedJob: requestData.completedJob,
//         currentLocation: requestData.currentLocation,
//         userId: requestData.userId,
//         userName: requestData.userName,
//         userRole: requestData.userRole
//       },
//       create: {
//         applicationNumber: appNumberInt,
//         applicationDate: requestData.applicationDate,
//         typeWork: requestData.typeWork,
//         trainNumber: requestData.trainNumber,
//         carriageType: requestData.carriageType,
//         carriageNumber: requestData.carriageNumber,
//         completedJob: requestData.completedJob,
//         currentLocation: requestData.currentLocation,
//         userId: requestData.userId,
//         userName: requestData.userName,
//         userRole: requestData.userRole
//       }
//     });
    
//     // Удаляем старые записи оборудования для этой заявки
//     await prisma.requestEquipment.deleteMany({
//       where: { requestId: request.id }
//     });
    
//     // Создаем новые записи оборудования
//     for (const equipment of requestData.equipment) {
//       await prisma.requestEquipment.create({
//         data: {
//           requestId: request.id,
//           equipmentType: equipment.equipmentType,
//           serialNumber: equipment.serialNumber,
//           macAddress: equipment.macAddress,
//           countEquipment: equipment.countEquipment
//         }
//       });
//     }
//   }
  
//   console.log('Импорт данных из листа Journal завершен успешно');
// }

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

// // Запуск импорта, если файл запущен напрямую
// if (require.main === module) {
//   const excelFilePath = path.join(__dirname, '../../../Перечень работ по составам.xlsx');
//   importExcelData(excelFilePath)
//     .then(() => {
//       console.log('Импорт завершен успешно');
//       process.exit(0);
//     })
//     .catch((error) => {
//       console.error('Ошибка импорта:', error);
//       process.exit(1);
//     });
// }
import * as XLSX from 'xlsx';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EquipmentItem {
  equipmentType: string;
  serialNumber: string | null;
  macAddress: string | null;
  countEquipment: number;
}

interface RequestData {
  applicationNumber: number;
  applicationDate: Date;
  typeWorkId: number;
  trainId: number;
  carriageId: number;
  equipment: EquipmentItem[];
  completedJobId: number;
  currentLocationId: number;
  userId: number;
}

async function importExcelData(filePath: string) {
  try {
    console.log('Начинаю импорт данных из Excel файла...');

    const workbook = XLSX.readFile(filePath);

    await importJournalData(workbook);
    await importWagonData(workbook);

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

  const requestsMap = new Map<number, RequestData>();

  for (const row of journalData) {
    if (!row['Заявка']) continue;

    const applicationNumber = parseInt(row['Заявка']);

    if (requestsMap.has(applicationNumber)) {
      const existingRequest = requestsMap.get(applicationNumber);
      if (existingRequest && row['Оборудование']) {
        existingRequest.equipment.push({
          equipmentType: row['Оборудование'],
          serialNumber: row['S/N оборудования'] ? String(row['S/N оборудования']) : null,
          macAddress: row['MAC адрес'] || null,
          countEquipment: row['Кол-во'] ? parseInt(String(row['Кол-во'])) : 1
        });
      }
    } else {
      if (!row['Тип работ'] || !row['Номер поезда'] || !row['Тип вагона'] || !row['Номер вагона'] || !row['Работы выполнил'] || !row['Тек.место']) {
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
          if (isNaN(parsedDate.getTime())) {
            console.log('Некорректная дата:', row['Дата выполнения работ'], 'в строке:', row);
            applicationDate = new Date();
          } else {
            applicationDate = parsedDate;
          }
        }
      } else {
        applicationDate = new Date();
      }

      const typeWork = await prisma.typeWork.upsert({
        where: { name: row['Тип работ'] },
        update: {},
        create: { name: row['Тип работ'] }
      });

      const train = await prisma.trainNumber.upsert({

      });

      const carriage = await prisma.carriage.upsert({
        where: { number: row['Номер вагона'] },
        update: {},
        create: {
          number: row['Номер вагона'],
          type: row['Тип вагона'],
          trainId: train.id
        }
      });

      const completedJob = await prisma.completedJob.upsert({
        where: { name: row['Работы выполнил'] },
        update: {},
        create: { name: row['Работы выполнил'] }
      });

      const currentLocation = await prisma.currentLocation.upsert({
        where: { name: row['Тек.место'] },
        update: {},
        create: { name: row['Тек.место'] }
      });

      const requestData: RequestData = {
        applicationNumber,
        applicationDate,
        typeWorkId: typeWork.id,
        trainId: train.id,
        carriageId: carriage.id,
        completedJobId: completedJob.id,
        currentLocationId: currentLocation.id,
        userId: 1,
        equipment: []
      };

      if (row['Оборудование']) {
        requestData.equipment.push({
          equipmentType: row['Оборудование'],
          serialNumber: row['S/N оборудования'] ? String(row['S/N оборудования']) : null,
          macAddress: row['MAC адрес'] || null,
          countEquipment: row['Кол-во'] ? parseInt(String(row['Кол-во'])) : 1
        });
      }

      requestsMap.set(applicationNumber, requestData);
    }
  }

  console.log(`Обработано ${requestsMap.size} уникальных заявок`);

  for (const requestData of requestsMap.values()) {
    const request = await prisma.request.upsert({
      where: { applicationNumber: requestData.applicationNumber },
      update: {
        applicationDate: requestData.applicationDate,
        typeWorkId: requestData.typeWorkId,
        trainId: requestData.trainId,
        carriageId: requestData.carriageId,
        completedJobId: requestData.completedJobId,
        currentLocationId: requestData.currentLocationId,
        userId: requestData.userId,
        countEquipment: requestData.equipment.reduce((sum, eq) => sum + eq.countEquipment, 0)
      },
      create: {
        applicationNumber: requestData.applicationNumber,
        applicationDate: requestData.applicationDate,
        typeWorkId: requestData.typeWorkId,
        trainId: requestData.trainId,
        carriageId: requestData.carriageId,
        completedJobId: requestData.completedJobId,
        currentLocationId: requestData.currentLocationId,
        userId: requestData.userId,
        countEquipment: requestData.equipment.reduce((sum, eq) => sum + eq.countEquipment, 0)
      }
    });

    await prisma.equipment.deleteMany({
      where: { requestId: request.id }
    });

    for (const equipment of requestData.equipment) {
      await prisma.equipment.create({
        data: {
          requestId: request.id,
          type: equipment.equipmentType,
          serialNumber: equipment.serialNumber,
          macAddress: equipment.macAddress,
          carriageId: requestData.carriageId,
          status: 'installed',
          lastService: new Date()
        }
      });
    }
  }

  console.log('Импорт данных из листа Journal завершен успешно');
}

async function importWagonData(workbook: XLSX.WorkBook) {
  console.log('Импорт данных из листа Вагоны...');

  let wagonSheet = workbook.Sheets['Вагоны'] || workbook.Sheets['Вагоны (2)'];
  if (!wagonSheet) {
    console.log('Лист Вагоны не найден');
    return;
  }

  const wagonData: any[] = XLSX.utils.sheet_to_json(wagonSheet);
  console.log(`Найдено ${wagonData.length} записей в листе Вагоны`);

  for (const row of wagonData) {
    try {
      if (!row['Номера вагонов'] && !row['Тип']) continue;

      const wagonNumber = row['Номера вагонов'] || '';
      const wagonType = row['Тип'] || '';

      const trainNumber = row['Номер поезда'] || 'Unknown';
      const train = await prisma.train.upsert({
        where: { number: trainNumber },
        update: {},
        create: { number: trainNumber }
      });

      const carriage = await prisma.carriage.upsert({
        where: { number: wagonNumber },
        update: { trainId: train.id },
        create: {
          number: wagonNumber,
          type: wagonType,
          trainId: train.id
        }
      });

      const equipmentTypes = [
        { type: 'Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)', status: row['Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)'] },
        { type: 'Маршрутизатор Mikrotik Hex RB750Gr3', status: row['Маршрутизатор Mikrotik Hex RB750Gr3'] },
        { type: 'Коммутатор, черт. ТСФВ.467000.008', status: row['Коммутатор, черт. ТСФВ.467000.008'] },
        { type: 'Источник питания (24V, 150W)', status: row['Источник питания (24V, 150W)'] },
        { type: 'Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)', status: row['Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)'] },
        { type: 'Выключатель автоматический двухполюсный MD63 2P 16А C 6kA', status: row['Выключатель автоматический двухполюсный MD63 2P 16А C 6kA'] },
        { type: 'Точка доступа ТСФВ.465000.006-005', status: row['Точка доступа ТСФВ.465000.006-005'] }
      ];

      for (const equipment of equipmentTypes) {
        if (equipment.status && equipment.status !== '') {
          const status = equipment.status === 'OK' ? 'installed' : 'not_installed';

          await prisma.equipment.create({
            data: {
              type: equipment.type,
              serialNumber: null,
              macAddress: null,
              status: status,
              lastService: new Date(),
              carriageId: carriage.id
            }
          });
        }
      }
    } catch (error) {
      console.error('Ошибка при обработке строки Вагоны:', row, error);
    }
  }

  console.log('Импорт данных из листа Вагоны завершен');
}

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
