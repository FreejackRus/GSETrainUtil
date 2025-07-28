import { PrismaClient } from '../generated/prisma'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Хешируем пароли
  const adminPasswordHash = await bcrypt.hash('admin', 10)
  const engineerPasswordHash = await bcrypt.hash('engineer', 10)

  // Создаем администратора
  const admin = await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      password: adminPasswordHash,
      role: 'admin'
    }
  })

  // Создаем инженера
  const engineer = await prisma.user.upsert({
    where: { login: 'engineer' },
    update: {},
    create: {
      login: 'engineer',
      password: engineerPasswordHash,
      role: 'engineer'
    }
  })

  console.log('Пользователи созданы:')
  console.log('Администратор:', admin)
  console.log('Инженер:', engineer)

  // Создаем базовые данные для справочников


  const typeWork3 = await prisma.typeWork.upsert({
    where: { typeWork: 'Монтаж' },
    update: {},
    create: {
      typeWork: 'Монтаж'
    }
  })

  const typeWork4 = await prisma.typeWork.upsert({
    where: { typeWork: 'Демонтаж' },
    update: {},
    create: {
      typeWork: 'Демонтаж'
    }
  })

  const trainNumber1 = await prisma.trainNumber.upsert({
    where: { trainNumber: '001' },
    update: {},
    create: {
      trainNumber: '001'
    }
  })

  const trainNumber2 = await prisma.trainNumber.upsert({
    where: { trainNumber: '002' },
    update: {},
    create: {
      trainNumber: '002'
    }
  })


  const completedJob3 = await prisma.completedJob.upsert({
    where: { completedJob: 'Перемена' },
    update: {},
    create: {
      completedJob: 'Перемена'
    }
  })

  const completedJob4 = await prisma.completedJob.upsert({
    where: { completedJob: 'Подрядчик' },
    update: {},
    create: {
      completedJob: 'Подрядчик'
    }
  })

  const location1 = await prisma.currentLocation.upsert({
    where: { currentLocation: 'Депо №1' },
    update: {},
    create: {
      currentLocation: 'Депо №1'
    }
  })

  const location2 = await prisma.currentLocation.upsert({
    where: { currentLocation: 'Депо №2' },
    update: {},
    create: {
      currentLocation: 'Депо №2'
    }
  })

  // Создаем типы вагонов
  const typeWagon1 = await prisma.typeWagons.upsert({
    where: { id: 1 },
    update: {},
    create: {
      typeWagon: 'Пассажирский'
    }
  })

  const typeWagon2 = await prisma.typeWagons.upsert({
    where: { id: 2 },
    update: {},
    create: {
      typeWagon: 'Грузовой'
    }
  })

  const typeWagon3 = await prisma.typeWagons.upsert({
    where: { id: 3 },
    update: {},
    create: {
      typeWagon: 'Багажный'
    }
  })

  const typeWagon4 = await prisma.typeWagons.upsert({
    where: { id: 4 },
    update: {},
    create: {
      typeWagon: 'Почтовый'
    }
  })

  const typeWagon5 = await prisma.typeWagons.upsert({
    where: { id: 5 },
    update: {},
    create: {
      typeWagon: 'Служебный'
    }
  })

  // Создаем номера вагонов
  const numberWagon1 = await prisma.numberWagons.create({
    data: {
      numberWagon: 'В-001'
    }
  })

  const numberWagon2 = await prisma.numberWagons.create({
    data: {
      numberWagon: 'В-002'
    }
  })

  // Создаем оборудование
  const equipment1 = await prisma.equipment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      type: 'GSE Terminal',
      snNumber: 'GSE-TRM-001',
      mac: '00:11:22:33:44:55',
      status: 'Активно',
      lastService: new Date(),
      typeWagonsId: typeWagon1.id,
      numberWagonId: numberWagon1.id,
      photo: '/images/equipment1.jpg'
    }
  })

  const equipment2 = await prisma.equipment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      type: 'GSE Router',
      snNumber: 'GSE-RTR-002',
      mac: '00:11:22:33:44:66',
      status: 'Неактивно',
      lastService: new Date(),
      typeWagonsId: typeWagon2.id,
      numberWagonId: numberWagon2.id,
      photo: '/images/equipment2.jpg'
    }
  })

  const equipment3 = await prisma.equipment.upsert({
    where: { id: 3 },
    update: {},
    create: {
      type: 'GSE Switch',
      snNumber: 'GSE-SWT-003',
      mac: '00:11:22:33:44:77',
      status: 'Активно',
      lastService: new Date(),
      typeWagonsId: typeWagon3.id,
      numberWagonId: numberWagon1.id,
      photo: '/images/equipment3.jpg'
    }
  })

  const equipment4 = await prisma.equipment.upsert({
    where: { id: 4 },
    update: {},
    create: {
      type: 'GSE Access Point',
      snNumber: 'GSE-AP-004',
      mac: '00:11:22:33:44:88',
      status: 'Активно',
      lastService: new Date(),
      typeWagonsId: typeWagon4.id,
      numberWagonId: numberWagon2.id,
      photo: '/images/equipment4.jpg'
    }
  })

  const equipment5 = await prisma.equipment.upsert({
    where: { id: 5 },
    update: {},
    create: {
      type: 'GSE Controller',
      snNumber: 'GSE-CTL-005',
      mac: '00:11:22:33:44:99',
      status: 'Неактивно',
      lastService: new Date(),
      typeWagonsId: typeWagon5.id,
      numberWagonId: numberWagon1.id,
      photo: '/images/equipment5.jpg'
    }
  })

  const equipment6 = await prisma.equipment.upsert({
    where: { id: 6 },
    update: {},
    create: {
      type: 'GSE Sensor',
      snNumber: 'GSE-SNS-006',
      mac: null, // Некоторое оборудование может не иметь MAC-адрес
      status: 'Активно',
      lastService: new Date(),
      typeWagonsId: typeWagon1.id,
      numberWagonId: numberWagon2.id,
      photo: '/images/equipment6.jpg'
    }
  })

  console.log('Базовые данные созданы успешно!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })