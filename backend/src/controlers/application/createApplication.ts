import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const createApplication = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    
    const {
      applicationNumber,
      applicationDate,
      typeWorkId,
      trainId,
      carriageId,
      equipmentId,
      countEquipment,
      completedJobId,
      currentLocationId,
      userId
    } = req.body;

    // Валидация обязательных полей
    if (!applicationNumber || !typeWorkId || !trainId || !carriageId || 
        !equipmentId || !countEquipment || !completedJobId || !currentLocationId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Не все обязательные поля заполнены"
      });
    }

    // Создаем заявку
    const newApplication = await prisma.request.create({
      data: {
        applicationNumber: parseInt(applicationNumber),
        applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
        typeWorkId: parseInt(typeWorkId),
        trainId: parseInt(trainId),
        carriageId: parseInt(carriageId),
        equipmentId: parseInt(equipmentId),
        countEquipment: parseInt(countEquipment),
        completedJobId: parseInt(completedJobId),
        currentLocationId: parseInt(currentLocationId),
        userId: parseInt(userId)
      },
      include: {
        typeWork: true,
        train: true,
        carriage: true,
        equipment: true,
        completedJob: true,
        currentLocation: true,
        user: true
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