import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    // Хешируем пароль "admin"
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    // Обновляем пароль пользователя admin
    const updatedUser = await prisma.user.update({
      where: {
        login: 'admin'
      },
      data: {
        password: hashedPassword
      }
    });
    
    console.log('Пароль пользователя admin успешно обновлен и хеширован');
    console.log(`Теперь можно войти с логином: admin, пароль: admin`);
  } catch (error) {
    console.error('Ошибка при обновлении пароля:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();