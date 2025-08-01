export interface Application {
  id: string;
  applicationNumber: number;
  applicationDate: string;
  status: 'draft' | 'completed' | 'cancelled';
  workType?: string;
  trainNumber?: string;
  carriageType?: string;
  carriageNumber?: string;
  equipment: EquipmentItem[];
  workCompleted?: string;
  location?: string;
  carriagePhoto?: string | null;
  generalPhoto?: string | null;
  finalPhoto?: string | null;
  user: string;
}

// Интерфейс для одного элемента оборудования
export interface EquipmentItem {
  id?: number;
  type: string;
  serialNumber: string;
  macAddress: string;
  quantity: number;
  photos: {
    equipmentPhoto?: File | string | null;
    serialPhoto?: File | string | null;
    macPhoto?: File | string | null;
  };
}

// Интерфейс для одного элемента оборудования в форме
export interface EquipmentFormItem {
  equipmentType: string;
  serialNumber: string;
  macAddress: string;
  quantity: number;
  photos: {
    equipment?: File | null;
    serial?: File | null;
    mac?: File | null;
    general?: File | null;
  };
}

export interface ApplicationFormData {
  id?: number; // Для сохранения черновика
  workType: string;
  trainNumber: string;
  carriageType: string;
  carriageNumber: string;
  equipment: EquipmentFormItem[]; // Массив оборудования
  workCompleted: string;
  location: string;
  carriagePhoto?: File | null;
  generalPhoto?: File | null;
  finalPhoto?: File | null;
  status?: 'draft' | 'completed';
}

// Интерфейс для создания заявки (соответствует бэкенду)
export interface CreateApplicationRequest {
  id?: number; // Для обновления черновика
  applicationDate?: string;
  typeWork?: string;
  trainNumber?: string;
  carriageType?: string;
  carriageNumber?: string;
  equipment: Array<{
    equipmentType: string;
    serialNumber: string;
    macAddress: string;
    quantity: number;
    photos: {
      equipmentPhoto?: string | null;
      serialPhoto?: string | null;
      macPhoto?: string | null;
    };
  }>;
  completedJob?: string;
  currentLocation?: string;
  carriagePhoto?: string | null;
  generalPhoto?: string | null;
  finalPhoto?: string | null;
  userId: number;
  userName: string;
  userRole: string;
  status: 'draft' | 'completed';
}

// Интерфейс для шага формы заявки
export interface ApplicationStep {
  key: string;
  label: string;
  type: 'select' | 'input' | 'equipment' | 'photo';
  photoField?: string;
}

export type ApplicationStepKey = 
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
  countEquipments?:number[]
  equipmentTypes?:string[]
  serialNumbers?:string[]
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