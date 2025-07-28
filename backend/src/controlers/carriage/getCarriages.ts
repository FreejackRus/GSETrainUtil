import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const getCarriages = async (req: Request, res: Response) => {
  const prisma = new PrismaClient();
  
  try {
    // Получаем все оборудование с информацией о вагонах
    const equipmentData = await prisma.equipment.findMany({
      include: {
        connectionTypeWagons: true,
        connectionNumberWagon: true,
      },
    });

    // Группируем оборудование по номерам вагонов
    const carriageMap = new Map();
    
    equipmentData.forEach((equipment) => {
      const carriageNumber = equipment.connectionNumberWagon?.numberWagon;
      const carriageType = equipment.connectionTypeWagons?.typeWagon;
      
      if (!carriageNumber) return;
      
      if (!carriageMap.has(carriageNumber)) {
        carriageMap.set(carriageNumber, {
          number: carriageNumber,
          type: carriageType,
          equipment: [],
        });
      }
      
      carriageMap.get(carriageNumber).equipment.push({
        id: equipment.id,
        type: equipment.type,
        status: equipment.status,
        snNumber: equipment.snNumber,
        mac: equipment.mac,
        lastService: equipment.lastService,
        photo: equipment.photo,
      });
    });

    // Преобразуем Map в массив
    const carriages = Array.from(carriageMap.values()).map(carriage => ({
      carriageNumber: carriage.number,
      carriageType: carriage.type || 'Неизвестно',
      equipment: carriage.equipment
    }));

    // Получаем уникальные типы оборудования
    const equipmentTypes = [...new Set(equipmentData.map(eq => eq.type))];

    res.json({ 
      success: true,
      data: carriages,
      equipmentTypes 
    });
  } catch (error) {
    console.error('Error fetching carriages:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Ошибка при получении данных о вагонах'
    });
  } finally {
    await prisma.$disconnect();
  }
};