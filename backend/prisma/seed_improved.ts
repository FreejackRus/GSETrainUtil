// import { PrismaClient } from '../generated/prisma'
// import bcrypt from 'bcrypt'

// const prisma = new PrismaClient()

// async function main() {
//   // Хешируем пароли
//   const adminPasswordHash = await bcrypt.hash('admin', 10)
//   const engineerPasswordHash = await bcrypt.hash('engineer', 10)

//   // Создаем пользователей
//   const admin = await prisma.user.upsert({
//     where: { login: 'admin' },
//     update: {},
//     create: {
//       login: 'admin',
//       password: adminPasswordHash,
//       role: 'admin',
//       name: 'Администратор',
//     },
//   })

//   const engineer = await prisma.user.upsert({
//     where: { login: 'engineer' },
//     update: {},
//     create: {
//       login: 'engineer',
//       password: engineerPasswordHash,
//       role: 'engineer',
//       name: 'Инженер',
//     },
//   })

//   // Создаем записи в справочниках
//   const typeWorkMontage = await prisma.typeWork.upsert({
//     where: { name: 'Монтаж' },
//     update: {},
//     create: { name: 'Монтаж' },
//   })

//   const typeWorkDismantle = await prisma.typeWork.upsert({
//     where: { name: 'Демонтаж' },
//     update: {},
//     create: { name: 'Демонтаж' },
//   })

//   const completedJobBreak = await prisma.completedJob.upsert({
//     where: { name: 'Перемена' },
//     update: {},
//     create: { name: 'Перемена' },
//   })

//   const completedJobContractor = await prisma.completedJob.upsert({
//     where: { name: 'Подрядчик' },
//     update: {},
//     create: { name: 'Подрядчик' },
//   })

//   const location1 = await prisma.currentLocation.upsert({
//     where: { name: 'Депо №1' },
//     update: {},
//     create: { name: 'Депо №1' },
//   })

//   const location2 = await prisma.currentLocation.upsert({
//     where: { name: 'Депо №2' },
//     update: {},
//     create: { name: 'Депо №2' },
//   })

//   // Создаем поезда
//   const train001 = await prisma.train.upsert({
//     where: { number: '001' },
//     update: {},
//     create: { number: '001' },
//   })

//   const train002 = await prisma.train.upsert({
//     where: { number: '002' },
//     update: {},
//     create: { number: '002' },
//   })

//   // Создаем вагоны (уникальность number + trainId)
//   // Для upsert с составным ключом используем findFirst + create/update

//   async function upsertCarriage(number: string, type: string, trainId: number) {
//     const existing = await prisma.carriage.findFirst({
//       where: { number, trainId },
//     })
//     if (existing) {
//       return prisma.carriage.update({
//         where: { id: existing.id },
//         data: { type },
//       })
//     } else {
//       return prisma.carriage.create({
//         data: { number, type, trainId },
//       })
//     }
//   }

//   const carriage1 = await upsertCarriage('В-001', 'Пассажирский', train001.id)
//   const carriage2 = await upsertCarriage('В-002', 'Грузовой', train001.id)
//   const carriage3 = await upsertCarriage('В-003', 'Багажный', train002.id)

//   // Создаем оборудование
//   async function upsertEquipment(
//   id: number,
//   data: {
//     type: string
//     serialNumber?: string | null
//     macAddress?: string | null
//     status: string
//     lastService?: Date | null
//     carriageId: number
//     photos?: { photoType: string; photoPath: string; description?: string }[]
//   }
// ) {
//   // Подготовим поле photos для Prisma
//   let photosData = undefined
//   if (data.photos) {
//     photosData = {
//       create: data.photos.map(({ photoType, photoPath, description }) => ({
//         photoType,
//         photoPath,
//         description,
//       })),
//     }
//   }

//   // Создаем объект для передачи в Prisma, без поля photos из data
//   const dataForPrisma = {
//     type: data.type,
//     serialNumber: data.serialNumber ?? null,
//     macAddress: data.macAddress ?? null,
//     status: data.status,
//     lastService: data.lastService ?? null,
//     carriageId: data.carriageId,
//     ...(photosData ? { photos: photosData } : {}),
//   }

//   const existing = await prisma.equipment.findUnique({ where: { id } })
//   if (existing) {
//     return prisma.equipment.update({
//       where: { id },
//       data: dataForPrisma,
//     })
//   } else {
//     return prisma.equipment.create({
//       data: dataForPrisma,
//     })
//   }
// }

//   const now = new Date()

//   const equipment1 = await upsertEquipment(1, {
//     type: 'GSE Terminal',
//     serialNumber: 'GSE-TRM-001',
//     macAddress: '00:11:22:33:44:55',
//     status: 'Активно',
//     lastService: now,
//     carriageId: carriage1.id,
//   })

//   const equipment2 = await upsertEquipment(2, {
//     type: 'GSE Router',
//     serialNumber: 'GSE-RTR-002',
//     macAddress: '00:11:22:33:44:66',
//     status: 'Неактивно',
//     lastService: now,
//     carriageId: carriage2.id,
//   })

//   const equipment3 = await upsertEquipment(3, {
//     type: 'GSE Switch',
//     serialNumber: 'GSE-SWT-003',
//     macAddress: '00:11:22:33:44:77',
//     status: 'Активно',
//     lastService: now,
//     carriageId: carriage3.id,
//   })


//   console.log('Базовые данные созданы успешно!')
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
