import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function rebuildDatabase() {
  try {
    console.log('🗑️ Полная очистка базы данных...');
    
    // Удаляем все данные в правильном порядке (учитывая внешние ключи)
    await prisma.request.deleteMany({});
    await prisma.equipmentPhoto.deleteMany({});
    await prisma.equipment.deleteMany({});
    await prisma.carriage.deleteMany({});
    await prisma.train.deleteMany({});
    await prisma.typeWork.deleteMany({});
    await prisma.completedJob.deleteMany({});
    await prisma.currentLocation.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.device.deleteMany({});
    
    console.log('✅ База данных очищена');

    console.log('👥 Создание пользователей...');
    
    // Создаем пользователей с захешированными паролями
    const users = [
      {
        login: 'admin',
        password: await bcrypt.hash('admin', 10),
        role: 'admin',
        name: 'Администратор'
      },
      {
        login: 'engineer',
        password: await bcrypt.hash('engineer', 10),
        role: 'engineer',
        name: 'Инженер Иванов И.И.'
      },
      {
        login: 'technician',
        password: await bcrypt.hash('technician', 10),
        role: 'technician',
        name: 'Техник Петров П.П.'
      }
    ];

    const createdUsers = [];
    for (const user of users) {
      const createdUser = await prisma.user.create({ data: user });
      createdUsers.push(createdUser);
    }

    console.log('✅ Пользователи созданы');

    console.log('📋 Создание справочников...');

    // Создаем типы работ
    const typeWorks = await Promise.all([
      prisma.typeWork.create({ data: { name: 'Установка WiFi оборудования' } }),
      prisma.typeWork.create({ data: { name: 'Замена неисправного оборудования' } }),
      prisma.typeWork.create({ data: { name: 'Техническое обслуживание' } }),
      prisma.typeWork.create({ data: { name: 'Установка дополнительного оборудования' } }),
      prisma.typeWork.create({ data: { name: 'Комплексная установка оборудования' } })
    ]);

    // Создаем выполненные работы
    const completedJobs = await Promise.all([
      prisma.completedJob.create({ data: { name: 'Установлено WiFi оборудование: роутер, коммутатор, точки доступа' } }),
      prisma.completedJob.create({ data: { name: 'Заменен неисправный коммутатор и блок питания' } }),
      prisma.completedJob.create({ data: { name: 'Проведено ТО WiFi оборудования и антенн' } }),
      prisma.completedJob.create({ data: { name: 'Установлены дополнительные коннекторы и кабели' } }),
      prisma.completedJob.create({ data: { name: 'Установлен полный комплект WiFi оборудования' } })
    ]);

    // Создаем текущие местоположения
    const currentLocations = await Promise.all([
      prisma.currentLocation.create({ data: { name: 'Депо Москва-Сортировочная' } }),
      prisma.currentLocation.create({ data: { name: 'Депо Санкт-Петербург-Главный' } }),
      prisma.currentLocation.create({ data: { name: 'Депо Казань-Пассажирская' } }),
      prisma.currentLocation.create({ data: { name: 'Депо Екатеринбург-Сортировочный' } }),
      prisma.currentLocation.create({ data: { name: 'Депо Новосибирск-Главный' } })
    ]);

    // Создаем поезда
    const trains = await Promise.all([
      prisma.train.create({ data: { number: '7001' } }),
      prisma.train.create({ data: { number: '7002' } }),
      prisma.train.create({ data: { number: '7003' } }),
      prisma.train.create({ data: { number: '7004' } }),
      prisma.train.create({ data: { number: '7005' } })
    ]);

    // Создаем вагоны
    const carriages = await Promise.all([
      prisma.carriage.create({ data: { number: '12', type: 'Плацкартный', trainId: trains[0].id } }),
      prisma.carriage.create({ data: { number: '08', type: 'Купейный', trainId: trains[1].id } }),
      prisma.carriage.create({ data: { number: '01', type: 'СВ', trainId: trains[2].id } }),
      prisma.carriage.create({ data: { number: '15', type: 'Плацкартный', trainId: trains[3].id } }),
      prisma.carriage.create({ data: { number: '03', type: 'Купейный', trainId: trains[4].id } })
    ]);

    console.log('✅ Справочники созданы');

    console.log('🔧 Создание оборудования...');

    // Создаем оборудование
    const equipmentList = await Promise.all([
      prisma.equipment.create({ 
        data: { 
          type: 'WiFi роутер', 
          serialNumber: 'WRT-2025-001', 
          macAddress: '00:1A:2B:3C:4D:5E', 
          status: 'active',
          carriageId: carriages[0].id 
        } 
      }),
      prisma.equipment.create({ 
        data: { 
          type: 'Сетевой коммутатор', 
          serialNumber: 'SW-2025-045', 
          macAddress: '00:1A:2B:3C:4D:61', 
          status: 'active',
          carriageId: carriages[1].id 
        } 
      }),
      prisma.equipment.create({ 
        data: { 
          type: 'Точка доступа WiFi', 
          serialNumber: 'AP-2025-078', 
          macAddress: '00:1A:2B:3C:4D:62', 
          status: 'active',
          carriageId: carriages[2].id 
        } 
      }),
      prisma.equipment.create({ 
        data: { 
          type: 'Коннектор RJ45', 
          serialNumber: 'CON-2025-001', 
          macAddress: null, 
          status: 'active',
          carriageId: carriages[3].id 
        } 
      }),
      prisma.equipment.create({ 
        data: { 
          type: 'WiFi роутер', 
          serialNumber: 'WRT-2025-002', 
          macAddress: '00:1A:2B:3C:4D:63', 
          status: 'active',
          carriageId: carriages[4].id 
        } 
      })
    ]);

    console.log('✅ Оборудование создано');

    console.log('📸 Создание фотографий оборудования...');

    // Создаем фотографии для оборудования
    for (const equipment of equipmentList) {
      await prisma.equipmentPhoto.create({
        data: {
          equipmentId: equipment.id,
          photoType: 'equipment',
          photoPath: '/uploads/equipment/router.svg',
          description: 'Фото оборудования'
        }
      });
    }

    console.log('✅ Фотографии созданы');

    console.log('🚂 Создание заявок...');

    // Создаем заявки
    const requests = [
      {
        applicationNumber: 2025001,
        applicationDate: new Date('2025-01-15'),
        typeWorkId: typeWorks[0].id,
        trainId: trains[0].id,
        carriageId: carriages[0].id,
        equipmentId: equipmentList[0].id,
        completedJobId: completedJobs[0].id,
        currentLocationId: currentLocations[0].id,
        userId: createdUsers[1].id,
        countEquipment: 1
      },
      {
        applicationNumber: 2025002,
        applicationDate: new Date('2025-01-16'),
        typeWorkId: typeWorks[1].id,
        trainId: trains[1].id,
        carriageId: carriages[1].id,
        equipmentId: equipmentList[1].id,
        completedJobId: completedJobs[1].id,
        currentLocationId: currentLocations[1].id,
        userId: createdUsers[2].id,
        countEquipment: 1
      },
      {
        applicationNumber: 2025003,
        applicationDate: new Date('2025-01-17'),
        typeWorkId: typeWorks[2].id,
        trainId: trains[2].id,
        carriageId: carriages[2].id,
        equipmentId: equipmentList[2].id,
        completedJobId: completedJobs[2].id,
        currentLocationId: currentLocations[2].id,
        userId: createdUsers[1].id,
        countEquipment: 1
      },
      {
        applicationNumber: 2025004,
        applicationDate: new Date('2025-01-18'),
        typeWorkId: typeWorks[3].id,
        trainId: trains[3].id,
        carriageId: carriages[3].id,
        equipmentId: equipmentList[3].id,
        completedJobId: completedJobs[3].id,
        currentLocationId: currentLocations[3].id,
        userId: createdUsers[2].id,
        countEquipment: 2
      },
      {
        applicationNumber: 2025005,
        applicationDate: new Date('2025-01-19'),
        typeWorkId: typeWorks[4].id,
        trainId: trains[4].id,
        carriageId: carriages[4].id,
        equipmentId: equipmentList[4].id,
        completedJobId: completedJobs[4].id,
        currentLocationId: currentLocations[4].id,
        userId: createdUsers[1].id,
        countEquipment: 1
      }
    ];

    let createdCount = 0;
    for (const requestData of requests) {
      try {
        await prisma.request.create({ data: requestData });
        createdCount++;
        console.log(`✅ Создана заявка ${requestData.applicationNumber}`);
      } catch (error) {
        console.error(`❌ Ошибка при создании заявки ${requestData.applicationNumber}:`, error);
      }
    }

    console.log(`\n🎉 База данных успешно пересоздана!`);
    console.log(`📊 Создано ${createdCount} заявок`);
    console.log(`👥 Создано ${users.length} пользователей`);
    console.log(`🚂 Создано ${trains.length} поездов`);
    console.log(`🚃 Создано ${carriages.length} вагонов`);
    console.log(`🔧 Создано ${equipmentList.length} единиц оборудования`);
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