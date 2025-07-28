import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";

const getRequestsTechnicalWorkLog = async () => {
  try {
    const prisma = new PrismaClient();

    const getRequestsTechnicalWorkLog =
      await prisma.requestsTechnicalWorkLog.findMany({
        include: {
          connectionCurrentLocation: true,
          connectionEquipment: {
            include: {
              connectionNumberWagon: true,
              connectionTypeWagons: true,
            },
          },
          connectionTrainNumber: true,
          connectionTypeWork: true,
        },
      });
    await prisma.$disconnect();
    return getRequestsTechnicalWorkLog;
  } catch (e) {
    console.log(e);
  }
};
getRequestsTechnicalWorkLog().then((data) => {
  const transform = data?.map((item) => ({
    id: item.id,
    applicationNumber: item.applicationNumber,
    typeWork: item.connectionTypeWork.typeWork,
    trainNumber: item.connectionTrainNumber.trainNumber,
    equipment: {
      type: item.connectionEquipment.type,
      snNumber: item.connectionEquipment.snNumber || null,
      mac: item.connectionEquipment.mac || null,
      numberWagon: item.connectionEquipment.connectionNumberWagon.numberWagon,
    },
  }));
  console.log(transform);
});
