import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Начинаю заполнение базы данных...");

  // 1. Пользователи
  const [adminPwd, engPwd] = await Promise.all([
    bcrypt.hash("admin", 10),
    bcrypt.hash("engineer", 10),
  ]);

  const admin = await prisma.user.upsert({
    where: { login: "admin" },
    update: {},
    create: {
      login:    "admin",
      password: adminPwd,
      role:     "admin",
      name:     "Администратор",
    },
  });

  const engineer = await prisma.user.upsert({
    where: { login: "engineer" },
    update: {},
    create: {
      login:    "engineer",
      password: engPwd,
      role:     "engineer",
      name:     "Инженер",
    },
  });

  // 2. Справочники: TypeWork, CompletedJob, CurrentLocation
  const [tw1, tw2, tw3] = await Promise.all([
    prisma.typeWork.upsert({ where: { name: "Монтаж"       }, update: {}, create: { name: "Монтаж"       } }),
    prisma.typeWork.upsert({ where: { name: "Демонтаж"     }, update: {}, create: { name: "Демонтаж"     } }),
    prisma.typeWork.upsert({ where: { name: "Обслуживание" }, update: {}, create: { name: "Обслуживание" } }),
  ]);

  const [cj1, cj2, cj3] = await Promise.all([
    prisma.completedJob.upsert({ where: { name: "Перемена"           }, update: {}, create: { name: "Перемена"           } }),
    prisma.completedJob.upsert({ where: { name: "Подрядчик"         }, update: {}, create: { name: "Подрядчик"         } }),
    prisma.completedJob.upsert({ where: { name: "Внутренние ресурсы" }, update: {}, create: { name: "Внутренние ресурсы" } }),
  ]);

  const [loc1, loc2, loc3] = await Promise.all([
    prisma.currentLocation.upsert({ where: { name: "Депо №1"        }, update: {}, create: { name: "Депо №1"        } }),
    prisma.currentLocation.upsert({ where: { name: "Депо №2"        }, update: {}, create: { name: "Депо №2"        } }),
    prisma.currentLocation.upsert({ where: { name: "Ремонтная база" }, update: {}, create: { name: "Ремонтная база" } }),
  ]);

  // 3. Поезда
  const [train1, train2, train3] = await Promise.all([
    prisma.train.upsert({ where: { number: "001" }, update: {}, create: { number: "001" } }),
    prisma.train.upsert({ where: { number: "002" }, update: {}, create: { number: "002" } }),
    prisma.train.upsert({ where: { number: "003" }, update: {}, create: { number: "003" } }),
  ]);

  // 4. Вагоны
  const [car1, car2, car3, car4, car5] = await Promise.all([
    prisma.carriage.upsert({
      where: { number_trainId: { number: "В-001", trainId: train1.id } },
      update: {},
      create: { number: "В-001", type: "Пассажирский", trainId: train1.id },
    }),
    prisma.carriage.upsert({
      where: { number_trainId: { number: "В-002", trainId: train1.id } },
      update: {},
      create: { number: "В-002", type: "Грузовой", trainId: train1.id },
    }),
    prisma.carriage.upsert({
      where: { number_trainId: { number: "В-003", trainId: train2.id } },
      update: {},
      create: { number: "В-003", type: "Багажный", trainId: train2.id },
    }),
    prisma.carriage.upsert({
      where: { number_trainId: { number: "В-004", trainId: train2.id } },
      update: {},
      create: { number: "В-004", type: "Почтовый", trainId: train2.id },
    }),
    prisma.carriage.upsert({
      where: { number_trainId: { number: "В-005", trainId: train3.id } },
      update: {},
      create: { number: "В-005", type: "Служебный", trainId: train3.id },
    }),
  ]);

  // 5. Оборудование
  const [eq1, eq2, eq3, eq4, eq5] = await Promise.all([
    prisma.equipment.create({
      data: {
        name:         "GSE Terminal #1",
        serialNumber: "GSE-TRM-001",
        macAddress:   "00:11:22:33:44:55",
        lastService:  new Date(),
        carriageId:   car1.id,
      },
    }),
    prisma.equipment.create({
      data: {
        name:         "GSE Router #1",
        serialNumber: "GSE-RTR-002",
        macAddress:   "00:11:22:33:44:66",
        lastService:  new Date(),
        carriageId:   car2.id,
      },
    }),
    prisma.equipment.create({
      data: {
        name:         "GSE Switch #1",
        serialNumber: "GSE-SWT-003",
        macAddress:   "00:11:22:33:44:77",
        lastService:  new Date(),
        carriageId:   car3.id,
      },
    }),
    prisma.equipment.create({
      data: {
        name:         "GSE AP #1",
        serialNumber: "GSE-AP-004",
        macAddress:   "00:11:22:33:44:88",
        lastService:  new Date(),
        carriageId:   car4.id,
      },
    }),
    prisma.equipment.create({
      data: {
        name:         "GSE Controller #1",
        serialNumber: "GSE-CTL-005",
        macAddress:   "00:11:22:33:44:99",
        lastService:  new Date(),
        carriageId:   car5.id,
      },
    }),
  ]);

  // 6. Тестовые заявки
  console.log("📝 Создаю заявки...");

  await prisma.request.create({
    data: {
      status:            "draft",
      userId:            engineer.id,
      currentLocationId: loc1.id,
      completedJobId:    cj1.id,
      photo:             "/uploads/requests/draft1.jpg",
      requestTrains:     { create: [{ trainId: train1.id }] },
      requestCarriages:  { create: [{ carriageId: car1.id, carriagePhoto: "/uploads/requests/car1.jpg" }] },
      requestEquipments: {
        create: [
          {
            equipmentId: eq1.id,
            typeWorkId:  tw1.id,
            photos: {
              create: [
                { photoType: "equipment", photoPath: "/uploads/req_eq/1_eq.jpg" },
                { photoType: "serial",    photoPath: "/uploads/req_eq/1_serial.jpg" },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.request.create({
    data: {
      status:            "completed",
      userId:            admin.id,
      currentLocationId: loc2.id,
      completedJobId:    cj2.id,
      photo:             "/uploads/requests/final2.jpg",
      requestTrains:     { create: [{ trainId: train2.id }] },
      requestCarriages:  { create: [{ carriageId: car3.id, carriagePhoto: "/uploads/requests/car3.jpg" }] },
      requestEquipments: {
        create: [
          {
            equipmentId: eq3.id,
            typeWorkId:  tw2.id,
            photos: {
              create: [
                { photoType: "equipment", photoPath: "/uploads/req_eq/3_eq.jpg" },
                { photoType: "mac",       photoPath: "/uploads/req_eq/3_mac.jpg" },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ База заполнена");
}

main()
    .catch(e => {
      console.error("❌ Ошибка при заполнении:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
