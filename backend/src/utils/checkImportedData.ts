import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImportedData() {
  try {
    console.log('Проверка импортированных данных...\n');
    
    // Проверяем заявки
    const requests = await prisma.request.findMany({
      include: {
        typeWork: true,
        train: true,
        carriage: true,
        equipment: true,
        completedJob: true,
        currentLocation: true,
        user: true
      }
    });
    
    console.log(`Всего заявок: ${requests.length}`);
    
    if (requests.length > 0) {
      console.log('\nПример заявки:');
      const firstRequest = requests[0];
      console.log(`- Номер заявки: ${firstRequest.applicationNumber}`);
      console.log(`- Дата: ${firstRequest.applicationDate}`);
      console.log(`- Тип работ: ${firstRequest.typeWork?.name || 'не указан'}`);
      console.log(`- Номер поезда: ${firstRequest.train?.number || 'не указан'}`);
      console.log(`- Тип вагона: ${firstRequest.carriage?.type || 'не указан'}`);
      console.log(`- Номер вагона: ${firstRequest.carriage?.number || 'не указан'}`);
      console.log(`- Выполнил: ${firstRequest.completedJob?.name || 'не указан'}`);
      console.log(`- Текущее место: ${firstRequest.currentLocation?.name || 'не указан'}`);
      console.log(`- Пользователь: ${firstRequest.user?.name || 'не указан'}`);
      console.log(`- Количество оборудования: ${firstRequest.countEquipment || 0}`);
      
      if (firstRequest.equipment) {
        console.log('\nОборудование:');
        console.log(`  Тип: ${firstRequest.equipment.type}`);
        console.log(`  S/N: ${firstRequest.equipment.serialNumber || 'не указан'}`);
        console.log(`  MAC: ${firstRequest.equipment.macAddress || 'не указан'}`);
        console.log(`  Статус: ${firstRequest.equipment.status}`);
      }
    }
    
    // Проверяем оборудование
    const equipment = await prisma.equipment.findMany({
      include: {
        carriage: true,
        photos: true
      }
    });
    
    console.log(`\nВсего записей оборудования: ${equipment.length}`);
    
    if (equipment.length > 0) {
      console.log('\nПример оборудования:');
      const firstEquipment = equipment[0];
      console.log(`- Тип: ${firstEquipment.type}`);
      console.log(`- Статус: ${firstEquipment.status}`);
      console.log(`- S/N: ${firstEquipment.serialNumber || 'не указан'}`);
      console.log(`- MAC: ${firstEquipment.macAddress || 'не указан'}`);
      console.log(`- Вагон: ${firstEquipment.carriage?.number || 'не указан'}`);
      console.log(`- Фотографий: ${firstEquipment.photos.length}`);
    }
    
    // Проверяем справочники
    const typeWork = await prisma.typeWork.findMany();
    const trains = await prisma.train.findMany();
    const carriages = await prisma.carriage.findMany();
    const completedJobs = await prisma.completedJob.findMany();
    const currentLocations = await prisma.currentLocation.findMany();
    const users = await prisma.user.findMany();
    
    console.log('\nСправочники:');
    console.log(`- Типы работ: ${typeWork.length}`);
    console.log(`- Поезда: ${trains.length}`);
    console.log(`- Вагоны: ${carriages.length}`);
    console.log(`- Исполнители: ${completedJobs.length}`);
    console.log(`- Текущие места: ${currentLocations.length}`);
    console.log(`- Пользователи: ${users.length}`);
    
  } catch (error) {
    console.error('Ошибка при проверке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск проверки, если файл запущен напрямую
if (require.main === module) {
  checkImportedData()
    .then(() => {
      console.log('\nПроверка завершена');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Ошибка проверки:', error);
      process.exit(1);
    });
}