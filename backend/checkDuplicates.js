const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('=== Проверка дублированного оборудования ===\n');
    
    // Используем raw SQL для проверки
    const result = await prisma.$queryRaw`
      SELECT 
        r.id as request_id,
        r."applicationNumber",
        COUNT(re.id) as equipment_count,
        STRING_AGG(re."equipmentType" || ' (' || re."countEquipment" || ' шт.)', ', ') as equipment_list
      FROM requests r
      LEFT JOIN "requestEquipment" re ON r.id = re."requestId"
      GROUP BY r.id, r."applicationNumber"
      ORDER BY r."applicationNumber"
    `;
    
    console.log('Результаты:');
    result.forEach(row => {
      console.log(`Заявка №${row.applicationNumber} (ID: ${row.request_id})`);
      console.log(`  Количество записей оборудования: ${row.equipment_count}`);
      console.log(`  Оборудование: ${row.equipment_list || 'Нет оборудования'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();