// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function checkUsers() {
//   try {
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         login: true,
//         role: true,
//         password: true
//       }
//     });
//
//     console.log('Пользователи в базе данных:');
//     users.forEach(user => {
//       console.log(`ID: ${user.id}, Login: ${user.login}, Role: ${user.role}, Password hash: ${user.password.substring(0, 20)}...`);
//     });
//
//     if (users.length === 0) {
//       console.log('Пользователи не найдены');
//     }
//   } catch (error) {
//     console.error('Ошибка при получении пользователей:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
//
// checkUsers();