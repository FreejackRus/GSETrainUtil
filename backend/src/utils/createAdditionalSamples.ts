import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createMultipleSampleApplications() {
  try {
    console.log('Создание дополнительных примеров заявок...');

    // Заявка 2 - с частично установленным оборудованием
    const request2 = await prisma.requests.create({
      data: {
        applicationNumber: 2025004,
        applicationDate: new Date('2025-01-15'),
        typeWork: 'Модернизация оборудования',
        trainNumber: '702Б',
        carriageType: 'Купейный',
        carriageNumber: '61-4448',
        completedJob: 'Сидоров С.С.',
        currentLocation: 'Депо Санкт-Петербург',
        userId: 1,
        userName: 'Инженер Петров',
        userRole: 'engineer'
      }
    });

    // Создаем тип и номер вагона для второй заявки
    const typeWagon2 = await prisma.typeWagons.upsert({
      where: { typeWagon: 'Купейный' },
      update: {},
      create: { typeWagon: 'Купейный' }
    });

    const numberWagon2 = await prisma.numberWagons.upsert({
      where: { numberWagon: '61-4448' },
      update: {},
      create: { numberWagon: '61-4448' }
    });

    // Оборудование для второй заявки
    const equipment2 = [
      {
        equipmentType: 'Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)',
        serialNumber: 'PC2025002',
        macAddress: '00:1B:44:11:3A:B8',
        status: 'installed'
      },
      {
        equipmentType: 'Маршрутизатор Mikrotik Hex RB750Gr3',
        serialNumber: 'MT2025002',
        macAddress: '4C:5E:0C:12:34:57',
        status: 'not_installed'
      },
      {
        equipmentType: 'Коммутатор, черт. ТСФВ.467000.008',
        serialNumber: 'SW2025002',
        macAddress: '00:23:89:AB:CD:F0',
        status: 'not_installed'
      }
    ];

    for (const equipment of equipment2) {
      await prisma.requestEquipment.create({
        data: {
          requestId: request2.id,
          equipmentType: equipment.equipmentType,
          serialNumber: equipment.serialNumber,
          macAddress: equipment.macAddress,
          countEquipment: 1
        }
      });

      await prisma.equipment.create({
        data: {
          type: equipment.equipmentType,
          snNumber: equipment.serialNumber,
          mac: equipment.macAddress,
          status: equipment.status,
          lastService: new Date(),
          typeWagonsId: typeWagon2.id,
          numberWagonId: numberWagon2.id,
          photo: ''
        }
      });
    }

    // Заявка 3 - с неустановленным оборудованием
    const request3 = await prisma.requests.create({
      data: {
        applicationNumber: 2025005,
        applicationDate: new Date('2025-01-16'),
        typeWork: 'Плановая установка',
        trainNumber: '703В',
        carriageType: 'Плацкартный',
        carriageNumber: '61-4449',
        completedJob: 'Козлов К.К.',
        currentLocation: 'Депо Екатеринбург',
        userId: 1,
        userName: 'Инженер Петров',
        userRole: 'engineer'
      }
    });

    // Создаем тип и номер вагона для третьей заявки
    const typeWagon3 = await prisma.typeWagons.upsert({
      where: { typeWagon: 'Плацкартный' },
      update: {},
      create: { typeWagon: 'Плацкартный' }
    });

    const numberWagon3 = await prisma.numberWagons.upsert({
      where: { numberWagon: '61-4449' },
      update: {},
      create: { numberWagon: '61-4449' }
    });

    // Оборудование для третьей заявки (все не установлено)
    const equipment3 = [
      {
        equipmentType: 'Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)',
        serialNumber: 'PC2025003',
        macAddress: '00:1B:44:11:3A:B9',
        status: 'not_installed'
      },
      {
        equipmentType: 'Маршрутизатор Mikrotik Hex RB750Gr3',
        serialNumber: 'MT2025003',
        macAddress: '4C:5E:0C:12:34:58',
        status: 'not_installed'
      }
    ];

    for (const equipment of equipment3) {
      await prisma.requestEquipment.create({
        data: {
          requestId: request3.id,
          equipmentType: equipment.equipmentType,
          serialNumber: equipment.serialNumber,
          macAddress: equipment.macAddress,
          countEquipment: 1
        }
      });

      await prisma.equipment.create({
        data: {
          type: equipment.equipmentType,
          snNumber: equipment.serialNumber,
          mac: equipment.macAddress,
          status: equipment.status,
          lastService: new Date(),
          typeWagonsId: typeWagon3.id,
          numberWagonId: numberWagon3.id,
          photo: ''
        }
      });
    }

    console.log('Дополнительные примеры заявок созданы:');
    console.log(`- Заявка ${request2.applicationNumber}: частично установленное оборудование`);
    console.log(`- Заявка ${request3.applicationNumber}: неустановленное оборудование`);

  } catch (error) {
    console.error('Ошибка при создании дополнительных заявок:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск создания примеров, если файл запущен напрямую
if (require.main === module) {
  createMultipleSampleApplications()
    .then(() => {
      console.log('Создание дополнительных примеров завершено успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Ошибка:', error);
      process.exit(1);
    });
}