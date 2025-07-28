import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRequestEquipment() {
  try {
    console.log('Проверка оборудования в заявках...\n');
    
    // Проверяем все заявки с оборудованием
    const requestsWithEquipment = await prisma.requests.findMany({
      include: {
        requestEquipment: true
      }
    });
    
    console.log(`Всего заявок: ${requestsWithEquipment.length}`);
    
    let requestsWithEquipmentCount = 0;
    let totalEquipmentCount = 0;
    
    requestsWithEquipment.forEach((request, index) => {
      const equipmentCount = request.requestEquipment.length;
      totalEquipmentCount += equipmentCount;
      
      if (equipmentCount > 0) {
        requestsWithEquipmentCount++;
      }
      
      console.log(`Заявка ${request.applicationNumber}: ${equipmentCount} единиц оборудования`);
      
      if (equipmentCount > 0) {
        request.requestEquipment.forEach((eq, eqIndex) => {
          console.log(`  - ${eq.equipmentType} (S/N: ${eq.serialNumber || 'нет'}, MAC: ${eq.macAddress || 'нет'}, Кол-во: ${eq.countEquipment})`);
        });
      }
    });
    
    console.log(`\nИтого:`);
    console.log(`- Заявок с оборудованием: ${requestsWithEquipmentCount}`);
    console.log(`- Заявок без оборудования: ${requestsWithEquipment.length - requestsWithEquipmentCount}`);
    console.log(`- Общее количество единиц оборудования: ${totalEquipmentCount}`);
    
    // Проверяем таблицу requestEquipment отдельно
    const allRequestEquipment = await prisma.requestEquipment.findMany();
    console.log(`\nВсего записей в таблице requestEquipment: ${allRequestEquipment.length}`);
    
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