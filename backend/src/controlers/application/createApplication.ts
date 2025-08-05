import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import path from "path";
import { v4 } from "uuid";
// import fs from "fs";
import * as fs from 'fs/promises';

const prisma = new PrismaClient();
const UPLOAD_ROOT = path.join(__dirname, '../../../uploads');

const requestFolderMap: Record<string, string> = {
  carriagePhoto: 'request/carriage',
  generalPhoto: 'request/general',
  finalPhoto: 'request/final',
};

const equipmentPhotoTypeMap: Record<string, string> = {
  equipmentPhoto: 'equipment',
  serialPhoto: 'serial',
  macPhoto: 'mac',
};

async function generateUniqueFilename(
    dir: string,
    ext: string,
    scope: 'request' | 'equipment',
    column?: 'carriagePhoto' | 'generalPhoto' | 'finalPhoto'
): Promise<string> {
  let name: string;
  let fullPath: string;
  let relPath: string;
  do {
    name = v4() + ext;
    fullPath = path.join(dir, name);
    relPath = path.relative(UPLOAD_ROOT, fullPath);

    try {
      await fs.access(fullPath);
      continue;
    } catch { }

    if (scope === 'equipment') {
      const exists = await prisma.equipmentPhoto.findFirst({ where: { photoPath: relPath } });
      if (exists) continue;
    } else if (scope === 'request' && column) {
      const exists = await prisma.request.findFirst({ where: { [column]: relPath } });
      if (exists) continue;
    }
    break;
  } while (true);
  return name;
}

export const createApplication = async (req: Request, res: Response) => {
  const cleanupPaths: string[] = [];
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
      carriages, // Массив вагонов
      equipment, // Массив оборудования
      completedJob,
      currentLocation,
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
      carriagesCount: carriages?.length || 0,
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
        !carriages ||
        !Array.isArray(carriages) ||
        carriages.length === 0 ||
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

      // Валидация каждого вагона
      for (const carriage of carriages) {
        if (!carriage.carriageType || !carriage.carriageNumber) {
          return res.status(400).json({
            success: false,
            message: "Тип и номер вагона обязательны для заполнения",
          });
        }
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
      });

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          message: "Заявка не найдена",
        });
      }

      // Удаляем старые связи с оборудованием и вагонами
      await Promise.all([
        prisma.requestEquipment.deleteMany({
          where: { requestId: parseInt(id) },
        }),
        prisma.requestCarriage.deleteMany({
          where: { requestId: parseInt(id) },
        }),
      ]);
    }

    console.log("=== Поиск/создание записей в справочниках ===");
    console.log("Searching for:", { typeWork, trainNumber, carriagesCount: carriages?.length || 0, completedJob, currentLocation });

    // Находим или создаем записи в справочниках
    const [
      typeWorkRecord,
      trainRecord,
      completedJobRecord,
      locationRecord,
    ] = await Promise.all([
      typeWork ? prisma.typeWork.upsert({
        where: { name: typeWork },
        update: {},
        create: { name: typeWork }
      }) : null,
      trainNumber ? prisma.train.upsert({
        where: { number: trainNumber },
        update: {},
        create: { number: trainNumber }
      }) : null,
      completedJob ? prisma.completedJob.upsert({
        where: { name: completedJob },
        update: {},
        create: { name: completedJob }
      }) : null,
      currentLocation ? prisma.currentLocation.upsert({
        where: { name: currentLocation },
        update: {},
        create: { name: currentLocation }
      }) : null,
    ]);

    // Создаем записи для всех вагонов
    const carriageRecords = [];
    if (carriages && carriages.length > 0 && trainRecord) {
      for (const carriage of carriages) {
        const carriageRecord = await prisma.carriage.upsert({
          where: {
            number_trainId: {
              number: carriage.carriageNumber,
              trainId: trainRecord.id
            }
          },
          update: {},
          create: {
            number: carriage.carriageNumber,
            type: carriage.carriageType || "Неизвестный",
            trainId: trainRecord.id
          }
        });
        carriageRecords.push(carriageRecord);
      }
    }

    console.log("=== Результаты поиска/создания ===");
    console.log("typeWorkRecord:", typeWorkRecord);
    console.log("trainRecord:", trainRecord);
    console.log("carriageRecords:", carriageRecords.map(c => ({ id: c.id, number: c.number, type: c.type })));
    console.log("completedJobRecord:", completedJobRecord);
    console.log("locationRecord:", locationRecord);

    if (status === "completed") {
      if (
        !typeWorkRecord ||
        !trainRecord ||
        carriageRecords.length === 0 ||
        !completedJobRecord ||
        !locationRecord
      ) {
        console.log("=== Ошибка валидации справочников ===");
        console.log("Missing records:", {
          typeWork: !typeWorkRecord,
          train: !trainRecord,
          carriages: carriageRecords.length === 0,
          completedJob: !completedJobRecord,
          location: !locationRecord
        });
        
        return res.status(400).json({
          success: false,
          message: "Ошибка валидации данных. Проверьте правильность заполнения формы.",
        });
      }
    }

    const requestData: any = {
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      typeWorkId: typeWorkRecord?.id || null,
      trainId: trainRecord?.id || null,
      completedJobId: completedJobRecord?.id || null,
      currentLocationId: locationRecord?.id || null,
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

    // Создаем связи с вагонами
    if (carriageRecords.length > 0) {
      for (let i = 0; i < carriageRecords.length; i++) {
        const carriageRecord = carriageRecords[i];
        const carriageData = carriages[i];

        await prisma.requestCarriage.create({
          data: {
            requestId: request.id,
            carriageId: carriageRecord.id,
            carriagePhoto: carriageData.carriagePhoto || null,
          },
        });
      }
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
              photoPath: item.photos.equipmentPhoto,
              photoType: "equipment",
            });
          }

          if (item.photos.serialPhoto) {
            photoData.push({
              equipmentId: equipmentRecord.id,
              photoPath: item.photos.serialPhoto,
              photoType: "serial",
            });
          }

          if (item.photos.macPhoto) {
            photoData.push({
              equipmentId: equipmentRecord.id,
              photoPath: item.photos.macPhoto,
              photoType: "mac",
            });
          }

          if (photoData.length > 0) {
            await prisma.equipmentPhoto.createMany({
              data: photoData,
            });
          }
        }
      }
    }

    // Получаем полную информацию о созданной/обновленной заявке
    const fullRequest = await prisma.request.findUnique({
      where: { id: request.id },
      include: {
        requestCarriages: {
          include: {
            carriage: {
              include: {
                train: true,
              },
            },
          },
        },
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
