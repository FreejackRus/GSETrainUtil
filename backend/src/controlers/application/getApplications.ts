import { PrismaClient } from "../../../generated/prisma";
import { Request, Response } from "express";

export const getApplications = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();
    
    const applications = await prisma.requestsTechnicalWorkLog.findMany({
      include: {
        connectionTypeWork: true,
        connectionTrainNumber: true,
        connectionEquipment: {
          include: {
            connectionTypeWagons: true,
            connectionNumberWagon: true
          }
        },
        connectionCompletedJob: true,
        connectionCurrentLocation: true,
        connectionUser: {
          select: {
            id: true,
            login: true,
            role: true
          }
        }
      },
      orderBy: {
        applicationDate: 'desc'
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
    
    const application = await prisma.requestsTechnicalWorkLog.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        connectionTypeWork: true,
        connectionTrainNumber: true,
        connectionEquipment: {
          include: {
            connectionTypeWagons: true,
            connectionNumberWagon: true
          }
        },
        connectionCompletedJob: true,
        connectionCurrentLocation: true,
        connectionUser: {
          select: {
            id: true,
            login: true,
            role: true
          }
        }
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