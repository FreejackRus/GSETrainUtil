import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createDefaultUser() {
  try {
    // Проверяем, есть ли уже пользователи
    const existingUser = await prisma.user.findFirst();
    
    if (!existingUser) {
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      // Создаем пользователя по умолчанию
      await prisma.user.create({
        data: {
          login: 'admin',
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('Создан пользователь по умолчанию: admin/admin');
    } else {
      console.log('Пользователи уже существуют в базе данных');
    }
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultUser();