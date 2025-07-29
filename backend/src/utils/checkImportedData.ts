import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImportedData() {
  try {
    console.log('Проверка импортированных данных...\n');
    
    // Проверяем заявки
    const requests = await prisma.requests.findMany({
      include: {
        requestEquipment: true
      }
    });
    
    console.log(`Всего заявок: ${requests.length}`);
    
    if (requests.length > 0) {
      console.log('\nПример заявки:');
      const firstRequest = requests[0];
      console.log(`- Номер заявки: ${firstRequest.applicationNumber}`);
      console.log(`- Дата: ${firstRequest.applicationDate}`);
      console.log(`- Тип работ: ${firstRequest.typeWork}`);
      console.log(`- Номер поезда: ${firstRequest.trainNumber}`);
      console.log(`- Тип вагона: ${firstRequest.carriageType}`);
      console.log(`- Номер вагона: ${firstRequest.carriageNumber}`);
      console.log(`- Выполнил: ${firstRequest.completedJob}`);
      console.log(`- Текущее место: ${firstRequest.currentLocation}`);
      console.log(`- Количество оборудования: ${firstRequest.requestEquipment.length}`);
      
      if (firstRequest.requestEquipment.length > 0) {
        console.log('\nОборудование:');
        firstRequest.requestEquipment.forEach((eq, index) => {
          console.log(`  ${index + 1}. ${eq.equipmentType}`);
          console.log(`     S/N: ${eq.serialNumber || 'не указан'}`);
          console.log(`     MAC: ${eq.macAddress || 'не указан'}`);
          console.log(`     Количество: ${eq.countEquipment}`);
        });
      }
    }
    
    // Проверяем оборудование вагонов
    const equipment = await prisma.equipment.findMany({
      include: {
        connectionTypeWagons: true,
        connectionNumberWagon: true
      }
    });
    
    console.log(`\nВсего записей оборудования вагонов: ${equipment.length}`);
    
    if (equipment.length > 0) {
      console.log('\nПример оборудования вагона:');
      const firstEquipment = equipment[0];
      console.log(`- Тип: ${firstEquipment.type}`);
      console.log(`- Статус: ${firstEquipment.status}`);
      console.log(`- Тип вагона: ${firstEquipment.connectionTypeWagons.typeWagon}`);
      console.log(`- Номер вагона: ${firstEquipment.connectionNumberWagon.numberWagon}`);
    }
    
    // Проверяем справочники
    const typeWork = await prisma.typeWork.findMany();
    const trainNumbers = await prisma.trainNumber.findMany();
    const completedJobs = await prisma.completedJob.findMany();
    const currentLocations = await prisma.currentLocation.findMany();
    const typeWagons = await prisma.typeWagons.findMany();
    const numberWagons = await prisma.numberWagons.findMany();
    
    console.log('\nСправочники:');
    console.log(`- Типы работ: ${typeWork.length}`);
    console.log(`- Номера поездов: ${trainNumbers.length}`);
    console.log(`- Исполнители: ${completedJobs.length}`);
    console.log(`- Текущие места: ${currentLocations.length}`);
    console.log(`- Типы вагонов: ${typeWagons.length}`);
    console.log(`- Номера вагонов: ${numberWagons.length}`);
    
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