import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const getApplications = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    
    // Получаем userId из query параметров для фильтрации
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    // Создаем условие фильтрации
    const whereCondition: any = {};
    if (userId) {
      whereCondition.userId = userId;
    }
    
    const applications = await prisma.request.findMany({
      where: whereCondition,
      orderBy: {
        applicationDate: 'desc'
      },
      include: {
        typeWork: true,
        train: true,
        completedJob: true,
        currentLocation: true,
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
      }
    });

    await prisma.$disconnect();
    
    res.status(200).json({
      success: true,
      data: applications
    });
    
  } catch (error) {
    console.error("Ошибка при получении заявок:", error);
    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера"
    });
  }
};

export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    const { id } = req.params;
    
    // Проверяем, что id существует и является валидным числом
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Некорректный ID заявки"
      });
    }
    
    const application = await prisma.request.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        typeWork: true,
        train: true,
        completedJob: true,
        currentLocation: true,
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
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Заявка не найдена"
      });
    }

    await prisma.$disconnect();
    
    res.status(200).json({
      success: true,
      data: application
    });
    
  } catch (error) {
    console.error("Ошибка при получении заявки:", error);
    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера"
    });
  }
};