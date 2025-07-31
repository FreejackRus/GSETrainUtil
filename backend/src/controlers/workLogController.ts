import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWorkLog = async (req: Request, res: Response) => {
  try {
    const workLogEntries = await prisma.request.findMany({
      include: {
        typeWork: true,
        train: true,
        carriage: true,
        equipment: {
          include: {
            photos: true
          }
        },
        completedJob: true,
        currentLocation: true,
        user: true
      },
      orderBy: {
        applicationDate: 'desc'
      }
    });

    // Преобразуем данные для frontend
    const formattedEntries = workLogEntries.map((entry) => ({
      id: entry.id,
      requestId: entry.id,
      applicationNumber: entry.applicationNumber,
      applicationDate: entry.applicationDate,
      typeWork: entry.typeWork.name,
      trainNumber: entry.train.number,
      carriageType: entry.carriage.type,
      carriageNumber: entry.carriage.number,
      equipment: entry.equipment?.type || 'Не указано',
      equipmentType: entry.equipment?.type || 'Не указано',
      serialNumber: entry.equipment?.serialNumber || null,
      macAddress: entry.equipment?.macAddress || null,
      countEquipment: entry.countEquipment,
      completedJob: entry.completedJob.name,
      completedBy: entry.user.name,
      currentLocation: entry.currentLocation.name,
      photos: entry.equipment?.photos.map(photo => ({
        type: photo.photoType,
        path: photo.photoPath,
        description: photo.description
      })) || [],
      userId: entry.userId,
      userName: entry.user.name,
      userRole: entry.user.role
    }));

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
    const existingEntry = await prisma.request.findUnique({
      where: {
        id: parseInt(id)
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

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Запись журнала работ не найдена'
      });
    }

    // Обновляем основную запись заявки
    const updatedEntry = await prisma.request.update({
      where: {
        id: parseInt(id)
      },
      data: {
        applicationNumber: updateData.applicationNumber,
        applicationDate: updateData.applicationDate ? new Date(updateData.applicationDate) : undefined,
        typeWorkId: updateData.typeWorkId,
        trainId: updateData.trainId,
        carriageId: updateData.carriageId,
        equipmentId: updateData.equipmentId,
        countEquipment: updateData.countEquipment,
        completedJobId: updateData.completedJobId,
        currentLocationId: updateData.currentLocationId,
        userId: updateData.userId
      },
      include: {
        typeWork: true,
        train: true,
        carriage: true,
        equipment: {
          include: {
            photos: true
          }
        },
        completedJob: true,
        currentLocation: true,
        user: true
      }
    });

    const formattedEntry = {
      id: updatedEntry.id,
      applicationNumber: updatedEntry.applicationNumber,
      applicationDate: updatedEntry.applicationDate,
      typeWork: updatedEntry.typeWork.name,
      trainNumber: updatedEntry.train.number,
      carriageType: updatedEntry.carriage.type,
      carriageNumber: updatedEntry.carriage.number,
      equipment: updatedEntry.equipment?.type || 'Не указано',
      equipmentType: updatedEntry.equipment?.type || 'Не указано',
      serialNumber: updatedEntry.equipment?.serialNumber || null,
      macAddress: updatedEntry.equipment?.macAddress || null,
      countEquipment: updatedEntry.countEquipment,
      completedJob: updatedEntry.completedJob.name,
      currentLocation: updatedEntry.currentLocation.name,
      photos: updatedEntry.equipment?.photos.map(photo => ({
        type: photo.photoType,
        path: photo.photoPath,
        description: photo.description
      })) || [],
      userId: updatedEntry.userId,
      userName: updatedEntry.user.name,
      userRole: updatedEntry.user.role
    };

    res.json({
      success: true,
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
    
    const workLogEntry = await prisma.request.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        typeWork: true,
        train: true,
        carriage: true,
        equipment: {
          include: {
            photos: true
          }
        },
        completedJob: true,
        currentLocation: true,
        user: true
      }
    });

    if (!workLogEntry) {
      return res.status(404).json({
        success: false,
        message: 'Запись журнала работ не найдена'
      });
    }

    const formattedEntry = {
      id: workLogEntry.id,
      applicationNumber: workLogEntry.applicationNumber,
      applicationDate: workLogEntry.applicationDate,
      typeWork: workLogEntry.typeWork.name,
      trainNumber: workLogEntry.train.number,
      carriageType: workLogEntry.carriage.type,
      carriageNumber: workLogEntry.carriage.number,
      equipment: workLogEntry.equipment?.type || 'Не указано',
      equipmentType: workLogEntry.equipment?.type || 'Не указано',
      serialNumber: workLogEntry.equipment?.serialNumber || null,
      macAddress: workLogEntry.equipment?.macAddress || null,
      countEquipment: workLogEntry.countEquipment,
      completedJob: workLogEntry.completedJob.name,
      currentLocation: workLogEntry.currentLocation.name,
      photos: workLogEntry.equipment?.photos.map(photo => ({
        type: photo.photoType,
        path: photo.photoPath,
        description: photo.description
      })) || [],
      userId: workLogEntry.userId,
      userName: workLogEntry.user.name,
      userRole: workLogEntry.user.role
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