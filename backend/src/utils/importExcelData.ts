// import * as XLSX from 'xlsx';
// import * as path from 'path';
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt';
//
// const prisma = new PrismaClient();
//
// interface RequestData {
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
//   equipment: {
//     equipmentType: string;
//     serialNumber: string;
//     macAddress: string;
//     countEquipment: number;
//   }[];
// }
//
// export async function importExcelData(filePath: string) {
//   console.log('Начинаем импорт данных из Excel файла:', filePath);
//
//   try {
//     const workbook = XLSX.readFile(filePath);
//
//     // Импортируем данные из разных листов
//     await importJournalData(workbook);
//     await importWagonData(workbook);
//
//     console.log('Импорт данных завершен успешно');
//   } catch (error) {
//     console.error('Ошибка при импорте данных:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }
//
// async function importJournalData(workbook: XLSX.WorkBook) {
//   console.log('Импорт данных из листа Journal...');
//
//   const journalSheet = workbook.Sheets['Journal'];
//   if (!journalSheet) {
//     console.log('Лист Journal не найден');
//     return;
//   }
//
//   const journalData: any[] = XLSX.utils.sheet_to_json(journalSheet);
//   console.log(`Найдено ${journalData.length} записей в листе Journal`);
//
//   // Группируем данные по номеру заявки
//   const requestsMap = new Map<string, RequestData>();
//
//   for (const row of journalData) {
//     try {
//       // Пропускаем пустые строки
//       if (!row['№ заявки'] && !row['Дата заявки']) continue;
//
//       const applicationNumber = row['№ заявки']?.toString() || '';
//       const applicationDateStr = row['Дата заявки'];
//
//       if (!applicationNumber) continue;
//
//       // Парсим дату
//       let applicationDate: Date;
//       if (typeof applicationDateStr === 'number') {
//         // Excel дата как число
//         applicationDate = new Date((applicationDateStr - 25569) * 86400 * 1000);
//       } else if (typeof applicationDateStr === 'string') {
//         applicationDate = new Date(applicationDateStr);
//       } else {
//         applicationDate = new Date();
//       }
//
//       // Если заявка уже есть в карте, добавляем оборудование
//       if (requestsMap.has(applicationNumber)) {
//         const existingRequest = requestsMap.get(applicationNumber)!;
//
//         // Добавляем оборудование, если оно есть
//         if (row['Тип оборудования']) {
//           existingRequest.equipment.push({
//             equipmentType: row['Тип оборудования'] || '',
//             serialNumber: row['Серийный номер'] || '',
//             macAddress: row['MAC адрес'] || '',
//             countEquipment: parseInt(row['Количество']) || 1
//           });
//         }
//       } else {
//         // Создаем новую заявку
//         const requestData: RequestData = {
//           applicationDate: applicationDate,
//           typeWork: row['Вид работ'] || '',
//           trainNumber: row['№ поезда'] || '',
//           carriageType: row['Тип вагона'] || '',
//           carriageNumber: row['№ вагона'] || '',
//           completedJob: row['Выполненная работа'] || '',
//           currentLocation: row['Текущее местоположение'] || '',
//           userId: 1, // По умолчанию admin
//           userName: row['Исполнитель'] || 'Администратор',
//           userRole: 'admin',
//           equipment: []
//         };
//
//         // Добавляем оборудование, если оно есть
//         if (row['Тип оборудования']) {
//           requestData.equipment.push({
//             equipmentType: row['Тип оборудования'] || '',
//             serialNumber: row['Серийный номер'] || '',
//             macAddress: row['MAC адрес'] || '',
//             countEquipment: parseInt(row['Количество']) || 1
//           });
//         }
//
//         requestsMap.set(applicationNumber, requestData);
//       }
//     } catch (error) {
//       console.error('Ошибка при обработке строки Journal:', row, error);
//     }
//   }
//
//   console.log(`Обработано ${requestsMap.size} уникальных заявок`);
//
//   // Создаем справочные данные
//   for (const [applicationNumber, requestData] of requestsMap) {
//     // Создаем типы работ
//     if (requestData.typeWork) {
//       await prisma.typeWork.upsert({
//         where: { name: requestData.typeWork },
//         update: {},
//         create: { name: requestData.typeWork }
//       });
//     }
//
//     // Создаем поезда
//     if (requestData.trainNumber) {
//       await prisma.train.upsert({
//         where: { number: requestData.trainNumber },
//         update: {},
//         create: { number: requestData.trainNumber }
//       });
//     }
//
//     // Создаем вагоны
//     if (requestData.carriageType && requestData.carriageNumber && requestData.trainNumber) {
//       const train = await prisma.train.findFirst({
//         where: { number: requestData.trainNumber }
//       });
//
//       if (train) {
//         await prisma.carriage.upsert({
//           where: {
//             number_trainId: {
//               number: requestData.carriageNumber,
//               trainId: train.id
//             }
//           },
//           update: {},
//           create: {
//             number: requestData.carriageNumber,
//             type: requestData.carriageType,
//             trainId: train.id
//           }
//         });
//       }
//     }
//
//     // Создаем выполненные работы
//     if (requestData.completedJob) {
//       await prisma.completedJob.upsert({
//         where: { name: requestData.completedJob },
//         update: {},
//         create: { name: requestData.completedJob }
//       });
//     }
//
//     // Создаем текущие местоположения
//     if (requestData.currentLocation) {
//       await prisma.currentLocation.upsert({
//         where: { name: requestData.currentLocation },
//         update: {},
//         create: { name: requestData.currentLocation }
//       });
//     }
//   }
//
//   // Создаем заявки с оборудованием
//   for (const [applicationNumber, requestData] of requestsMap) {
//     // Проверяем, что у нас есть обязательные данные
//     if (!applicationNumber || !requestData.applicationDate || isNaN(requestData.applicationDate.getTime())) {
//       console.log('Пропускаем заявку с некорректными данными:', applicationNumber, requestData);
//       continue;
//     }
//
//     // Проверяем, что все обязательные поля заполнены
//     if (!requestData.typeWork || !requestData.trainNumber || !requestData.carriageType ||
//         !requestData.carriageNumber || !requestData.completedJob || !requestData.currentLocation) {
//       console.log('Пропускаем заявку с незаполненными обязательными полями:', applicationNumber);
//       continue;
//     }
//
//     // Преобразуем applicationNumber в число
//     const appNumberInt = parseInt(applicationNumber);
//     if (isNaN(appNumberInt)) {
//       console.log('Пропускаем заявку с некорректным номером:', applicationNumber);
//       continue;
//     }
//
//     // Получаем ID связанных сущностей
//     const typeWork = await prisma.typeWork.findFirst({
//       where: { name: requestData.typeWork }
//     });
//
//     const train = await prisma.train.findFirst({
//       where: { number: requestData.trainNumber }
//     });
//
//     const carriage = await prisma.carriage.findFirst({
//       where: {
//         number: requestData.carriageNumber,
//         trainId: train?.id
//       }
//     });
//
//     const completedJob = await prisma.completedJob.findFirst({
//       where: { name: requestData.completedJob }
//     });
//
//     const currentLocation = await prisma.currentLocation.findFirst({
//       where: { name: requestData.currentLocation }
//     });
//
//     if (!typeWork || !train || !carriage || !completedJob || !currentLocation) {
//       console.log('Пропускаем заявку из-за отсутствия связанных данных:', applicationNumber);
//       continue;
//     }
//
//     // Создаем оборудование для первого элемента (если есть)
//     let equipmentId = null;
//     if (requestData.equipment.length > 0) {
//       const firstEquipment = requestData.equipment[0];
//
//       const equipment = await prisma.equipment.create({
//         data: {
//           type: firstEquipment.equipmentType,
//           serialNumber: firstEquipment.serialNumber || null,
//           macAddress: firstEquipment.macAddress || null,
//           status: 'installed',
//           lastService: new Date(),
//           carriageId: carriage.id
//         }
//       });
//
//       equipmentId = equipment.id;
//     }
//
//     // Создаем заявку
//     const request = await prisma.request.upsert({
//       where: { applicationNumber: appNumberInt },
//       update: {
//         applicationDate: requestData.applicationDate,
//         typeWorkId: typeWork.id,
//         trainId: train.id,
//         completedJobId: completedJob.id,
//         currentLocationId: currentLocation.id,
//         userId: requestData.userId
//       },
//       create: {
//         applicationNumber: appNumberInt,
//         applicationDate: requestData.applicationDate,
//         typeWorkId: typeWork.id,
//         trainId: train.id,
//         completedJobId: completedJob.id,
//         currentLocationId: currentLocation.id,
//         userId: requestData.userId
//       }
//     });
//
//     // Создаем связь с вагоном
//     await prisma.requestCarriage.upsert({
//       where: {
//         requestId_carriageId: {
//           requestId: request.id,
//           carriageId: carriage.id
//         }
//       },
//       update: {},
//       create: {
//         requestId: request.id,
//         carriageId: carriage.id
//       }
//     });
//
//     // Создаем связь с оборудованием (если есть)
//     if (equipmentId) {
//       await prisma.requestEquipment.upsert({
//         where: {
//           requestId_equipmentId: {
//             requestId: request.id,
//             equipmentId: equipmentId
//           }
//         },
//         update: {
//           quantity: requestData.equipment.length > 0 ? requestData.equipment[0].countEquipment || 1 : 1
//         },
//         create: {
//           requestId: request.id,
//           equipmentId: equipmentId,
//           quantity: requestData.equipment.length > 0 ? requestData.equipment[0].countEquipment || 1 : 1
//         }
//       });
//     }
//   }
//
//   console.log('Импорт данных из листа Journal завершен успешно');
// }
//
// async function importWagonData(workbook: XLSX.WorkBook) {
//   console.log('Импорт данных из листа Вагоны...');
//
//   // Пробуем найти лист с вагонами (может быть "Вагоны" или "Вагоны (2)")
//   let wagonSheet = workbook.Sheets['Вагоны'] || workbook.Sheets['Вагоны (2)'];
//
//   if (!wagonSheet) {
//     console.log('Лист Вагоны не найден');
//     return;
//   }
//
//   const wagonData: any[] = XLSX.utils.sheet_to_json(wagonSheet);
//   console.log(`Найдено ${wagonData.length} записей в листе Вагоны`);
//
//   for (const row of wagonData) {
//     try {
//       // Пропускаем пустые строки
//       if (!row['Номера вагонов'] && !row['Тип']) continue;
//
//       const wagonNumber = row['Номера вагонов'] || '';
//       const wagonType = row['Тип'] || '';
//
//       if (!wagonNumber || !wagonType) continue;
//
//       // Создаем поезд по умолчанию, если его нет
//       const defaultTrain = await prisma.train.upsert({
//         where: { number: 'Поезд-1' },
//         update: {},
//         create: { number: 'Поезд-1' }
//       });
//
//       // Создаем вагон
//       const carriage = await prisma.carriage.upsert({
//         where: {
//           number_trainId: {
//             number: wagonNumber,
//             trainId: defaultTrain.id
//           }
//         },
//         update: { type: wagonType },
//         create: {
//           number: wagonNumber,
//           type: wagonType,
//           trainId: defaultTrain.id
//         }
//       });
//
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
//
//       for (const equipment of equipmentTypes) {
//         if (equipment.status && equipment.status !== '') {
//           // Определяем статус оборудования
//           let status = 'not_installed'; // по умолчанию не установлено
//           if (equipment.status === 'OK') {
//             status = 'installed';
//           } else if (equipment.status === '!') {
//             status = 'not_installed';
//           }
//
//           // Создаем запись об оборудовании
//           await prisma.equipment.create({
//             data: {
//               type: equipment.type,
//               serialNumber: null,
//               macAddress: null,
//               status: status,
//               lastService: new Date(),
//               carriageId: carriage.id
//             }
//           });
//         }
//       }
//
//     } catch (error) {
//       console.error('Ошибка при обработке строки Вагоны:', row, error);
//     }
//   }
//
//   console.log('Импорт данных из листа Вагоны завершен');
// }
//
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