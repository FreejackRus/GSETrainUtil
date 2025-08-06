export interface EquipmentDetail {
  id: number;
  name: string;
  deviceType: string;
  typeWork: string;
  serialNumber: string;
  macAddress: string;
  countEquipment: number;
  equipmentPhoto?: string;
  serialPhoto?: string;
  macPhoto?: string;
}

export interface WorkLogEntry {
  id: number;
  applicationNumber: number;
  applicationDate: string;
  typeWork: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  equipment?: string; // Для совместимости
  equipmentType: string; // Для совместимости - объединенная строка
  equipmentTypes?: string[]; // Массив типов оборудования
  serialNumber: string; // Для совместимости - объединенная строка
  serialNumbers?: string[]; // Массив серийных номеров
  macAddress: string; // Для совместимости - объединенная строка
  macAddresses?: string[]; // Массив MAC адресов
  countEquipment: number; // Общее количество
  countEquipments?: number[]; // Массив количеств
  equipmentDetails?: EquipmentDetail[]; // Детальная информация о каждом оборудовании
  completedJob: string;
  completedBy?: string; // Для совместимости
  currentLocation: string;
  photos: {
    carriagePhoto?: string;
    equipmentPhoto?: string; // Первое фото для совместимости
    equipmentPhotos?: string[]; // Массив всех фото оборудования
    serialPhoto?: string; // Первое фото для совместимости
    serialPhotos?: string[]; // Массив всех фото серийных номеров
    macPhoto?: string; // Первое фото для совместимости
    macPhotos?: string[]; // Массив всех фото MAC адресов
    generalPhoto?: string;
    finalPhoto?: string;
  };
  userId: number;
  userName: string;
  userRole: string;
}

export interface WorkLogResponse {
  success: boolean;
  data: WorkLogEntry[];
}

export interface WorkLogDetailResponse {
  success: boolean;
  data: WorkLogEntry;
}

export interface WorkLogUpdateResponse {
  success: boolean;
  data: WorkLogEntry;
  message: string;
}