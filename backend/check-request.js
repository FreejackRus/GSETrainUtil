const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRequest() {
  try {
    const request23 = await prisma.request.findUnique({
      where: { id: 23 }
    });
    
    console.log('Заявка 23:', JSON.stringify(request23, null, 2));
    
    const allRequests = await prisma.request.findMany({
      select: {
        id: true,
        applicationNumber: true,
        userId: true,
        status: true
      }
    });
    
    console.log('\nВсе заявки:');
    allRequests.forEach(req => {
      console.log(`ID: ${req.id}, Номер: ${req.applicationNumber}, UserID: ${req.userId}, Статус: ${req.status}`);
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRequest();