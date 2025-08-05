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
        requestCarriages: {
          include: {
            carriage: {
              include: {
                train: true,
              },
            },
          },
        },
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
    const { typeWork, trainNumber, carriages, equipment, completedJob, currentLocation } = requestData;
    
    console.log('=== ВАЛИДАЦИЯ ДАННЫХ ===');
    console.log('typeWork:', typeWork);
    console.log('trainNumber:', trainNumber);
    console.log('carriages:', carriages);
    console.log('equipment:', equipment);
    console.log('completedJob:', completedJob);
    console.log('currentLocation:', currentLocation);
    
    if (!typeWork || !trainNumber || !carriages || !Array.isArray(carriages) || carriages.length === 0 ||
        !equipment || !Array.isArray(equipment) || equipment.length === 0 ||
        !completedJob || !currentLocation) {
      console.log('=== ОШИБКА ВАЛИДАЦИИ ===');
      console.log('typeWork valid:', !!typeWork);
      console.log('trainNumber valid:', !!trainNumber);
      console.log('carriages valid:', !!(carriages && Array.isArray(carriages) && carriages.length > 0));
      console.log('equipment valid:', !!(equipment && Array.isArray(equipment) && equipment.length > 0));
      console.log('completedJob valid:', !!completedJob);
      console.log('currentLocation valid:', !!currentLocation);
      
      return res.status(400).json({
        success: false,
        message: 'Все обязательные поля должны быть заполнены для завершения заявки'
      });
    }

    console.log('=== ВАЛИДАЦИЯ ВАГОНОВ ===');
    // Проверяем, что у каждого вагона есть обязательные поля
    for (const carriage of carriages) {
      console.log('Проверяем вагон:', carriage);
      if (!carriage.carriageType || !carriage.carriageNumber) {
        console.log('ОШИБКА: Вагон не прошел валидацию');
        return res.status(400).json({
          success: false,
          message: 'Все вагоны должны иметь тип и номер'
        });
      }
    }
    console.log('Все вагоны прошли валидацию');

    console.log('=== ВАЛИДАЦИЯ ОБОРУДОВАНИЯ ===');
    // Проверяем, что у каждого оборудования есть обязательные поля
    for (const item of equipment) {
      console.log('Проверяем оборудование:', item);
      if (!item.equipmentType || !item.serialNumber || item.quantity === undefined) {
        console.log('ОШИБКА: Оборудование не прошло валидацию');
        return res.status(400).json({
          success: false,
          message: 'Все оборудование должно иметь тип, серийный номер и количество'
        });
      }

      // Проверяем MAC-адрес для сетевого оборудования
      const networkEquipmentTypes = ['точка доступа', 'маршрутизатор', 'коммутатор'];
      const isNetworkEquipment = networkEquipmentTypes.some(type => 
        item.equipmentType.toLowerCase().includes(type.toLowerCase())
      );
      
      console.log('Сетевое оборудование?', isNetworkEquipment, 'MAC:', item.macAddress);
      
      if (isNetworkEquipment && !item.macAddress) {
        console.log('ОШИБКА: MAC-адрес отсутствует для сетевого оборудования');
        return res.status(400).json({
          success: false,
          message: `MAC-адрес обязателен для оборудования типа "${item.equipmentType}"`
        });
      }
    }
    console.log('Все оборудование прошло валидацию');

    console.log('=== ПОИСК СВЯЗАННЫХ ЗАПИСЕЙ ===');
    // Находим или создаем связанные записи
    const [typeWorkRecord, trainRecord, completedJobRecord, currentLocationRecord] = await Promise.all([
      // TypeWork
      (async () => {
        console.log('Ищем тип работы:', typeWork);
        const record = await prisma.typeWork.upsert({
          where: { name: typeWork },
          update: {},
          create: { name: typeWork }
        });
        console.log('Тип работы найден/создан:', record.id);
        return record;
      })(),
      // Train
      (async () => {
        console.log('Ищем поезд:', trainNumber);
        const record = await prisma.train.upsert({
          where: { number: trainNumber },
          update: {},
          create: { number: trainNumber }
        });
        console.log('Поезд найден/создан:', record.id);
        return record;
      })(),
      // CompletedJob
      (async () => {
        console.log('Ищем выполненную работу:', completedJob);
        const record = await prisma.completedJob.upsert({
          where: { name: completedJob },
          update: {},
          create: { name: completedJob }
        });
        console.log('Выполненная работа найдена/создана:', record.id);
        return record;
      })(),
      // CurrentLocation
      (async () => {
        console.log('Ищем текущее местоположение:', currentLocation);
        const record = await prisma.currentLocation.upsert({
          where: { name: currentLocation },
          update: {},
          create: { name: currentLocation }
        });
        console.log('Текущее местоположение найдено/создано:', record.id);
        return record;
      })()
    ]);

    // Находим или создаем вагоны
    const carriageRecords = [];
    for (const carriage of carriages) {
      const carriageRecord = await prisma.carriage.upsert({
        where: { 
          number_trainId: { 
            number: carriage.carriageNumber, 
            trainId: trainRecord.id 
          } 
        },
        update: { type: carriage.carriageType },
        create: { 
          number: carriage.carriageNumber, 
          type: carriage.carriageType, 
          trainId: trainRecord.id 
        }
      });
      carriageRecords.push(carriageRecord);
    }

    // Подготавливаем данные для обновления заявки
    const updateData = {
      status: 'completed',
      typeWorkId: typeWorkRecord.id,
      trainId: trainRecord.id,
      completedJobId: completedJobRecord.id,
      currentLocationId: currentLocationRecord.id,
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
        requestCarriages: {
          include: {
            carriage: {
              include: {
                train: true,
              },
            },
          },
        },
        completedJob: true,
        currentLocation: true,
        user: true
      }
    });

    // Удаляем старые связи с вагонами
    await prisma.requestCarriage.deleteMany({
      where: { requestId: parseInt(id) }
    });

    // Создаем связи с вагонами
    for (let i = 0; i < carriageRecords.length; i++) {
      const carriageRecord = carriageRecords[i];
      const carriageData = carriages[i];
      
      await prisma.requestCarriage.create({
        data: {
          requestId: parseInt(id),
          carriageId: carriageRecord.id,
          carriagePhoto: carriageData.carriagePhoto || null,
        },
      });
    }

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
            status: 'active'
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
        requestCarriages: {
          include: {
            carriage: {
              include: {
                train: true,
              },
            },
          },
        },
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