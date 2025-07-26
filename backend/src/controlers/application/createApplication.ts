import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";

export const createApplication = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    
    const {
      applicationNumber,
      typeWorkId,
      trainNumberId,
      carriageNumber,
      equipmentId,
      countEquipment,
      completedJobId,
      currentLocationId,
      carriagePhoto,
      equipmentPhoto,
      serialPhoto,
      macPhoto,
      generalPhoto,
      finalPhoto,
      userId
    } = req.body;

    // Валидация обязательных полей
    if (!applicationNumber || !typeWorkId || !trainNumberId || !carriageNumber || 
        !equipmentId || !countEquipment || !completedJobId || !currentLocationId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Не все обязательные поля заполнены"
      });
    }

    const newApplication = await prisma.requestsTechnicalWorkLog.create({
      data: {
        applicationNumber: parseInt(applicationNumber),
        typeWorkId: parseInt(typeWorkId),
        trainNumberId: parseInt(trainNumberId),
        carriageNumber,
        equipmentId: parseInt(equipmentId),
        countEquipment: parseInt(countEquipment),
        completedJobId: parseInt(completedJobId),
        currentLocationId: parseInt(currentLocationId),
        carriagePhoto,
        equipmentPhoto,
        serialPhoto,
        macPhoto,
        generalPhoto,
        finalPhoto,
        userId: parseInt(userId)
      },
      include: {
        connectionTypeWork: true,
        connectionTrainNumber: true,
        connectionEquipment: true,
        connectionCompletedJob: true,
        connectionCurrentLocation: true,
        connectionUser: true
      }
    });

    await prisma.$disconnect();
    
    res.status(201).json({
      success: true,
      message: "Заявка успешно создана",
      data: newApplication
    });
    
  } catch (error) {
    console.error("Ошибка при создании заявки:", error);
    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера"
    });
  }
};