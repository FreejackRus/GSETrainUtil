import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recreateTestData() {
  try {
    console.log('Удаление старых тестовых данных...');
    
    // Удаляем все заявки с номерами 2025001, 2025002, 2025003
    await prisma.requestEquipment.deleteMany({
      where: {
        request: {
          applicationNumber: {
            in: [2025001, 2025002, 2025003]
          }
        }
      }
    });

    await prisma.requests.deleteMany({
      where: {
        applicationNumber: {
          in: [2025001, 2025002, 2025003]
        }
      }
    });

    console.log('Старые тестовые данные удалены');

    console.log('Создание новых тестовых данных с объединенным оборудованием...');

    const testRequestsData = [
      {
        request: {
          applicationNumber: 2025001,
          applicationDate: new Date('2025-01-15'),
          typeWork: 'Установка оборудования',
          trainNumber: '7001',
          carriageType: 'Плацкартный',
          carriageNumber: '12',
          completedJob: 'Установлено сетевое оборудование: WiFi роутер, коммутатор, точки доступа',
          currentLocation: 'Депо Москва',
          carriagePhoto: '/uploads/equipment/router.svg',
          generalPhoto: '/uploads/equipment/router.svg',
          finalPhoto: '/uploads/equipment/router.svg',
          userId: 1,
          userName: 'Иванов И.И.',
          userRole: 'Техник'
        },
        equipment: [
          {
            equipmentType: 'WiFi роутер',
            serialNumber: 'RT-2024-001',
            macAddress: '00:1B:44:11:3A:B7',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/router.svg',
            serialPhoto: '/uploads/equipment/router.svg',
            macPhoto: '/uploads/equipment/router.svg'
          },
          {
            equipmentType: 'Сетевой коммутатор',
            serialNumber: 'SW-2024-001',
            macAddress: '00:1B:44:11:3A:C8',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/switch.svg',
            serialPhoto: '/uploads/equipment/switch.svg',
            macPhoto: '/uploads/equipment/switch.svg'
          },
          {
            equipmentType: 'Точка доступа WiFi',
            serialNumber: 'AP-2024-001',
            macAddress: '00:1B:44:11:3A:D9',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/wifi-ap.svg',
            serialPhoto: '/uploads/equipment/wifi-ap.svg',
            macPhoto: '/uploads/equipment/wifi-ap.svg'
          },
          {
            equipmentType: 'Коннектор RJ45',
            serialNumber: 'CON-2024-001',
            macAddress: null,
            countEquipment: 2,
            equipmentPhoto: '/uploads/equipment/connector.svg',
            serialPhoto: '/uploads/equipment/connector.svg',
            macPhoto: null
          }
        ]
      },
      {
        request: {
          applicationNumber: 2025002,
          applicationDate: new Date('2025-01-16'),
          typeWork: 'Замена оборудования',
          trainNumber: '7002',
          carriageType: 'Купейный',
          carriageNumber: '08',
          completedJob: 'Заменен неисправный коммутатор и блок питания',
          currentLocation: 'Депо СПб',
          carriagePhoto: '/uploads/equipment/switch.svg',
          generalPhoto: '/uploads/equipment/switch.svg',
          finalPhoto: '/uploads/equipment/switch.svg',
          userId: 2,
          userName: 'Петров П.П.',
          userRole: 'Инженер'
        },
        equipment: [
          {
            equipmentType: 'Сетевой коммутатор',
            serialNumber: 'SW-2024-045',
            macAddress: '00:1B:44:22:5C:D9',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/switch.svg',
            serialPhoto: '/uploads/equipment/switch.svg',
            macPhoto: '/uploads/equipment/switch.svg'
          },
          {
            equipmentType: 'Блок питания',
            serialNumber: 'PS-2024-012',
            macAddress: null,
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/power.svg',
            serialPhoto: '/uploads/equipment/power.svg',
            macPhoto: null
          }
        ]
      },
      {
        request: {
          applicationNumber: 2025003,
          applicationDate: new Date('2025-01-17'),
          typeWork: 'Техническое обслуживание',
          trainNumber: '7003',
          carriageType: 'СВ',
          carriageNumber: '01',
          completedJob: 'Проведено ТО WiFi оборудования и антенн',
          currentLocation: 'Депо Казань',
          carriagePhoto: '/uploads/equipment/wifi-ap.svg',
          generalPhoto: '/uploads/equipment/wifi-ap.svg',
          finalPhoto: '/uploads/equipment/wifi-ap.svg',
          userId: 3,
          userName: 'Сидоров С.С.',
          userRole: 'Техник'
        },
        equipment: [
          {
            equipmentType: 'Точка доступа WiFi',
            serialNumber: 'AP-2024-078',
            macAddress: '00:1B:44:33:7E:F2',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/wifi-ap.svg',
            serialPhoto: '/uploads/equipment/wifi-ap.svg',
            macPhoto: '/uploads/equipment/wifi-ap.svg'
          },
          {
            equipmentType: 'Антенна WiFi',
            serialNumber: 'ANT-2024-034',
            macAddress: null,
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/antenna.svg',
            serialPhoto: '/uploads/equipment/antenna.svg',
            macPhoto: null
          }
        ]
      }
    ];

    let createdCount = 0;

    for (const testData of testRequestsData) {
      try {
        // Создаем заявку с объединенным оборудованием
        await prisma.requests.create({
          data: {
            ...testData.request,
            requestEquipment: {
              create: testData.equipment
            }
          }
        });
        createdCount++;
        console.log(`Создана заявка ${testData.request.applicationNumber} с ${testData.equipment.length} типами оборудования`);
      } catch (error) {
        console.error(`Ошибка при создании заявки ${testData.request.applicationNumber}:`, error);
      }
    }

    console.log(`\nУспешно создано ${createdCount} заявок с объединенным оборудованием`);
    
  } catch (error) {
    console.error('Ошибка при пересоздании тестовых данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recreateTestData();