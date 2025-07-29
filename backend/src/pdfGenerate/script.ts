import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getGroupedEquipmentByTrain(applicationNumber: number) {
  // Получаем заявку с оборудованием
  const request = await prisma.requests.findUnique({
    where: { applicationNumber },
    select: {
      trainNumber: true,
      carriageType: true,
      carriageNumber: true,
      requestEquipment: {
        select: {
          equipmentType: true,
          serialNumber: true,
          countEquipment: true,
        }
      }
    }
  });
  console.log(request);
  
  if (!request) return [];

  // Для каждого requestEquipment подтягиваем equipment с вагонами (через связи)
  const detailedEquipments = await Promise.all(
    request.requestEquipment.map(async (reqEq) => {
      const eq = await prisma.equipment.findFirst({
        where: {
          type: reqEq.equipmentType,
          snNumber: reqEq.serialNumber || undefined,
        },
        select: {
          snNumber: true,
          type: true,
          connectionTypeWagons: { select: { typeWagon: true } },
          connectionNumberWagon: { select: { numberWagon: true } },
        }
      });

      return {
        numberWagon: eq?.connectionNumberWagon?.numberWagon || request.carriageNumber,
        typeWagon: eq?.connectionTypeWagons?.typeWagon || request.carriageType,
        name: reqEq.equipmentType,
        snNumber: reqEq.serialNumber || eq?.snNumber || null,
        count: reqEq.countEquipment,
      };
    })
  );

  // Группируем по вагону (номер + тип)
  const wagonsMap = new Map<string, {
    numberWagon: string,
    typeWagon: string,
    equipment: { name: string, snNumber: string | null, count: number }[]
  }>();

  for (const item of detailedEquipments) {
    const key = `${item.numberWagon}||${item.typeWagon}`;
    if (!wagonsMap.has(key)) {
      wagonsMap.set(key, {
        numberWagon: item.numberWagon,
        typeWagon: item.typeWagon,
        equipment: [],
      });
    }
    wagonsMap.get(key)!.equipment.push({
      name: item.name,
      snNumber: item.snNumber,
      count: item.count,
    });
  }

  return [
    {
      numberTrain: request.trainNumber,
      equipment: Array.from(wagonsMap.values()),
    }
  ];
}



getGroupedEquipmentByTrain(7)
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  })
  .finally(() => prisma.$disconnect());
