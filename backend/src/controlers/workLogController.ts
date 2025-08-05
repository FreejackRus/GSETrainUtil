import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getWorkLog = async (req: Request, res: Response) => {
  try {
    const workLogEntries = await prisma.request.findMany({
      include: {
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
        user: true,
        requestEquipment: {
          include: {
            equipment: {
              include: {
                photos: true,
              },
            },
          },
        },
      },
      orderBy: {
        applicationDate: "desc",
      },
    });

    const formattedEntries = workLogEntries.map((entry: any) => {
      const equipmentDetails =
        entry.requestEquipment?.map((reqEq: any) => ({
          type: reqEq.equipment?.type || "Не указано",
          serialNumber: reqEq.equipment?.serialNumber || "Не указано",
          macAddress: reqEq.equipment?.macAddress || "Не указано",
          quantity: reqEq.quantity || 0,
          photos:
            reqEq.equipment?.photos?.map((p: any) => ({
              type: p.photoType,
              path: p.photoPath,
              description: p.description,
            })) || [],
        })) || [];

      const allPhotos = equipmentDetails.flatMap((eq: any) => eq.photos);

      const getPhotoPaths = (type: string) =>
        allPhotos.filter((p: any) => p.type === type).map((p: any) => p.path);

      const equipmentTypes = equipmentDetails.map((eq: any) => eq.type);
      const serialNumbers = equipmentDetails.map((eq: any) => eq.serialNumber);
      const macAddresses = equipmentDetails.map((eq: any) => eq.macAddress);
      const countEquipments = equipmentDetails.map((eq: any) => eq.quantity);

      return {
        id: entry.id,
        applicationNumber: entry.applicationNumber,
        applicationDate: entry.applicationDate.toISOString(),
        typeWork: entry.typeWork?.name || "Не указано",
        trainNumber: entry.train?.number || "Не указано",
        carriageType: entry.requestCarriages[0]?.carriage?.type || "Не указано",
        carriageNumber: entry.requestCarriages[0]?.carriage?.number || "Не указано",

        // Для совместимости
        equipment: equipmentTypes[0] || "Не указано",
        equipmentType: equipmentTypes.join(", ") || "Не указано",
        equipmentTypes,

        serialNumber: serialNumbers[0] || "Не указано",
        serialNumbers,

        macAddress: macAddresses[0] || "Не указано",
        macAddresses,

        countEquipment: countEquipments.reduce((a: number, b: number) => a + b, 0),
        countEquipments,

        equipmentDetails,

        completedJob: entry.completedJob?.name || "Не указано",
        completedBy: entry.user?.name || "",
        currentLocation: entry.currentLocation?.name || "",

        photos: {
          carriagePhoto: getPhotoPaths("carriage")[0],
          equipmentPhoto: getPhotoPaths("equipment")[0],
          equipmentPhotos: getPhotoPaths("equipment"),
          serialPhoto: getPhotoPaths("serial")[0],
          serialPhotos: getPhotoPaths("serial"),
          macPhoto: getPhotoPaths("mac")[0],
          macPhotos: getPhotoPaths("mac"),
          generalPhoto: getPhotoPaths("general")[0],
          finalPhoto: getPhotoPaths("final")[0],
        },

        userId: entry.userId,
        userName: entry.user?.name || "",
        userRole: entry.user?.role || "",
      };
    });

    res.json({
      success: true,
      data: formattedEntries,
    });
  } catch (error) {
    console.error("Ошибка при получении журнала работ:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при получении журнала работ",
    });
  }
};

export const updateWorkLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { requestEquipment: newRequestEquipment, ...otherUpdateData } =
      updateData;

    const typeWork = await prisma.typeWork.findFirst({
      where: { name: otherUpdateData.typeWork },
    });
    const train = await prisma.train.findFirst({
      where: { number: otherUpdateData.trainNumber },
    });
    const carriage = await prisma.carriage.findFirst({
      where: { number: otherUpdateData.carriageNumber },
    });
    const completedJob = await prisma.completedJob.findFirst({
      where: { name: otherUpdateData.completedJob },
    });
    const currentLocation = await prisma.currentLocation.findFirst({
      where: { name: otherUpdateData.currentLocation },
    });
 
    // 1. Обновляем основную заявку
    const updatedEntry = await prisma.request.update({
      where: { id: parseInt(id) },
      data: {
        applicationNumber: otherUpdateData.applicationNumber,
        applicationDate: otherUpdateData.applicationDate
          ? new Date(otherUpdateData.applicationDate)
          : undefined,
        typeWorkId: typeWork?.id,
        trainId: train?.id,
        completedJobId: completedJob?.id,
        currentLocationId: currentLocation?.id,
        userId: otherUpdateData.userId,
      },
      include: {
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
        user: true,
      },
    });

    // 3. Получаем полную обновлённую запись
    const fullUpdatedEntry = await prisma.request.findUnique({
      where: { id: updatedEntry.id },
      include: {
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
        user: true,
        requestEquipment: {
          include: {
            equipment: {
              include: { photos: true },
            },
          },
        },
      },
    });

    // 4. Формируем ответ
    const equipmentDetails =
      fullUpdatedEntry?.requestEquipment.map((reqEq: any) => ({
        id: reqEq.id,
        type: reqEq.equipment?.type || "Не указано",
        serialNumber: reqEq.equipment?.serialNumber || "Не указано",
        macAddress: reqEq.equipment?.macAddress || "Не указано",
        quantity: reqEq.quantity || 0,
        photos:
          reqEq.equipment?.photos?.map((photo: any) => ({
            type: photo.photoType,
            path: photo.photoPath,
            description: photo.description,
          })) || [],
      })) || [];

    const allPhotos = equipmentDetails.flatMap((eq: any) => eq.photos);

    const getPhotoPaths = (type: string) =>
      allPhotos.filter((p: any) => p.type === type).map((p: any) => p.path);

    const equipmentTypes = equipmentDetails.map((eq: any) => eq.type);
    const serialNumbers = equipmentDetails.map((eq: any) => eq.serialNumber);
    const macAddresses = equipmentDetails.map((eq: any) => eq.macAddress);
    const countEquipments = equipmentDetails.map((eq: any) => eq.quantity);

    const formattedEntry = {
      id: fullUpdatedEntry?.id,
      applicationNumber: fullUpdatedEntry?.applicationNumber,
      applicationDate: fullUpdatedEntry?.applicationDate?.toISOString(),
      typeWork: fullUpdatedEntry?.typeWork?.name || "Не указано",
      trainNumber: fullUpdatedEntry?.train?.number || "Не указано",
      carriageType: fullUpdatedEntry?.requestCarriages[0]?.carriage?.type || "Не указано",
      carriageNumber: fullUpdatedEntry?.requestCarriages[0]?.carriage?.number || "Не указано",

      equipment: equipmentTypes[0] || "Не указано",
      equipmentType: equipmentTypes.join(", ") || "Не указано",
      equipmentTypes,

      serialNumber: serialNumbers[0] || "Не указано",
      serialNumbers,

      macAddress: macAddresses[0] || "Не указано",
      macAddresses,

      countEquipment: countEquipments.reduce((acc: number, val: number) => acc + val, 0),
      countEquipments,

      equipmentDetails,

      completedJob: fullUpdatedEntry?.completedJob?.name || "Не указано",
      completedBy: fullUpdatedEntry?.user?.name || "",
      currentLocation: fullUpdatedEntry?.currentLocation?.name || "",

      photos: {
        carriagePhoto: getPhotoPaths("carriage")[0],
        equipmentPhoto: getPhotoPaths("equipment")[0],
        equipmentPhotos: getPhotoPaths("equipment"),
        serialPhoto: getPhotoPaths("serial")[0],
        serialPhotos: getPhotoPaths("serial"),
        macPhoto: getPhotoPaths("mac")[0],
        macPhotos: getPhotoPaths("mac"),
        generalPhoto: getPhotoPaths("general")[0],
        finalPhoto: getPhotoPaths("final")[0],
      },

      userId: fullUpdatedEntry?.userId,
      userName: fullUpdatedEntry?.user?.name || "",
      userRole: fullUpdatedEntry?.user?.role || "",
    };

    return res.json({ success: true, data: formattedEntry });
  } catch (error) {
    console.error("Ошибка при обновлении записи:", error);
    return res.status(500).json({
      success: false,
      message: "Ошибка при обновлении записи журнала работ",
    });
  }
};

export const getWorkLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const workLogEntry = await prisma.request.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
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
        user: true,
        requestEquipment: {
          include: {
            equipment: {
              include: {
                photos: true,
              },
            },
          },
        },
      },
    });

    if (!workLogEntry) {
      return res.status(404).json({
        success: false,
        message: "Запись журнала работ не найдена",
      });
    }

    // Формируем агрегированные поля из requestEquipment
    const equipmentTypes = workLogEntry.requestEquipment.map(
      (re: any) => re.equipment?.type || "Не указано"
    );
    const serialNumbers = workLogEntry.requestEquipment.map(
      (re: any) => re.equipment?.serialNumber || ""
    );
    const macAddresses = workLogEntry.requestEquipment.map(
      (re: any) => re.equipment?.macAddress || ""
    );
    const countEquipments = workLogEntry.requestEquipment.map(
      (re: any) => re.quantity || 0
    );

    // Собираем все фотографии по категориям
    const carriagePhoto = workLogEntry.requestEquipment
      .flatMap((re: any) => re.equipment?.photos || [])
      .find((p: any) => p.photoType === "carriage")?.photoPath;

    const equipmentPhotos = workLogEntry.requestEquipment
      .flatMap((re: any) => re.equipment?.photos || [])
      .filter((p: any) => p.photoType === "equipment")
      .map((p: any) => p.photoPath);

    const serialPhotos = workLogEntry.requestEquipment
      .flatMap((re: any) => re.equipment?.photos || [])
      .filter((p: any) => p.photoType === "serial")
      .map((p: any) => p.photoPath);

    const macPhotos = workLogEntry.requestEquipment
      .flatMap((re: any) => re.equipment?.photos || [])
      .filter((p: any) => p.photoType === "mac")
      .map((p: any) => p.photoPath);

    const generalPhoto = workLogEntry.requestEquipment
      .flatMap((re: any) => re.equipment?.photos || [])
      .find((p: any) => p.photoType === "general")?.photoPath;

    const finalPhoto = workLogEntry.requestEquipment
      .flatMap((re: any) => re.equipment?.photos || [])
      .find((p: any) => p.photoType === "final")?.photoPath;

    const formattedEntry = {
      id: workLogEntry.id,
      applicationNumber: workLogEntry.applicationNumber,
      applicationDate: workLogEntry.applicationDate?.toISOString() || "",
      typeWork: workLogEntry.typeWork?.name || "Не указано",
      trainNumber: workLogEntry.train?.number || "Не указано",
      carriageType: workLogEntry.requestCarriages[0]?.carriage?.type || "Не указано",
      carriageNumber: workLogEntry.requestCarriages[0]?.carriage?.number || "Не указано",

      equipment: equipmentTypes.join(", ") || "Не указано",
      equipmentType: equipmentTypes.join(", ") || "Не указано",
      equipmentTypes,

      serialNumber: serialNumbers.join(", "),
      serialNumbers,

      macAddress: macAddresses.join(", "),
      macAddresses,

      countEquipment: countEquipments.reduce((a: number, b: number) => a + b, 0),
      countEquipments,

      equipmentDetails: workLogEntry.requestEquipment.map((re: any) => ({
        equipmentType: re.equipment?.type || "Не указано",
        serialNumber: re.equipment?.serialNumber || "",
        macAddress: re.equipment?.macAddress || "",
        quantity: re.quantity || 0,
        photos: re.equipment?.photos || [],
      })),

      completedJob: workLogEntry.completedJob?.name || "Не указано",
      completedBy: workLogEntry.user?.name || "",

      currentLocation: workLogEntry.currentLocation?.name || "",

      photos: {
        carriagePhoto,
        equipmentPhoto: equipmentPhotos[0],
        equipmentPhotos:
          equipmentPhotos.length > 0 ? equipmentPhotos : undefined,
        serialPhoto: serialPhotos[0],
        serialPhotos: serialPhotos.length > 0 ? serialPhotos : undefined,
        macPhoto: macPhotos[0],
        macPhotos: macPhotos.length > 0 ? macPhotos : undefined,
        generalPhoto,
        finalPhoto,
      },

      userId: workLogEntry.userId,
      userName: workLogEntry.user?.name || "",
      userRole: workLogEntry.user?.role || "",
    };

    res.json({
      success: true,
      data: formattedEntry,
    });
  } catch (error) {
    console.error("Ошибка при получении записи журнала работ:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка при получении записи журнала работ",
    });
  }
};
