const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Пользователи в базе данных:', users);
    
    if (users.length === 0) {
      console.log('Создаю тестового пользователя...');
      const testUser = await prisma.user.create({
        data: {
          login: 'test',
          password: 'test',
          role: 'engineer',
          name: 'Тестовый пользователь'
        }
      });
      console.log('Создан пользователь:', testUser);
    }
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();