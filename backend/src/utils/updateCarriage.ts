import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetCarriageId() {
  try {
    const typeWordInstId = await prisma.typeWork.findMany({
      where: {
        name: {
          startsWith: "Монтаж",
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });
    
    const arrTypeWordInstId = typeWordInstId.map((item) => item.id);

    for (const id of arrTypeWordInstId) {
      const equipmentsToReset = await prisma.requestEquipment.findMany({
        where: {
          typeWorkId: { not: id },
        },
        select: { equipmentId: true },
      });

      const ids = equipmentsToReset.map((e) => e.equipmentId);

      if (ids.length > 0) {
        const updated = await prisma.equipment.updateMany({
          where: { id: { in: ids } },
          data: { carriageId: null },
        });
        console.log("Обновлено записей:", updated.count);
      } else {
        console.log("Нет записей для обновления для typeWorkId =", id);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

resetCarriageId();
