// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Начинаю заполнение базы данных...");

  // 1) Пользователи
  const [adminPwd, engPwd] = await Promise.all([
    bcrypt.hash("admin", 10),
    bcrypt.hash("engineer", 10),
  ]);

  const admin = await prisma.user.upsert({
    where: { login: "admin" },
    update: {},
    create: {
      login: "admin",
      password: adminPwd,
      role: "admin",
      name: "Администратор",
    },
  });

  const engineer = await prisma.user.upsert({
    where: { login: "engineer" },
    update: {},
    create: {
      login: "engineer",
      password: engPwd,
      role: "engineer",
      name: "Инженер",
    },
  });

  // 2) Справочники
  const [twInstall, twUninstall, twService] = await Promise.all([
    prisma.typeWork.upsert({ where: { name: "Монтаж" }, update: {}, create: { name: "Монтаж" } }),
    prisma.typeWork.upsert({ where: { name: "Демонтаж" }, update: {}, create: { name: "Демонтаж" } }),
    prisma.typeWork.upsert({ where: { name: "Обслуживание" }, update: {}, create: { name: "Обслуживание" } }),
  ]);

  const [perf1, perf2, perf3] = await Promise.all([
    prisma.performer.upsert({ where: { name: "Перемена" }, update: {}, create: { name: "Перемена" } }),
    prisma.performer.upsert({ where: { name: "Подрядчик" }, update: {}, create: { name: "Подрядчик" } }),
    prisma.performer.upsert({ where: { name: "Внутренние ресурсы" }, update: {}, create: { name: "Внутренние ресурсы" } }),
  ]);

  const [loc1, loc2, loc3] = await Promise.all([
    prisma.currentLocation.upsert({ where: { name: "Депо №1" }, update: {}, create: { name: "Депо №1" } }),
    prisma.currentLocation.upsert({ where: { name: "Депо №2" }, update: {}, create: { name: "Депо №2" } }),
    prisma.currentLocation.upsert({ where: { name: "Ремонтная база" }, update: {}, create: { name: "Ремонтная база" } }),
  ]);

  // 3) Поезда
  const [train1, train2, train3] = await Promise.all([
    prisma.train.upsert({ where: { number: "001" }, update: {}, create: { number: "001" } }),
    prisma.train.upsert({ where: { number: "002" }, update: {}, create: { number: "002" } }),
    prisma.train.upsert({ where: { number: "003" }, update: {}, create: { number: "003" } }),
  ]);

  // 4) Вагоны (без привязки к поезду в доменной модели)
  const [car1, car2, car3, car4, car5] = await Promise.all([
    prisma.carriage.upsert({ where: { number: "В-001" }, update: {}, create: { number: "В-001", type: "Пассажирский" } }),
    prisma.carriage.upsert({ where: { number: "В-002" }, update: {}, create: { number: "В-002", type: "Грузовой" } }),
    prisma.carriage.upsert({ where: { number: "В-003" }, update: {}, create: { number: "В-003", type: "Багажный" } }),
    prisma.carriage.upsert({ where: { number: "В-004" }, update: {}, create: { number: "В-004", type: "Почтовый" } }),
    prisma.carriage.upsert({ where: { number: "В-005" }, update: {}, create: { number: "В-005", type: "Служебный" } }),
  ]);

  // 5) Оборудование (часть установим в вагоны как текущее состояние)
  const now = new Date();
  const [eq1, eq2, eq3, eq4, eq5] = await Promise.all([
    prisma.equipment.create({ data: { name: "GSE Terminal #1",   serialNumber: "GSE-TRM-001", macAddress: "00:11:22:33:44:55", lastService: now, carriageId: car1.id } }),
    prisma.equipment.create({ data: { name: "GSE Router #1",     serialNumber: "GSE-RTR-002", macAddress: "00:11:22:33:44:66", lastService: now, carriageId: car2.id } }),
    prisma.equipment.create({ data: { name: "GSE Switch #1",     serialNumber: "GSE-SWT-003", macAddress: "00:11:22:33:44:77", lastService: now, carriageId: car3.id } }),
    prisma.equipment.create({ data: { name: "GSE AP #1",         serialNumber: "GSE-AP-004",  macAddress: "00:11:22:33:44:88", lastService: now, carriageId: car4.id } }),
    prisma.equipment.create({ data: { name: "GSE Controller #1", serialNumber: "GSE-CTL-005", macAddress: "00:11:22:33:44:99", lastService: now, carriageId: car5.id } }),
  ]);

  // 6) Заявка #1 (draft): вложенно создаём поезда → вагоны → фото вагона
  console.log("📝 Создаю заявку #1 (draft)...");
  const req1 = await prisma.request.create({
    data: {
      status: "draft",
      userId: engineer.id,
      currentLocationId: loc1.id,
      performerId: perf1.id,
      requestTrains: {
        create: [
          {
            trainId: train1.id,
            requestCarriages: {
              create: [
                {
                  carriageId: car1.id,
                  carriagePhotos: {
                    create: [
                      { photoType: "carriage",  photoPath: "/uploads/request_carriage/V-001_number.jpg" },
                      { photoType: "equipment", photoPath: "/uploads/request_carriage/V-001_group.jpg" },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      requestTrains: { include: { requestCarriages: true } },
    },
  });

  const rc1 = req1.requestTrains[0].requestCarriages[0];

  // Для заявки #1: связь с оборудованием + фото оборудования
  await prisma.requestEquipment.create({
    data: {
      requestId: req1.id,
      requestCarriageId: rc1.id,
      equipmentId: eq1.id,
      typeWorkId: twInstall.id,
      photos: {
        create: [
          { photoType: "equipment", photoPath: "/uploads/request_equipment/1_eq.jpg" },
          { photoType: "serial",    photoPath: "/uploads/request_equipment/1_serial.jpg" },
        ],
      },
    },
  });

  // 7) Заявка #2 (completed)
  console.log("📝 Создаю заявку #2 (completed)...");
  const req2 = await prisma.request.create({
    data: {
      status: "completed",
      userId: admin.id,
      currentLocationId: loc2.id,
      performerId: perf2.id,
      requestTrains: {
        create: [
          {
            trainId: train2.id,
            requestCarriages: {
              create: [
                {
                  carriageId: car3.id,
                  carriagePhotos: {
                    create: [
                      { photoType: "carriage",  photoPath: "/uploads/request_carriage/V-003_number.jpg" },
                      { photoType: "equipment", photoPath: "/uploads/request_carriage/V-003_group.jpg" },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      requestTrains: { include: { requestCarriages: true } },
    },
  });

  const rc2 = req2.requestTrains[0].requestCarriages[0];

  await prisma.requestEquipment.create({
    data: {
      requestId: req2.id,
      requestCarriageId: rc2.id,
      equipmentId: eq3.id,
      typeWorkId: twUninstall.id,
      photos: {
        create: [
          { photoType: "equipment", photoPath: "/uploads/request_equipment/3_eq.jpg" },
          { photoType: "mac",       photoPath: "/uploads/request_equipment/3_mac.jpg" },
        ],
      },
    },
  });

  console.log("✅ База заполнена");
}

main()
    .catch((e) => {
      console.error("❌ Ошибка при заполнении:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
