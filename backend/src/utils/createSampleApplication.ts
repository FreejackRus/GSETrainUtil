import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SampleApplicationData {
  applicationNumber: number;
  applicationDate: Date;
  typeWork: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  completedJob: string;
  currentLocation: string;
  userId: number;
  userName: string;
  userRole: string;
  equipment: {
    equipmentType: string;
    serialNumber: string | null;
    macAddress: string | null;
    countEquipment: number;
  }[];
}

export async function createSampleApplication() {
  try {
    console.log('Создание примера заявки...');

    // Пример данных заявки на основе структуры из Excel
    const sampleData: SampleApplicationData = {
      applicationNumber: 2025003, // Уникальный номер заявки
      applicationDate: new Date('2025-01-14'),
      typeWork: 'Установка оборудования',
      trainNumber: '701А',
      carriageType: 'Пассажирский',
      carriageNumber: '61-4447',
      completedJob: 'Иванов И.И.',
      currentLocation: 'Депо Москва-Сортировочная',
      userId: 1,
      userName: 'Инженер Петров',
      userRole: 'engineer',
      equipment: [
        {
          equipmentType: 'Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)',
          serialNumber: 'PC2025001',
          macAddress: '00:1B:44:11:3A:B7',
          countEquipment: 1
        },
        {
          equipmentType: 'Маршрутизатор Mikrotik Hex RB750Gr3',
          serialNumber: 'MT2025001',
          macAddress: '4C:5E:0C:12:34:56',
          countEquipment: 1
        },
        {
          equipmentType: 'Коммутатор, черт. ТСФВ.467000.008',
          serialNumber: 'SW2025001',
          macAddress: '00:23:89:AB:CD:EF',
          countEquipment: 1
        },
        {
          equipmentType: 'Источник питания (24V, 150W)',
          serialNumber: 'PS2025001',
          macAddress: null,
          countEquipment: 1
        },
        {
          equipmentType: 'Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)',
          serialNumber: null,
          macAddress: null,
          countEquipment: 8
        }
      ]
    };

    // Создаем справочники, если их нет
    console.log('Создание справочников...');
    
    await prisma.typeWork.upsert({
      where: { typeWork: sampleData.typeWork },
      update: {},
      create: { typeWork: sampleData.typeWork }
    });

    await prisma.trainNumber.upsert({
      where: { trainNumber: sampleData.trainNumber },
      update: {},
      create: { trainNumber: sampleData.trainNumber }
    });

    await prisma.completedJob.upsert({
      where: { completedJob: sampleData.completedJob },
      update: {},
      create: { completedJob: sampleData.completedJob }
    });

    await prisma.currentLocation.upsert({
      where: { currentLocation: sampleData.currentLocation },
      update: {},
      create: { currentLocation: sampleData.currentLocation }
    });

    // Создаем тип и номер вагона
    const typeWagon = await prisma.typeWagons.upsert({
      where: { typeWagon: sampleData.carriageType },
      update: {},
      create: { typeWagon: sampleData.carriageType }
    });

    const numberWagon = await prisma.numberWagons.upsert({
      where: { numberWagon: sampleData.carriageNumber },
      update: {},
      create: { numberWagon: sampleData.carriageNumber }
    });

    // Создаем заявку
    console.log('Создание заявки...');
    const request = await prisma.requests.create({
      data: {
        applicationNumber: sampleData.applicationNumber,
        applicationDate: sampleData.applicationDate,
        typeWork: sampleData.typeWork,
        trainNumber: sampleData.trainNumber,
        carriageType: sampleData.carriageType,
        carriageNumber: sampleData.carriageNumber,
        completedJob: sampleData.completedJob,
        currentLocation: sampleData.currentLocation,
        userId: sampleData.userId,
        userName: sampleData.userName,
        userRole: sampleData.userRole
      }
    });

    console.log(`Заявка создана с ID: ${request.id}`);

    // Создаем записи оборудования
    console.log('Создание записей оборудования...');
    for (const equipment of sampleData.equipment) {
      await prisma.requestEquipment.create({
        data: {
          requestId: request.id,
          equipmentType: equipment.equipmentType,
          serialNumber: equipment.serialNumber,
          macAddress: equipment.macAddress,
          countEquipment: equipment.countEquipment
        }
      });

      // Также создаем записи в таблице equipment для отображения в списке вагонов
      await prisma.equipment.create({
        data: {
          type: equipment.equipmentType,
          snNumber: equipment.serialNumber,
          mac: equipment.macAddress,
          status: 'installed', // Помечаем как установленное
          lastService: new Date(),
          typeWagonsId: typeWagon.id,
          numberWagonId: numberWagon.id,
          photo: ''
        }
      });
    }

    console.log('Пример заявки успешно создан!');
    console.log('Данные заявки:');
    console.log(`- Номер заявки: ${sampleData.applicationNumber}`);
    console.log(`- Дата: ${sampleData.applicationDate.toLocaleDateString('ru-RU')}`);
    console.log(`- Тип работ: ${sampleData.typeWork}`);
    console.log(`- Номер поезда: ${sampleData.trainNumber}`);
    console.log(`- Тип вагона: ${sampleData.carriageType}`);
    console.log(`- Номер вагона: ${sampleData.carriageNumber}`);
    console.log(`- Выполнил: ${sampleData.completedJob}`);
    console.log(`- Текущее место: ${sampleData.currentLocation}`);
    console.log(`- Количество единиц оборудования: ${sampleData.equipment.length}`);

    return request;

  } catch (error) {
    console.error('Ошибка при создании примера заявки:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск создания примера, если файл запущен напрямую
if (require.main === module) {
  createSampleApplication()
    .then(() => {
      console.log('Создание примера заявки завершено успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Ошибка:', error);
      process.exit(1);
    });
}