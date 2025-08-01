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

    // Обновляем заявку, устанавливая статус completed
    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(id) },
      data: {
        ...requestData,
        status: 'completed'
      },
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
        currentLocation: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Черновик успешно завершен',
      data: updatedRequest
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