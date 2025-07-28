import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWorkLog = async (req: Request, res: Response) => {
  try {
    const workLogEntries = await prisma.requests.findMany({
      include: {
        requestEquipment: true
      },
      orderBy: {
        applicationDate: 'desc'
      }
    });

    // Преобразуем данные для объединения оборудования в одну заявку
    const formattedEntries = workLogEntries.map((entry: any) => {
      // Объединяем все оборудование в массивы
      const equipmentTypes = entry.requestEquipment?.map((eq: any) => eq.equipmentType) || [];
      const serialNumbers = entry.requestEquipment?.map((eq: any) => eq.serialNumber) || [];
      const macAddresses = entry.requestEquipment?.map((eq: any) => eq.macAddress).filter(Boolean) || [];
      const equipmentCounts = entry.requestEquipment?.map((eq: any) => eq.countEquipment) || [];
      const equipmentPhotos = entry.requestEquipment?.map((eq: any) => eq.equipmentPhoto).filter(Boolean) || [];
      const serialPhotos = entry.requestEquipment?.map((eq: any) => eq.serialPhoto).filter(Boolean) || [];
      const macPhotos = entry.requestEquipment?.map((eq: any) => eq.macPhoto).filter(Boolean) || [];

      return {
        id: entry.id,
        requestId: entry.id,
        applicationNumber: entry.applicationNumber,
        applicationDate: entry.applicationDate,
        typeWork: entry.typeWork,
        trainNumber: entry.trainNumber,
        carriageType: entry.carriageType,
        carriageNumber: entry.carriageNumber,
        // Объединенная информация об оборудовании
        equipment: equipmentTypes.join(', '), // Для совместимости с frontend
        equipmentTypes: equipmentTypes,
        serialNumbers: serialNumbers,
        macAddresses: macAddresses,
        equipmentCounts: equipmentCounts,
        totalEquipmentCount: equipmentCounts.reduce((sum: number, count: number) => sum + count, 0),
        completedJob: entry.completedJob,
        completedBy: entry.userName,
        currentLocation: entry.currentLocation,
        photos: {
          carriagePhoto: entry.carriagePhoto,
          equipmentPhotos: equipmentPhotos,
          serialPhotos: serialPhotos,
          macPhotos: macPhotos,
          generalPhoto: entry.generalPhoto,
          finalPhoto: entry.finalPhoto,
        },
        userId: entry.userId,
        userName: entry.userName,
        userRole: entry.userRole,
        // Массив всего оборудования для детального просмотра
        requestEquipment: entry.requestEquipment || []
      };
    });

    res.json({
      success: true,
      data: formattedEntries
    });
  } catch (error) {
    console.error('Ошибка при получении журнала работ:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении журнала работ'
    });
  }
};



export const updateWorkLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Проверяем, существует ли запись
    const existingEntry = await prisma.requests.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        requestEquipment: true
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Запись журнала работ не найдена'
      });
    }

    // Обновляем основную запись заявки
    const updatedEntry = await prisma.requests.update({
      where: {
        id: parseInt(id)
      },
      data: {
        applicationNumber: updateData.applicationNumber,
        applicationDate: updateData.applicationDate ? new Date(updateData.applicationDate) : undefined,
        typeWork: updateData.typeWork,
        trainNumber: updateData.trainNumber,
        carriageType: updateData.carriageType,
        carriageNumber: updateData.carriageNumber,
        completedJob: updateData.completedJob,
        currentLocation: updateData.currentLocation,
        carriagePhoto: updateData.photos?.carriagePhoto,
        generalPhoto: updateData.photos?.generalPhoto,
        finalPhoto: updateData.photos?.finalPhoto,
        userName: updateData.userName,
        userRole: updateData.userRole,
      },
      include: {
        requestEquipment: true
      }
    });

    // Если есть данные об оборудовании, обновляем их
    if (updateData.equipmentType || updateData.serialNumber || updateData.macAddress || updateData.countEquipment) {
      if (existingEntry.requestEquipment.length > 0) {
        // Обновляем существующее оборудование (берем первое)
        await prisma.requestEquipment.update({
          where: {
            id: existingEntry.requestEquipment[0].id
          },
          data: {
            equipmentType: updateData.equipmentType,
            serialNumber: updateData.serialNumber,
            macAddress: updateData.macAddress,
            countEquipment: updateData.countEquipment,
            equipmentPhoto: updateData.photos?.equipmentPhoto,
            serialPhoto: updateData.photos?.serialPhoto,
            macPhoto: updateData.photos?.macPhoto,
          }
        });
      } else {
        // Создаем новое оборудование
        await prisma.requestEquipment.create({
          data: {
            requestId: updatedEntry.id,
            equipmentType: updateData.equipmentType,
            serialNumber: updateData.serialNumber,
            macAddress: updateData.macAddress,
            countEquipment: updateData.countEquipment,
            equipmentPhoto: updateData.photos?.equipmentPhoto,
            serialPhoto: updateData.photos?.serialPhoto,
            macPhoto: updateData.photos?.macPhoto,
          }
        });
      }
    }

    // Получаем обновленную запись с оборудованием
    const finalEntry = await prisma.requests.findUnique({
      where: { id: parseInt(id) },
      include: { requestEquipment: true }
    });

    // Обрабатываем все оборудование
    const equipmentTypes = finalEntry!.requestEquipment.map((eq: { equipmentType: string }) => eq.equipmentType).filter(Boolean);
    const serialNumbers = finalEntry!.requestEquipment.map(eq => eq.serialNumber).filter(Boolean);
    const macAddresses = finalEntry!.requestEquipment.map(eq => eq.macAddress).filter(Boolean);
    const countEquipments = finalEntry!.requestEquipment.map((eq: { countEquipment: number }) => eq.countEquipment).filter(Boolean);
    
    // Собираем все фотографии оборудования
    const equipmentPhotos = finalEntry!.requestEquipment.map(eq => eq.equipmentPhoto).filter(Boolean);
    const serialPhotos = finalEntry!.requestEquipment.map(eq => eq.serialPhoto).filter(Boolean);
    const macPhotos = finalEntry!.requestEquipment.map(eq => eq.macPhoto).filter(Boolean);

    const formattedEntry = {
      id: finalEntry!.id,
      applicationNumber: finalEntry!.applicationNumber,
      applicationDate: finalEntry!.applicationDate,
      typeWork: finalEntry!.typeWork,
      trainNumber: finalEntry!.trainNumber,
      carriageType: finalEntry!.carriageType,
      carriageNumber: finalEntry!.carriageNumber,
      // Возвращаем все оборудование
      equipmentTypes: equipmentTypes,
      equipment: equipmentTypes.join(', '), // Для обратной совместимости
      equipmentType: equipmentTypes.join(', '), // Для обратной совместимости
      serialNumbers: serialNumbers,
      serialNumber: serialNumbers.join(', '), // Для обратной совместимости
      macAddresses: macAddresses,
      macAddress: macAddresses.join(', '), // Для обратной совместимости
      countEquipments: countEquipments,
      countEquipment: countEquipments.reduce((sum, count) => sum + count, 0), // Общее количество
      completedJob: finalEntry!.completedJob,
      currentLocation: finalEntry!.currentLocation,
      photos: {
        carriagePhoto: finalEntry!.carriagePhoto,
        equipmentPhotos: equipmentPhotos, // Массив всех фото оборудования
        equipmentPhoto: equipmentPhotos[0] || null, // Первое фото для обратной совместимости
        serialPhotos: serialPhotos, // Массив всех фото серийных номеров
        serialPhoto: serialPhotos[0] || null, // Первое фото для обратной совместимости
        macPhotos: macPhotos, // Массив всех фото MAC адресов
        macPhoto: macPhotos[0] || null, // Первое фото для обратной совместимости
        generalPhoto: finalEntry!.generalPhoto,
        finalPhoto: finalEntry!.finalPhoto,
      },
      // Детальная информация о каждом оборудовании
      equipmentDetails: finalEntry!.requestEquipment.map(eq => ({
        id: eq.id,
        equipmentType: eq.equipmentType,
        serialNumber: eq.serialNumber,
        macAddress: eq.macAddress,
        countEquipment: eq.countEquipment,
        equipmentPhoto: eq.equipmentPhoto,
        serialPhoto: eq.serialPhoto,
        macPhoto: eq.macPhoto,
      })),
      userId: finalEntry!.userId,
      userName: finalEntry!.userName,
      userRole: finalEntry!.userRole,
    };

    res.json({
      success: true,
      message: 'Запись журнала работ успешно обновлена',
      data: formattedEntry
    });
  } catch (error) {
    console.error('Ошибка при обновлении записи журнала работ:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении записи журнала работ'
    });
  }
};

export const getWorkLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const workLogEntry = await prisma.requests.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        requestEquipment: true
      }
    });

    if (!workLogEntry) {
      return res.status(404).json({
        success: false,
        message: 'Запись журнала работ не найдена'
      });
    }

    // Обрабатываем все оборудование
    const equipmentTypes = workLogEntry.requestEquipment.map(eq => eq.equipmentType).filter(Boolean);
    const serialNumbers = workLogEntry.requestEquipment.map(eq => eq.serialNumber).filter(Boolean);
    const macAddresses = workLogEntry.requestEquipment.map(eq => eq.macAddress).filter(Boolean);
    const countEquipments = workLogEntry.requestEquipment.map(eq => eq.countEquipment).filter(Boolean);
    
    // Собираем все фотографии оборудования
    const equipmentPhotos = workLogEntry.requestEquipment.map(eq => eq.equipmentPhoto).filter(Boolean);
    const serialPhotos = workLogEntry.requestEquipment.map(eq => eq.serialPhoto).filter(Boolean);
    const macPhotos = workLogEntry.requestEquipment.map(eq => eq.macPhoto).filter(Boolean);

    const formattedEntry = {
      id: workLogEntry.id,
      applicationNumber: workLogEntry.applicationNumber,
      applicationDate: workLogEntry.applicationDate,
      typeWork: workLogEntry.typeWork,
      trainNumber: workLogEntry.trainNumber,
      carriageType: workLogEntry.carriageType,
      carriageNumber: workLogEntry.carriageNumber,
      // Возвращаем все оборудование
      equipmentTypes: equipmentTypes,
      equipment: equipmentTypes.join(', '), // Для обратной совместимости
      equipmentType: equipmentTypes.join(', '), // Для обратной совместимости
      serialNumbers: serialNumbers,
      serialNumber: serialNumbers.join(', '), // Для обратной совместимости
      macAddresses: macAddresses,
      macAddress: macAddresses.join(', '), // Для обратной совместимости
      countEquipments: countEquipments,
      countEquipment: countEquipments.reduce((sum, count) => sum + count, 0), // Общее количество
      completedJob: workLogEntry.completedJob,
      currentLocation: workLogEntry.currentLocation,
      photos: {
        carriagePhoto: workLogEntry.carriagePhoto,
        equipmentPhotos: equipmentPhotos, // Массив всех фото оборудования
        equipmentPhoto: equipmentPhotos[0] || null, // Первое фото для обратной совместимости
        serialPhotos: serialPhotos, // Массив всех фото серийных номеров
        serialPhoto: serialPhotos[0] || null, // Первое фото для обратной совместимости
        macPhotos: macPhotos, // Массив всех фото MAC адресов
        macPhoto: macPhotos[0] || null, // Первое фото для обратной совместимости
        generalPhoto: workLogEntry.generalPhoto,
        finalPhoto: workLogEntry.finalPhoto,
      },
      // Детальная информация о каждом оборудовании
      equipmentDetails: workLogEntry.requestEquipment.map(eq => ({
        id: eq.id,
        equipmentType: eq.equipmentType,
        serialNumber: eq.serialNumber,
        macAddress: eq.macAddress,
        countEquipment: eq.countEquipment,
        equipmentPhoto: eq.equipmentPhoto,
        serialPhoto: eq.serialPhoto,
        macPhoto: eq.macPhoto,
      })),
      userId: workLogEntry.userId,
      userName: workLogEntry.userName,
      userRole: workLogEntry.userRole,
    };

    res.json({
      success: true,
      data: formattedEntry
    });
  } catch (error) {
    console.error('Ошибка при получении записи журнала работ:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении записи журнала работ'
    });
  }
};