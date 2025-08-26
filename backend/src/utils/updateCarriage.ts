import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetCarriageId() {
  try {
    // 1. Получаем список equipmentId с typeWorkId != 3
    const equipmentsToReset = await prisma.requestEquipment.findMany({
      where: {
        typeWorkId: { not: 3 },
      },
      select: { equipmentId: true },
    });

    const ids = equipmentsToReset.map((e) => e.equipmentId);

    // 2. Обновляем carriageId у этих equipment
    const updated = await prisma.equipment.updateMany({
      where: { id: { in: ids } },
      data: { carriageId: null },
    });

    console.log("Обновлено записей:", updated.count);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

resetCarriageId();
