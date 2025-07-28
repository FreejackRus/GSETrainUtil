export interface Application {
  id?: string;
  workType: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  equipment: string;
  serialNumber?: string; // Серийный номер оборудования
  macAddress?: string; // MAC-адрес оборудования
  count: number;
  workCompleted: string;
  location: string;
  carriagePhoto?: File | null;
  equipmentPhoto?: File | null;
  serialPhoto?: File | null;
  macPhoto?: File | null;
  generalPhoto?: File | null; // Общее фото оборудования
  finalPhoto?: File | null;
  applicationDate?: string; // Дата заявки для структуры папок
  createdAt?: string;
  updatedAt?: string;
}

export type ApplicationFormData = Application;

export interface ApplicationStep {
  key: string;
  label: string;
  type: "select" | "input" | "photo";
  photoField?: string;
  required?: boolean;
}

// Типы для вагонов
export interface CarriageEquipment {
  id: number;
  type: string;
  snNumber?: string;
  mac?: string;
  status: string;
  lastService: string;
  photo: string;
}

export interface Carriage {
  carriageNumber: string;
  carriageType: string;
  equipment: CarriageEquipment[];
}

export interface CarriageResponse {
  success: boolean;
  data: Carriage[];
}

// Типы для журнала работ
export interface WorkLogEntry {
  id: number;
  applicationNumber: number;
  applicationDate: string;
  typeWork: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  equipment: string;
  serialNumber?: string;
  macAddress?: string;
  countEquipment: number;
  completedBy: string;
  currentLocation: string;
  user: string;
  photos: {
    carriagePhoto?: string;
    equipmentPhoto?: string;
    serialPhoto?: string;
    macPhoto?: string;
    generalPhoto?: string;
    finalPhoto?: string;
  };
}

export interface WorkLogResponse {
  success: boolean;
  data: WorkLogEntry[];
}