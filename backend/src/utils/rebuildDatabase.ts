import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function rebuildDatabase() {
  try {
    console.log('🗑️ Полная очистка базы данных...');
    
    // Удаляем все данные в правильном порядке (учитывая внешние ключи)
    await prisma.requestEquipment.deleteMany({});
    await prisma.requests.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ База данных очищена');

    console.log('👥 Создание пользователей...');
    
    // Создаем пользователей с захешированными паролями
    const users = [
      {
        id: 1,
        login: 'admin',
        password: await bcrypt.hash('admin', 10),
        role: 'admin'
      },
      {
        id: 2,
        login: 'engineer',
        password: await bcrypt.hash('engineer', 10),
        role: 'engineer'
      },
      {
        id: 3,
        login: 'technician',
        password: await bcrypt.hash('technician', 10),
        role: 'technician'
      }
    ];

    for (const user of users) {
      await prisma.user.create({ data: user });
    }

    console.log('✅ Пользователи созданы');

    console.log('🚂 Создание реальных заявок с объединенным оборудованием...');

    // Реальные данные заявок (основанные на типичных работах по составам)
    const realRequests = [
      {
        request: {
          applicationNumber: 2025001,
          applicationDate: new Date('2025-01-15'),
          typeWork: 'Установка WiFi оборудования',
          trainNumber: '7001',
          carriageType: 'Плацкартный',
          carriageNumber: '12',
          completedJob: 'Установлено WiFi оборудование: роутер, коммутатор, точки доступа',
          currentLocation: 'Депо Москва-Сортировочная',
          carriagePhoto: '/uploads/equipment/router.svg',
          generalPhoto: '/uploads/equipment/router.svg',
          finalPhoto: '/uploads/equipment/router.svg',
          userId: 2,
          userName: 'Инженер Иванов И.И.',
          userRole: 'engineer'
        },
        equipment: [
          {
            equipmentType: 'WiFi роутер',
            serialNumber: 'WRT-2025-001',
            macAddress: '00:1A:2B:3C:4D:5E',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/router.svg',
            serialPhoto: '/uploads/equipment/router.svg',
            macPhoto: '/uploads/equipment/router.svg'
          },
          {
            equipmentType: 'Сетевой коммутатор',
            serialNumber: 'SW-2025-001',
            macAddress: '00:1A:2B:3C:4D:5F',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/switch.svg',
            serialPhoto: '/uploads/equipment/switch.svg',
            macPhoto: '/uploads/equipment/switch.svg'
          },
          {
            equipmentType: 'Точка доступа WiFi',
            serialNumber: 'AP-2025-001',
            macAddress: '00:1A:2B:3C:4D:60',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/wifi-ap.svg',
            serialPhoto: '/uploads/equipment/wifi-ap.svg',
            macPhoto: '/uploads/equipment/wifi-ap.svg'
          }
        ]
      },
      {
        request: {
          applicationNumber: 2025002,
          applicationDate: new Date('2025-01-16'),
          typeWork: 'Замена неисправного оборудования',
          trainNumber: '7002',
          carriageType: 'Купейный',
          carriageNumber: '08',
          completedJob: 'Заменен неисправный коммутатор и блок питания',
          currentLocation: 'Депо Санкт-Петербург-Главный',
          carriagePhoto: '/uploads/equipment/switch.svg',
          generalPhoto: '/uploads/equipment/switch.svg',
          finalPhoto: '/uploads/equipment/switch.svg',
          userId: 3,
          userName: 'Техник Петров П.П.',
          userRole: 'technician'
        },
        equipment: [
          {
            equipmentType: 'Сетевой коммутатор',
            serialNumber: 'SW-2025-045',
            macAddress: '00:1A:2B:3C:4D:61',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/switch.svg',
            serialPhoto: '/uploads/equipment/switch.svg',
            macPhoto: '/uploads/equipment/switch.svg'
          },
          {
            equipmentType: 'Блок питания',
            serialNumber: 'PS-2025-012',
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
          currentLocation: 'Депо Казань-Пассажирская',
          carriagePhoto: '/uploads/equipment/wifi-ap.svg',
          generalPhoto: '/uploads/equipment/wifi-ap.svg',
          finalPhoto: '/uploads/equipment/wifi-ap.svg',
          userId: 2,
          userName: 'Инженер Иванов И.И.',
          userRole: 'engineer'
        },
        equipment: [
          {
            equipmentType: 'Точка доступа WiFi',
            serialNumber: 'AP-2025-078',
            macAddress: '00:1A:2B:3C:4D:62',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/wifi-ap.svg',
            serialPhoto: '/uploads/equipment/wifi-ap.svg',
            macPhoto: '/uploads/equipment/wifi-ap.svg'
          },
          {
            equipmentType: 'Антенна WiFi',
            serialNumber: 'ANT-2025-034',
            macAddress: null,
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/antenna.svg',
            serialPhoto: '/uploads/equipment/antenna.svg',
            macPhoto: null
          }
        ]
      },
      {
        request: {
          applicationNumber: 2025004,
          applicationDate: new Date('2025-01-18'),
          typeWork: 'Установка дополнительного оборудования',
          trainNumber: '7004',
          carriageType: 'Плацкартный',
          carriageNumber: '15',
          completedJob: 'Установлены дополнительные коннекторы и кабели',
          currentLocation: 'Депо Екатеринбург-Сортировочный',
          carriagePhoto: '/uploads/equipment/connector.svg',
          generalPhoto: '/uploads/equipment/connector.svg',
          finalPhoto: '/uploads/equipment/connector.svg',
          userId: 3,
          userName: 'Техник Петров П.П.',
          userRole: 'technician'
        },
        equipment: [
          {
            equipmentType: 'Коннектор RJ45',
            serialNumber: 'CON-2025-001',
            macAddress: null,
            countEquipment: 2,
            equipmentPhoto: '/uploads/equipment/connector.svg',
            serialPhoto: '/uploads/equipment/connector.svg',
            macPhoto: null
          },
          {
            equipmentType: 'Кабель сетевой',
            serialNumber: 'CBL-2025-001',
            macAddress: null,
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/cable.svg',
            serialPhoto: '/uploads/equipment/cable.svg',
            macPhoto: null
          }
        ]
      },
      {
        request: {
          applicationNumber: 2025005,
          applicationDate: new Date('2025-01-19'),
          typeWork: 'Комплексная установка оборудования',
          trainNumber: '7005',
          carriageType: 'Купейный',
          carriageNumber: '03',
          completedJob: 'Установлен полный комплект WiFi оборудования',
          currentLocation: 'Депо Новосибирск-Главный',
          carriagePhoto: '/uploads/equipment/router.svg',
          generalPhoto: '/uploads/equipment/router.svg',
          finalPhoto: '/uploads/equipment/router.svg',
          userId: 2,
          userName: 'Инженер Иванов И.И.',
          userRole: 'engineer'
        },
        equipment: [
          {
            equipmentType: 'WiFi роутер',
            serialNumber: 'WRT-2025-002',
            macAddress: '00:1A:2B:3C:4D:63',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/router.svg',
            serialPhoto: '/uploads/equipment/router.svg',
            macPhoto: '/uploads/equipment/router.svg'
          },
          {
            equipmentType: 'Сетевой коммутатор',
            serialNumber: 'SW-2025-002',
            macAddress: '00:1A:2B:3C:4D:64',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/switch.svg',
            serialPhoto: '/uploads/equipment/switch.svg',
            macPhoto: '/uploads/equipment/switch.svg'
          },
          {
            equipmentType: 'Точка доступа WiFi',
            serialNumber: 'AP-2025-002',
            macAddress: '00:1A:2B:3C:4D:65',
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/wifi-ap.svg',
            serialPhoto: '/uploads/equipment/wifi-ap.svg',
            macPhoto: '/uploads/equipment/wifi-ap.svg'
          },
          {
            equipmentType: 'Блок питания',
            serialNumber: 'PS-2025-002',
            macAddress: null,
            countEquipment: 1,
            equipmentPhoto: '/uploads/equipment/power.svg',
            serialPhoto: '/uploads/equipment/power.svg',
            macPhoto: null
          },
          {
            equipmentType: 'Коннектор RJ45',
            serialNumber: 'CON-2025-002',
            macAddress: null,
            countEquipment: 2,
            equipmentPhoto: '/uploads/equipment/connector.svg',
            serialPhoto: '/uploads/equipment/connector.svg',
            macPhoto: null
          }
        ]
      }
    ];

    let createdCount = 0;

    for (const requestData of realRequests) {
      try {
        await prisma.requests.create({
          data: {
            ...requestData.request,
            requestEquipment: {
              create: requestData.equipment
            }
          }
        });
        createdCount++;
        console.log(`✅ Создана заявка ${requestData.request.applicationNumber} с ${requestData.equipment.length} типами оборудования`);
      } catch (error) {
        console.error(`❌ Ошибка при создании заявки ${requestData.request.applicationNumber}:`, error);
      }
    }

    console.log(`\n🎉 База данных успешно пересоздана!`);
    console.log(`📊 Создано ${createdCount} заявок с объединенным оборудованием`);
    console.log(`👥 Создано ${users.length} пользователей`);
    console.log(`\n🔐 Данные для входа:`);
    console.log(`   admin / admin (администратор)`);
    console.log(`   engineer / engineer (инженер)`);
    console.log(`   technician / technician (техник)`);
    
  } catch (error) {
    console.error('❌ Ошибка при пересоздании базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

rebuildDatabase();