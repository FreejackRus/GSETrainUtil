// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function checkRequestEquipment() {
//   try {
//     console.log('Проверка оборудования в заявках...\n');
//
//     // Проверяем все заявки с оборудованием
//     const requestsWithEquipment = await prisma.request.findMany({
//       include: {
//         requestEquipments: {
//           include: {
//             equipment: true
//           }
//         },
//         requestTrains: true,
//         requestCarriages: {
//           include: {
//             carriage: {
//               include: {
//                 train: true,
//               },
//             },
//           },
//         },
//         completedJob: true,
//         currentLocation: true,
//         user: true
//       }
//     });
//
//     console.log(`Всего заявок: ${requestsWithEquipment.length}`);
//
//     let requestsWithEquipmentCount = 0;
//     let totalEquipmentCount = 0;
//
//     requestsWithEquipment.forEach((request: any, index: number) => {
//       const hasEquipment = request.requestEquipment.length > 0;
//
//       if (hasEquipment) {
//         requestsWithEquipmentCount++;
//         totalEquipmentCount += request.requestEquipment.reduce((sum: number, re: any) => sum + re.quantity, 0);
//       }
//
//       console.log(`Заявка ${request.applicationNumber}: ${hasEquipment ? 'есть оборудование' : 'нет оборудования'}`);
//
//       if (hasEquipment) {
//         request.requestEquipment.forEach((re: any) => {
//           console.log(`  - ${re.equipment.type} (S/N: ${re.equipment.serialNumber || 'нет'}, MAC: ${re.equipment.macAddress || 'нет'}, Кол-во: ${re.quantity})`);
//           // console.log(`  - Фотографий: ${re.equipment.photos.length}`);
//         });
//       }
//     });
//
//     console.log(`\nИтого:`);
//     console.log(`- Заявок с оборудованием: ${requestsWithEquipmentCount}`);
//     console.log(`- Заявок без оборудования: ${requestsWithEquipment.length - requestsWithEquipmentCount}`);
//     console.log(`- Общее количество единиц оборудования: ${totalEquipmentCount}`);
//
//     // Проверяем таблицу equipment отдельно
//     const allEquipment = await prisma.equipment.findMany({
//       include: {
//         // photos: true,
//         carriage: true
//       }
//     });
//     console.log(`\nВсего записей в таблице equipment: ${allEquipment.length}`);
//
//   } catch (error) {
//     console.error('Ошибка при проверке оборудования заявок:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
//
// // Запуск проверки, если файл запущен напрямую
// if (require.main === module) {
//   checkRequestEquipment()
//     .then(() => {
//       console.log('\nПроверка завершена');
//       process.exit(0);
//     })
//     .catch((error) => {
//       console.error('Ошибка проверки:', error);
//       process.exit(1);
//     });
// }