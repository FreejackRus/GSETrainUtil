import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createApplication = async (req: Request, res: Response) => {
  try {
    console.log("=== Создание/обновление заявки ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);
    
    const {
      id, // Для обновления существующего черновика
      applicationDate,
      typeWork,
      trainNumber,
      carriageType,
      carriageNumber,
      equipment, // Массив оборудования
      completedJob,
      currentLocation,
      carriagePhoto,
      generalPhoto,
      finalPhoto,
      userId,
      userName,
      userRole,
      status = "completed", // По умолчанию завершенная заявка
    } = req.body;
    
    console.log("Extracted data:", {
      id,
      status,
      typeWork,
      trainNumber,
      carriageType,
      carriageNumber,
      userId,
      userName,
      userRole,
      equipmentCount: equipment?.length || 0
    });
    
    // Валидация userId - обязательно для всех заявок (включая черновики)
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId обязателен для создания заявки",
      });
    }
    
    // Валидация обязательных полей для завершенной заявки
    if (status === "completed") {
      if (
        !typeWork ||
        !trainNumber ||
        !carriageType ||
        !carriageNumber ||
        !equipment ||
        !Array.isArray(equipment) ||
        equipment.length === 0 ||
        !completedJob ||
        !currentLocation ||
        !userName ||
        !userRole
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Все обязательные поля должны быть заполнены для завершенной заявки",
        });
      }

      // Валидация каждого элемента оборудования
      for (const item of equipment) {
        if (
          !item.equipmentType ||
          !item.serialNumber ||
          !item.quantity
        ) {
          return res.status(400).json({
            success: false,
            message: "Тип оборудования, серийный номер и количество обязательны для заполнения",
          });
        }
        
        // MAC адрес обязателен только для определенных типов оборудования
        const needsMac = item.equipmentType.toLowerCase().includes('точка доступа') || 
                         item.equipmentType.toLowerCase().includes('маршрутизатор') ||
                         item.equipmentType.toLowerCase().includes('коммутатор');
        
        if (needsMac && !item.macAddress) {
          return res.status(400).json({
            success: false,
            message: `MAC адрес обязателен для оборудования типа "${item.equipmentType}"`,
          });
        }
      }
    }

    // Если это обновление существующего черновика
    if (id) {
      const existingRequest = await prisma.request.findUnique({
        where: { id: parseInt(id) },
        include: { requestEquipment: true },
      });

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          message: "Заявка не найдена",
        });
      }

      // Удаляем старые связи с оборудованием
      await prisma.requestEquipment.deleteMany({
        where: { requestId: parseInt(id) },
      });
    }

    const [
      typeWorkRecord,
      trainRecord,
      carriageRecord,
      completedJobRecord,
      locationRecord,
    ] = await Promise.all([
      typeWork ? prisma.typeWork.findFirst({ where: { name: typeWork } }) : null,
      trainNumber ? prisma.train.findFirst({ where: { number: trainNumber } }) : null,
      carriageNumber ? prisma.carriage.findFirst({ where: { number: carriageNumber } }) : null,
      completedJob ? prisma.completedJob.findFirst({ where: { name: completedJob } }) : null,
      currentLocation ? prisma.currentLocation.findFirst({ where: { name: currentLocation } }) : null,
    ]);

    if (status === "completed") {
      if (
        !typeWorkRecord ||
        !trainRecord ||
        !carriageRecord ||
        !completedJobRecord ||
        !locationRecord
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Невозможно найти один из справочников: тип работ, поезд, вагон, выполненная работа или местоположение.",
        });
      }
    }

    const requestData: any = {
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      typeWorkId: typeWorkRecord?.id || null,
      trainId: trainRecord?.id || null,
      carriageId: carriageRecord?.id || null,
      completedJobId: completedJobRecord?.id || null,
      currentLocationId: locationRecord?.id || null,
      carriagePhoto: carriagePhoto || null,
      generalPhoto: generalPhoto || null,
      finalPhoto: finalPhoto || null,
      status,
      userId: parseInt(userId), // userId всегда обязателен
    };
    let request;

    if (id) {
      // Обновляем существующую заявку
      request = await prisma.request.update({
        where: { id: parseInt(id) },
        data: requestData,
      });
    } else {
      // Создаем новую заявку
      request = await prisma.request.create({
        data: requestData,
      });
    }

    // Создаем связи с оборудованием
    if (equipment && equipment.length > 0) {
      for (const item of equipment) {
        // Находим или создаем оборудование
        const searchCriteria: any = {
          type: item.equipmentType,
          serialNumber: item.serialNumber,
        };
        
        // Добавляем MAC адрес в критерии поиска только если он есть
        if (item.macAddress) {
          searchCriteria.macAddress = item.macAddress;
        } else {
          searchCriteria.macAddress = null;
        }
        
        let equipmentRecord = await prisma.equipment.findFirst({
          where: searchCriteria,
        });

        if (!equipmentRecord) {
          equipmentRecord = await prisma.equipment.create({
            data: {
              type: item.equipmentType,
              serialNumber: item.serialNumber,
              macAddress: item.macAddress || null,
              status: "active", // Adding required status field with default value
            },
          });
        }

        // Создаем связь между заявкой и оборудованием
        await prisma.requestEquipment.create({
          data: {
            requestId: request.id,
            equipmentId: equipmentRecord.id,
            quantity: parseInt(item.quantity),
          },
        });

        // Сохраняем фотографии оборудования
        if (item.photos) {
          const photoData = [];

          if (item.photos.equipmentPhoto) {
            photoData.push({
              equipmentId: equipmentRecord.id,
              photoUrl: item.photos.equipmentPhoto,
              photoType: "equipment",
            });
          }

          if (item.photos.serialPhoto) {
            photoData.push({
              equipmentId: equipmentRecord.id,
              photoUrl: item.photos.serialPhoto,
              photoType: "serial",
            });
          }

          if (item.photos.macPhoto) {
            photoData.push({
              equipmentId: equipmentRecord.id,
              photoUrl: item.photos.macPhoto,
              photoType: "mac",
            });
          }

          if (photoData.length > 0) {
            await prisma.equipmentPhoto.createMany({
              data: photoData.map((photo) => ({
                equipmentId: photo.equipmentId,
                photoPath: photo.photoUrl, // Map photoUrl to required photoPath field
                photoType: photo.photoType,
              })),
            });
          }
        }
      }
    }

    // Получаем полную информацию о созданной/обновленной заявке
    const fullRequest = await prisma.request.findUnique({
      where: { id: request.id },
      include: {
        requestEquipment: {
          include: {
            equipment: {
              include: {
                photos: true,
              },
            },
          },
        },
        typeWork: true,
        train: true,
        carriage: true,
        completedJob: true,
        currentLocation: true,
      },
    });

    console.log("=== Заявка успешно создана/обновлена ===");
    console.log("Request ID:", request.id);
    console.log("Status:", fullRequest?.status);
    
    res.status(201).json({
      success: true,
      message: id ? "Заявка успешно обновлена" : "Заявка успешно создана",
      data: fullRequest,
    });
  } catch (error) {
    console.error("=== Ошибка при создании/обновлении заявки ===");
    console.error("Error details:", error);
    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера при создании/обновлении заявки",
    });
  } finally {
    await prisma.$disconnect();
  }
};
