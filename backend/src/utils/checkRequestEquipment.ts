import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRequestEquipment() {
  try {
    console.log('Проверка оборудования в заявках...\n');
    
    // Проверяем все заявки с оборудованием
    const requestsWithEquipment = await prisma.request.findMany({
      include: {
        equipment: {
          include: {
            photos: true
          }
        },
        typeWork: true,
        train: true,
        carriage: true,
        completedJob: true,
        currentLocation: true,
        user: true
      }
    });
    
    console.log(`Всего заявок: ${requestsWithEquipment.length}`);
    
    let requestsWithEquipmentCount = 0;
    let totalEquipmentCount = 0;
    
    requestsWithEquipment.forEach((request, index) => {
      const hasEquipment = request.equipment !== null;
      
      if (hasEquipment) {
        requestsWithEquipmentCount++;
        totalEquipmentCount += request.countEquipment || 0;
      }
      
      console.log(`Заявка ${request.applicationNumber}: ${hasEquipment ? 'есть оборудование' : 'нет оборудования'}`);
      
      if (hasEquipment && request.equipment) {
        console.log(`  - ${request.equipment.type} (S/N: ${request.equipment.serialNumber || 'нет'}, MAC: ${request.equipment.macAddress || 'нет'}, Кол-во: ${request.countEquipment || 0})`);
        console.log(`  - Фотографий: ${request.equipment.photos.length}`);
      }
    });
    
    console.log(`\nИтого:`);
    console.log(`- Заявок с оборудованием: ${requestsWithEquipmentCount}`);
    console.log(`- Заявок без оборудования: ${requestsWithEquipment.length - requestsWithEquipmentCount}`);
    console.log(`- Общее количество единиц оборудования: ${totalEquipmentCount}`);
    
    // Проверяем таблицу equipment отдельно
    const allEquipment = await prisma.equipment.findMany({
      include: {
        photos: true,
        carriage: true
      }
    });
    console.log(`\nВсего записей в таблице equipment: ${allEquipment.length}`);
    
  } catch (error) {
    console.error('Ошибка при проверке оборудования заявок:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск проверки, если файл запущен напрямую
if (require.main === module) {
  checkRequestEquipment()
    .then(() => {
      console.log('\nПроверка завершена');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Ошибка проверки:', error);
      process.exit(1);
    });
}