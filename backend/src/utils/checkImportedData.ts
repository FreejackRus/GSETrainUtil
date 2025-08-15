// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function checkImportedData() {
//   try {
//     console.log('Проверка импортированных данных...\n');
//
//     // 1. Проверяем заявки
//     const requests = await prisma.request.findMany({
//       include: {
//         // Список поездов в заявке
//         requestTrains: {
//           include: { train: true },
//         },
//         // Список вагонов в заявке + их фото номера
//         requestCarriages: {
//           include: {
//             carriage: {
//               include: { train: true },
//             },
//           },
//         },
//         // Оборудование в заявке + тип работ + фото в запросе + справочник устройств
//         requestEquipments: {
//           include: {
//             typeWork:  true,
//             photos:    true,
//             equipment: true,
//           },
//         },
//         completedJob:    true,
//         currentLocation: true,
//         user:            true,
//       },
//     });
//
//     console.log(`Всего заявок: ${requests.length}`);
//
//     if (requests.length > 0) {
//       const first = requests[0];
//       console.log('\nПример заявки:');
//       console.log(`- ID заявки: ${first.id}`);
//       console.log(`- Статус: ${first.status}`);
//       console.log(`- Дата создания: ${first.createdAt.toISOString()}`);
//       console.log(`- Дата обновления: ${first.updatedAt.toISOString()}`);
//
//       // Поезда
//       const trainNums = first.requestTrains.map(rt => rt.train.number);
//       console.log(`- Поезда: ${trainNums.join(', ') || 'не указаны'}`);
//
//       // Вагоны
//       if (first.requestCarriages.length > 0) {
//         first.requestCarriages.forEach((rc, i) => {
//           console.log(`  Вагон ${i + 1}: номер=${rc.carriage.number}, тип=${rc.carriage.type}, поезд=${rc.carriage.train.number}, фото=${rc.carriagePhoto || 'нет'}`);
//         });
//       } else {
//         console.log('- Вагоны: не указаны');
//       }
//
//       // Оборудование в заявке
//       console.log(`- Всего позиций оборудования: ${first.requestEquipments.length}`);
//       if (first.requestEquipments.length > 0) {
//         const re = first.requestEquipments[0];
//         console.log('  Пример позиции:');
//         console.log(`    - Equipment ID: ${re.equipmentId}`);
//         console.log(`    - Название: ${re.equipment?.name || 'не указано'}`);
//         console.log(`    - Тип устройства: ${re.equipment?.name || 'не указано'}`);
//         console.log(`    - Тип работ: ${re.typeWork?.name || 'не указан'}`);
//         console.log(`    - Фото в запросе: ${re.photos.map(p => p.photoType).join(', ') || 'нет'}`);
//       }
//
//       console.log(`- Выполнил: ${first.completedJob?.name || 'не указан'}`);
//       console.log(`- Местоположение: ${first.currentLocation?.name || 'не указано'}`);
//       console.log(`- Пользователь: ${first.user?.name || 'не указан'} (role=${first.user?.role})`);
//     }
//
//     // 2. Проверяем оборудование (вне заявок)
//     const equipment = await prisma.equipment.findMany({
//       include: {
//         carriage: { include: { train: true } },
//       },
//     });
//
//     console.log(`\nВсего записей оборудования: ${equipment.length}`);
//     if (equipment.length > 0) {
//       const eq = equipment[0];
//       console.log('\nПример оборудования:');
//       console.log(`- ID: ${eq.id}`);
//       console.log(`- Название: ${eq.name}`);
//       console.log(`- Тип устройства (device): ${eq?.name || 'не указано'}`);
//       console.log(`- S/N: ${eq.serialNumber || 'не указан'}`);
//       console.log(`- MAC: ${eq.macAddress || 'не указан'}`);
//       console.log(`- Последнее обслуживание: ${eq.lastService?.toISOString() || 'не указано'}`);
//       console.log(`- Вагоны привязан к: ${eq.carriage ? `${eq.carriage.number} (поезд ${eq.carriage.train.number})` : 'не привязан'}`);
//     }
//
//     // 3. Проверяем справочники
//     const [typeWorkList, trains, carriages, completedJobs, currentLocations, users] = await Promise.all([
//       prisma.typeWork.findMany(),
//       prisma.train.findMany(),
//       prisma.carriage.findMany(),
//       prisma.completedJob.findMany(),
//       prisma.currentLocation.findMany(),
//       prisma.user.findMany(),
//     ]);
//
//     console.log('\nСправочники:');
//     console.log(`- Типы работ: ${typeWorkList.length}`);
//     console.log(`- Поезда: ${trains.length}`);
//     console.log(`- Вагоны: ${carriages.length}`);
//     console.log(`- Выполненные работы: ${completedJobs.length}`);
//     console.log(`- Местоположения: ${currentLocations.length}`);
//     console.log(`- Пользователи: ${users.length}`);
//   } catch (error) {
//     console.error('Ошибка при проверке данных:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
//
// // Если файл запущен напрямую
// if (require.main === module) {
//   checkImportedData()
//       .then(() => {
//         console.log('\nПроверка завершена');
//         process.exit(0);
//       })
//       .catch((error) => {
//         console.error('Ошибка проверки:', error);
//         process.exit(1);
//       });
// }
