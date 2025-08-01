const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestData() {
  try {
    console.log('🔧 Добавляю тестовые данные...');

    // Добавляем вагон с номером 123123
    const existingCarriage = await prisma.carriage.findFirst({
      where: { number: '123123' }
    });

    if (!existingCarriage) {
      // Находим поезд 001
      const train001 = await prisma.train.findFirst({
        where: { number: '001' }
      });

      if (train001) {
        await prisma.carriage.create({
          data: {
            number: '123123',
            type: 'Грузовой',
            trainId: train001.id
          }
        });
        console.log('✅ Добавлен вагон 123123');
      }
    } else {
      console.log('ℹ️ Вагон 123123 уже существует');
    }

    // Добавляем вагон с номером 213123
    const existingCarriage2 = await prisma.carriage.findFirst({
      where: { number: '213123' }
    });

    if (!existingCarriage2) {
      // Находим поезд 001
      const train001 = await prisma.train.findFirst({
        where: { number: '001' }
      });

      if (train001) {
        await prisma.carriage.create({
          data: {
            number: '213123',
            type: 'Пассажирский',
            trainId: train001.id
          }
        });
        console.log('✅ Добавлен вагон 213123');
      }
    } else {
      console.log('ℹ️ Вагон 213123 уже существует');
    }

    // Добавляем вагон с номером 12121212
    const existingCarriage3 = await prisma.carriage.findFirst({
      where: { number: '12121212' }
    });

    if (!existingCarriage3) {
      // Находим поезд 002
      const train002 = await prisma.train.findFirst({
        where: { number: '002' }
      });

      if (train002) {
        await prisma.carriage.create({
          data: {
            number: '12121212',
            type: 'Багажный',
            trainId: train002.id
          }
        });
        console.log('✅ Добавлен вагон 12121212');
      }
    } else {
      console.log('ℹ️ Вагон 12121212 уже существует');
    }

    // Проверяем справочники
    const typeWorks = await prisma.typeWork.findMany();
    const trains = await prisma.train.findMany();
    const carriages = await prisma.carriage.findMany();
    const completedJobs = await prisma.completedJob.findMany();
    const locations = await prisma.currentLocation.findMany();

    console.log('\n📊 Справочники:');
    console.log('Типы работ:', typeWorks.map(t => t.name));
    console.log('Поезда:', trains.map(t => t.number));
    console.log('Вагоны:', carriages.map(c => `${c.number} (${c.type})`));
    console.log('Выполненные работы:', completedJobs.map(j => j.name));
    console.log('Местоположения:', locations.map(l => l.name));

    console.log('\n✅ Тестовые данные добавлены успешно!');
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestData();