const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRequest() {
  try {
    const request23 = await prisma.request.findUnique({
      where: { id: 23 },
      include: {
        requestTrains:    true,
        requestCarriages: true,
        requestEquipment: {
          include: { photos: true, typeWork: true }
        },
      },
    });
    
    console.log('Заявка 23:', JSON.stringify(request23, null, 2));
    
    const allRequests = await prisma.request.findMany({
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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