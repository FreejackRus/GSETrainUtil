import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаю заполнение базы данных...')

  // Хешируем пароли
  const adminPasswordHash = await bcrypt.hash('admin', 10)
  const engineerPasswordHash = await bcrypt.hash('engineer', 10)

  // 1. Создаем пользователей
  console.log('👤 Создаю пользователей...')
  const admin = await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      password: adminPasswordHash,
      role: 'admin',
      name: 'Администратор'
    }
  })

  const engineer = await prisma.user.upsert({
    where: { login: 'engineer' },
    update: {},
    create: {
      login: 'engineer',
      password: engineerPasswordHash,
      role: 'engineer',
      name: 'Инженер'
    }
  })

  // 2. Создаем справочники
  console.log('📋 Создаю справочники...')

  // Типы работ
  const typeWork1 = await prisma.typeWork.upsert({
    where: { name: 'Монтаж' },
    update: {},
    create: { name: 'Монтаж' }
  })

  const typeWork2 = await prisma.typeWork.upsert({
    where: { name: 'Демонтаж' },
    update: {},
    create: { name: 'Демонтаж' }
  })

  const typeWork3 = await prisma.typeWork.upsert({
    where: { name: 'Обслуживание' },
    update: {},
    create: { name: 'Обслуживание' }
  })

  // Выполненные работы
  const completedJob1 = await prisma.completedJob.upsert({
    where: { name: 'Перемена' },
    update: {},
    create: { name: 'Перемена' }
  })

  const completedJob2 = await prisma.completedJob.upsert({
    where: { name: 'Подрядчик' },
    update: {},
    create: { name: 'Подрядчик' }
  })

  const completedJob3 = await prisma.completedJob.upsert({
    where: { name: 'Внутренние ресурсы' },
    update: {},
    create: { name: 'Внутренние ресурсы' }
  })

  // Местоположения
  const location1 = await prisma.currentLocation.upsert({
    where: { name: 'Депо №1' },
    update: {},
    create: { name: 'Депо №1' }
  })

  const location2 = await prisma.currentLocation.upsert({
    where: { name: 'Депо №2' },
    update: {},
    create: { name: 'Депо №2' }
  })

  const location3 = await prisma.currentLocation.upsert({
    where: { name: 'Ремонтная база' },
    update: {},
    create: { name: 'Ремонтная база' }
  })

  // 3. Создаем поезда
  console.log('🚂 Создаю поезда...')
  const train1 = await prisma.train.upsert({
    where: { number: '001' },
    update: {},
    create: { number: '001' }
  })

  const train2 = await prisma.train.upsert({
    where: { number: '002' },
    update: {},
    create: { number: '002' }
  })

  const train3 = await prisma.train.upsert({
    where: { number: '003' },
    update: {},
    create: { number: '003' }
  })

  // 4. Создаем вагоны
  console.log('🚃 Создаю вагоны...')
  const carriage1 = await prisma.carriage.create({
    data: {
      number: 'В-001',
      type: 'Пассажирский',
      trainId: train1.id
    }
  })

  const carriage2 = await prisma.carriage.create({
    data: {
      number: 'В-002',
      type: 'Грузовой',
      trainId: train1.id
    }
  })

  const carriage3 = await prisma.carriage.create({
    data: {
      number: 'В-003',
      type: 'Багажный',
      trainId: train2.id
    }
  })

  const carriage4 = await prisma.carriage.create({
    data: {
      number: 'В-004',
      type: 'Почтовый',
      trainId: train2.id
    }
  })

  const carriage5 = await prisma.carriage.create({
    data: {
      number: 'В-005',
      type: 'Служебный',
      trainId: train3.id
    }
  })

  // 5. Создаем оборудование
  console.log('⚙️ Создаю оборудование...')
  const equipment1 = await prisma.equipment.create({
    data: {
      type: 'GSE Terminal',
      serialNumber: 'GSE-TRM-001',
      macAddress: '00:11:22:33:44:55',
      status: 'Активно',
      lastService: new Date(),
      carriageId: carriage1.id
    }
  })

  const equipment2 = await prisma.equipment.create({
    data: {
      type: 'GSE Router',
      serialNumber: 'GSE-RTR-002',
      macAddress: '00:11:22:33:44:66',
      status: 'Неактивно',
      lastService: new Date(),
      carriageId: carriage2.id
    }
  })

  const equipment3 = await prisma.equipment.create({
    data: {
      type: 'GSE Switch',
      serialNumber: 'GSE-SWT-003',
      macAddress: '00:11:22:33:44:77',
      status: 'Активно',
      lastService: new Date(),
      carriageId: carriage3.id
    }
  })

  const equipment4 = await prisma.equipment.create({
    data: {
      type: 'GSE Access Point',
      serialNumber: 'GSE-AP-004',
      macAddress: '00:11:22:33:44:88',
      status: 'Активно',
      lastService: new Date(),
      carriageId: carriage4.id
    }
  })

  const equipment5 = await prisma.equipment.create({
    data: {
      type: 'GSE Controller',
      serialNumber: 'GSE-CTL-005',
      macAddress: '00:11:22:33:44:99',
      status: 'Неактивно',
      lastService: new Date(),
      carriageId: carriage5.id
    }
  })

  // 6. Создаем фотографии оборудования
  console.log('📷 Создаю фотографии оборудования...')
  await prisma.equipmentPhoto.createMany({
    data: [
      {
        equipmentId: equipment1.id,
        photoType: 'equipment',
        photoPath: '/uploads/equipment/equipment1.jpg',
        description: 'Основное фото GSE Terminal'
      },
      {
        equipmentId: equipment1.id,
        photoType: 'serial',
        photoPath: '/uploads/equipment/equipment1_serial.jpg',
        description: 'Серийный номер GSE Terminal'
      },
      {
        equipmentId: equipment2.id,
        photoType: 'equipment',
        photoPath: '/uploads/equipment/equipment2.jpg',
        description: 'Основное фото GSE Router'
      },
      {
        equipmentId: equipment3.id,
        photoType: 'equipment',
        photoPath: '/uploads/equipment/equipment3.jpg',
        description: 'Основное фото GSE Switch'
      },
      {
        equipmentId: equipment4.id,
        photoType: 'equipment',
        photoPath: '/uploads/equipment/equipment4.jpg',
        description: 'Основное фото GSE Access Point'
      },
      {
        equipmentId: equipment5.id,
        photoType: 'equipment',
        photoPath: '/uploads/equipment/equipment5.jpg',
        description: 'Основное фото GSE Controller'
      }
    ]
  })

  // 7. Создаем тестовые заявки
  console.log('📝 Создаю тестовые заявки...')
  const request1 = await prisma.request.create({
    data: {
      applicationNumber: 1001,
      typeWorkId: typeWork1.id,
      trainId: train1.id,
      carriageId: carriage1.id,
      equipmentId: equipment1.id,
      completedJobId: completedJob1.id,
      currentLocationId: location1.id,
      userId: engineer.id,
      countEquipment: 1
    }
  })

  const request2 = await prisma.request.create({
    data: {
      applicationNumber: 1002,
      typeWorkId: typeWork2.id,
      trainId: train2.id,
      carriageId: carriage3.id,
      equipmentId: equipment3.id,
      completedJobId: completedJob2.id,
      currentLocationId: location2.id,
      userId: admin.id,
      countEquipment: 2
    }
  })

  // 8. Создаем устройства для статистики
  console.log('📊 Создаю данные для статистики...')
  await prisma.device.createMany({
    data: [
      { name: 'GSE Terminal', status: 'Активно', count: 15 },
      { name: 'GSE Router', status: 'Активно', count: 8 },
      { name: 'GSE Switch', status: 'Активно', count: 12 },
      { name: 'GSE Access Point', status: 'Активно', count: 20 },
      { name: 'GSE Controller', status: 'Неактивно', count: 5 },
      { name: 'GSE Sensor', status: 'Активно', count: 25 }
    ]
  })

  console.log('✅ База данных успешно заполнена!')
  console.log('👥 Пользователи:')
  console.log('  - Администратор: admin/admin')
  console.log('  - Инженер: engineer/engineer')
  console.log('🚂 Поезда: 001, 002, 003')
  console.log('🚃 Вагоны: В-001, В-002, В-003, В-004, В-005')
  console.log('⚙️ Оборудование: 5 единиц')
  console.log('📝 Заявки: 2 тестовые заявки')
  console.log('📷 Фотографии: 6 фотографий оборудования')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })