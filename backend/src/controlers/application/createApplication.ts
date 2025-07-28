import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const createApplication = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    
    const {
      applicationNumber,
      applicationDate,
      typeWork,
      trainNumber,
      carriageType,
      carriageNumber,
      equipment, // Массив оборудования с деталями
      completedJob,
      currentLocation,
      carriagePhoto,
      generalPhoto,
      finalPhoto,
      userId,
      userName,
      userRole
    } = req.body;

    // Валидация обязательных полей
    if (!applicationNumber || !typeWork || !trainNumber || !carriageNumber || 
        !completedJob || !currentLocation || !userId) {
      return res.status(400).json({
        success: false,
        message: "Не все обязательные поля заполнены"
      });
    }

    // Создаем заявку с оборудованием
    const newApplication = await prisma.requests.create({
      data: {
        applicationNumber: parseInt(applicationNumber),
        applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
        typeWork: typeWork,
        trainNumber: trainNumber,
        carriageType: carriageType || "default",
        carriageNumber,
        completedJob: completedJob,
        currentLocation: currentLocation,
        carriagePhoto,
        generalPhoto,
        finalPhoto,
        userId: parseInt(userId),
        userName: userName || "default",
        userRole: userRole || "default",
        // Создаем связанное оборудование
        requestEquipment: {
          create: equipment && Array.isArray(equipment) ? equipment.map((eq: any) => ({
            equipmentType: eq.equipmentType || eq.type,
            serialNumber: eq.serialNumber,
            macAddress: eq.macAddress,
            countEquipment: eq.countEquipment || eq.count || 1,
            equipmentPhoto: eq.equipmentPhoto,
            serialPhoto: eq.serialPhoto,
            macPhoto: eq.macPhoto
          })) : []
        }
      },
      include: {
        requestEquipment: true
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