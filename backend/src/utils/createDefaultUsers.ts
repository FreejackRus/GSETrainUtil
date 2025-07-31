import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createDefaultUsers() {
  try {
    // Проверяем, есть ли уже пользователи
    const existingUsers = await prisma.user.findMany();
    
    if (existingUsers.length === 0) {
      // Хешируем пароли
      const adminPassword = await bcrypt.hash('admin', 10);
      const engineerPassword = await bcrypt.hash('engineer', 10);
      
      // Создаем пользователя admin
      await prisma.user.create({
        data: {
          login: 'admin',
          password: adminPassword,
          role: 'admin',
          name: 'Administrator'
        }
      });
      
      // Создаем пользователя engineer
      await prisma.user.create({
        data: {
          login: 'engineer',
          password: engineerPassword,
          role: 'engineer',
          name: 'Engineer'
        }
      });
      
      console.log('Созданы пользователи по умолчанию:');
      console.log('- admin/admin (роль: admin)');
      console.log('- engineer/engineer (роль: engineer)');
    } else {
      console.log('Пользователи уже существуют в базе данных');
      console.log(`Найдено пользователей: ${existingUsers.length}`);
      existingUsers.forEach(user => {
        console.log(`- ${user.login} (${user.role})`);
      });
    }
  } catch (error) {
    console.error('Ошибка при создании пользователей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultUsers();