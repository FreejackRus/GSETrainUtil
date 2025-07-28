export interface Application {
  id: string;
  applicationNumber: number;
  applicationDate: string;
  workType: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  equipment: string;
  serialNumber: string;
  macAddress: string;
  count: number;
  workCompleted: string;
  location: string;
  carriagePhoto?: File | null;
  equipmentPhoto?: File | null;
  serialPhoto?: File | null;
  macPhoto?: File | null;
  generalPhoto?: File | null;
  finalPhoto?: File | null;
}

export interface ApplicationFormData {
  workType: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  equipment: string;
  serialNumber: string;
  macAddress: string;
  count: number;
  workCompleted: string;
  location: string;
  carriagePhoto?: File | null;
  equipmentPhoto?: File | null;
  serialPhoto?: File | null;
  macPhoto?: File | null;
  generalPhoto?: File | null;
  finalPhoto?: File | null;
}

// Интерфейс для создания заявки (соответствует бэкенду)
export interface CreateApplicationRequest {
  applicationNumber: number;
  applicationDate: string;
  typeWork: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  equipment: Array<{
    equipmentType: string;
    serialNumber: string;
    macAddress: string;
    countEquipment: number;
    equipmentPhoto?: string | null;
    serialPhoto?: string | null;
    macPhoto?: string | null;
  }>;
  completedJob: string;
  currentLocation: string;
  carriagePhoto?: string | null;
  generalPhoto?: string | null;
  finalPhoto?: string | null;
  userId: number;
  userName: string;
  userRole: string;
}

export type ApplicationStep = 
  | 'workType'
  | 'trainNumber'
  | 'carriageType'
  | 'equipmentWithPhoto'
  | 'serialNumber'
  | 'macAddress'
  | 'workCompleted'
  | 'location';

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