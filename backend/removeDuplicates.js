const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function removeDuplicates() {
  try {
    console.log('=== Удаление дублированных заявок ===\n');
    
    // Находим дублированные заявки (с одинаковыми номерами)
    const duplicates = await prisma.$queryRaw`
      SELECT 
        "applicationNumber",
        COUNT(*) as count,
        STRING_AGG(id::text, ', ') as ids
      FROM requests 
      GROUP BY "applicationNumber"
      HAVING COUNT(*) > 1
      ORDER BY "applicationNumber"
    `;
    
    console.log('Найдены дублированные заявки:');
    for (const dup of duplicates) {
      console.log(`Номер заявки: ${dup.applicationNumber}, количество: ${dup.count}, ID: ${dup.ids}`);
      
      // Получаем все ID для этого номера заявки
      const ids = dup.ids.split(', ').map(id => parseInt(id));
      
      // Оставляем только первую запись, остальные удаляем
      const idsToDelete = ids.slice(1);
      
      if (idsToDelete.length > 0) {
        console.log(`Удаляем дублированные записи с ID: ${idsToDelete.join(', ')}`);
        
        // Сначала удаляем связанное оборудование
        await prisma.requestEquipment.deleteMany({
          where: {
            requestId: {
              in: idsToDelete
            }
          }
        });
        
        // Затем удаляем сами заявки
        await prisma.requests.deleteMany({
          where: {
            id: {
              in: idsToDelete
            }
          }
        });
        
        console.log(`Удалено ${idsToDelete.length} дублированных записей для заявки №${dup.applicationNumber}`);
      }
    }
    
    console.log('\n=== Проверка результата ===');
    
    // Проверяем результат
    const remaining = await prisma.$queryRaw`
      SELECT 
        "applicationNumber",
        COUNT(*) as count
      FROM requests 
      GROUP BY "applicationNumber"
      ORDER BY "applicationNumber"
    `;
    
    console.log('Оставшиеся заявки:');
    remaining.forEach(row => {
      console.log(`Заявка №${row.applicationNumber}: ${row.count} запись(ей)`);
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicates();