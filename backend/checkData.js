const { PrismaClient } = require('@prisma/client');

async function checkData() {
  const prisma = new PrismaClient();
  
  try {
    const entries = await prisma.requests.findMany({
      include: { requestEquipment: true },
      take: 2
    });
    
    console.log('Количество заявок:', entries.length);
    
    if (entries.length > 0) {
      console.log('\nПервая заявка:');
      console.log('ID:', entries[0].id);
      console.log('Номер заявки:', entries[0].applicationNumber);
      console.log('Оборудование:', entries[0].requestEquipment?.length || 0, 'единиц');
      
      if (entries[0].requestEquipment && entries[0].requestEquipment.length > 0) {
        console.log('Типы оборудования:');
        entries[0].requestEquipment.forEach((eq, index) => {
          console.log(`  ${index + 1}. ${eq.equipmentType} (${eq.countEquipment} шт.)`);
        });
      }
    }
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();