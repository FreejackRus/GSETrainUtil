import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Получить все черновики
export const getDrafts = async (req: Request, res: Response) => {
  try {
    // TODO: Получить userId и userRole из токена аутентификации
    const userId = parseInt(req.query.userId as string) || 2; // Временно используем ID инженера (существующий пользователь)
    const userRole = req.query.userRole as string || 'engineer'; // Временно используем роль инженера
    
    // Администраторы не должны видеть черновики
    if (userRole === 'admin') {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Инженеры видят только свои черновики
    const whereCondition = userRole === 'engineer' 
      ? { status: 'draft', userId: userId }
      : { status: 'draft' };

    const drafts = await prisma.request.findMany({
      where: whereCondition,
      include: {
        requestEquipment: {
          include: {
            equipment: {
              include: {
                photos: true
              }
            }
          }
        },
        typeWork: true,
        train: true,
        carriage: true,
        completedJob: true,
        currentLocation: true,
        user: true
      },
      orderBy: { applicationDate: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: drafts
    });

  } catch (error) {
    console.error('Ошибка при получении черновиков:', error);
    res.status(500).json({ 
      success: false,
      message: 'Внутренняя ошибка сервера при получении черновиков' 
    });
  }
};

// Завершить черновик (перевести в статус completed)
export const completeDraft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestData = req.body;

    // Проверяем, что заявка существует и является черновиком
    const existingRequest = await prisma.request.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Заявка не найдена' 
      });
    }

    if (existingRequest.status !== 'draft') {
      return res.status(400).json({ 
        success: false,
        message: 'Можно завершить только черновики' 
      });
    }

    // Валидация обязательных полей для завершенной заявки
    const { typeWork, trainNumber, carriageType, carriageNumber, equipment, completedJob, currentLocation } = requestData;
    
    if (!typeWork || !trainNumber || !carriageType || !carriageNumber || 
        !equipment || !Array.isArray(equipment) || equipment.length === 0 ||
        !completedJob || !currentLocation) {
      return res.status(400).json({
        success: false,
        message: 'Все обязательные поля должны быть заполнены для завершения заявки'
      });
    }

    // Находим или создаем связанные записи
    const [typeWorkRecord, trainRecord, completedJobRecord, currentLocationRecord] = await Promise.all([
      // TypeWork
      prisma.typeWork.upsert({
        where: { name: typeWork },
        update: {},
        create: { name: typeWork }
      }),
      // Train
      prisma.train.upsert({
        where: { number: trainNumber },
        update: {},
        create: { number: trainNumber }
      }),
      // CompletedJob
      prisma.completedJob.upsert({
        where: { name: completedJob },
        update: {},
        create: { name: completedJob }
      }),
      // CurrentLocation
      prisma.currentLocation.upsert({
        where: { name: currentLocation },
        update: {},
        create: { name: currentLocation }
      })
    ]);

    // Находим или создаем вагон
    const carriageRecord = await prisma.carriage.upsert({
      where: { 
        number_trainId: { 
          number: carriageNumber, 
          trainId: trainRecord.id 
        } 
      },
      update: { type: carriageType },
      create: { 
        number: carriageNumber, 
        type: carriageType, 
        trainId: trainRecord.id 
      }
    });

    // Подготавливаем данные для обновления заявки
    const updateData = {
      status: 'completed',
      typeWorkId: typeWorkRecord.id,
      trainId: trainRecord.id,
      carriageId: carriageRecord.id,
      completedJobId: completedJobRecord.id,
      currentLocationId: currentLocationRecord.id,
      carriagePhoto: requestData.carriagePhoto,
      generalPhoto: requestData.generalPhoto,
      finalPhoto: requestData.finalPhoto,
      userId: requestData.userId,
    };

    // Обновляем заявку
    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        requestEquipment: {
          include: {
            equipment: {
              include: {
                photos: true
              }
            }
          }
        },
        typeWork: true,
        train: true,
        carriage: true,
        completedJob: true,
        currentLocation: true,
        user: true
      }
    });

    // Обрабатываем оборудование
    if (equipment && Array.isArray(equipment)) {
      // Удаляем старые связи с оборудованием
      await prisma.requestEquipment.deleteMany({
        where: { requestId: parseInt(id) }
      });

      // Создаем новое оборудование и связи
      for (const equipmentItem of equipment) {
        // Создаем оборудование
        const equipmentRecord = await prisma.equipment.create({
          data: {
            type: equipmentItem.equipmentType,
            serialNumber: equipmentItem.serialNumber || null,
            macAddress: equipmentItem.macAddress || null,
            status: 'active',
            carriageId: carriageRecord.id
          }
        });

        // Создаем связь заявка-оборудование
        await prisma.requestEquipment.create({
          data: {
            requestId: parseInt(id),
            equipmentId: equipmentRecord.id,
            quantity: equipmentItem.quantity || 1
          }
        });

        // Создаем фотографии оборудования
        if (equipmentItem.photos) {
          const photos = [];
          
          if (equipmentItem.photos.equipmentPhoto) {
            photos.push({
              equipmentId: equipmentRecord.id,
              photoType: 'equipment',
              photoPath: equipmentItem.photos.equipmentPhoto,
              description: 'Фото оборудования'
            });
          }
          
          if (equipmentItem.photos.serialPhoto) {
            photos.push({
              equipmentId: equipmentRecord.id,
              photoType: 'serial',
              photoPath: equipmentItem.photos.serialPhoto,
              description: 'Фото серийного номера'
            });
          }
          
          if (equipmentItem.photos.macPhoto) {
            photos.push({
              equipmentId: equipmentRecord.id,
              photoType: 'mac',
              photoPath: equipmentItem.photos.macPhoto,
              description: 'Фото MAC адреса'
            });
          }

          if (photos.length > 0) {
            await prisma.equipmentPhoto.createMany({
              data: photos
            });
          }
        }
      }
    }

    // Получаем обновленные данные заявки с оборудованием
    const finalRequest = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: {
        requestEquipment: {
          include: {
            equipment: {
              include: {
                photos: true
              }
            }
          }
        },
        typeWork: true,
        train: true,
        carriage: true,
        completedJob: true,
        currentLocation: true,
        user: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Черновик успешно завершен',
      data: finalRequest
    });

  } catch (error) {
    console.error('Ошибка при завершении черновика:', error);
    res.status(500).json({ 
      success: false,
      message: 'Внутренняя ошибка сервера при завершении черновика' 
    });
  }
};

// Удалить черновик
export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем, что заявка существует и является черновиком
    const existingRequest = await prisma.request.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Заявка не найдена' 
      });
    }

    if (existingRequest.status !== 'draft') {
      return res.status(400).json({ 
        success: false,
        message: 'Можно удалить только черновики' 
      });
    }

    // Удаляем связи с оборудованием
    await prisma.requestEquipment.deleteMany({
      where: { requestId: parseInt(id) }
    });

    // Удаляем заявку
    await prisma.request.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Черновик успешно удален'
    });

  } catch (error) {
    console.error('Ошибка при удалении черновика:', error);
    res.status(500).json({ 
      success: false,
      message: 'Внутренняя ошибка сервера при удалении черновика' 
    });
  }
};