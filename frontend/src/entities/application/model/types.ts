// export interface Application {
//   id: string;
//   applicationNumber: number;
//   applicationDate: string;
//   status: 'draft' | 'completed' | 'cancelled';
//   // Связанные объекты с бэкенда
//   typeWork?: {
//     id: number;
//     name: string;
//   };
//   train?: {
//     id: number;
//     number: string;
//   };
//   carriages?: Array<{
//     id: number;
//     number: string;
//     type: string;
//     trainId: number;
//     carriagePhoto?: string | null;
//   }>;
//   completedJob?: {
//     id: number;
//     name: string;
//   };
//   currentLocation?: {
//     id: number;
//     name: string;
//   };
//   user?: {
//     id: number;
//     login: string;
//     role: string;
//     name: string;
//   };
//   // Устаревшие поля для обратной совместимости
//   workType?: string;
//   trainNumber?: string;
//   carriageType?: string;
//   carriageNumber?: string;
//   workCompleted?: string;
//   location?: string;
//   equipment: EquipmentItem[];
//   generalPhoto?: string | null;
//   finalPhoto?: string | null;
// }

import type { WorkLogEntry } from "../../worklog/model/types";

// Интерфейс для одного элемента оборудования
export interface EquipmentPhoto {
  type: string;
  path: string;
}

export interface EquipmentDetail {
  id: number;
  name: string;
  deviceType: string;
  typeWork: string;
  serialNumber: string;
  macAddress: string;
  quantity: number;
  photos: EquipmentPhoto[];
}

export interface CarriageWithEquipment {
  number: string;
  type: string;
  train: string;
  photo: string | null;
  equipment: EquipmentDetail[];
}

export interface Application {
  id: number;
  photo: string | null;           // фото самой заявки
  status: string;
  trainNumbers: string[];         // массив номеров поездов
  carriages: CarriageWithEquipment[];
  countEquipment: number;         // суммарное количество
  completedJob: string;
  currentLocation: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
  createdAt: string;              // ISO
  updatedAt: string;              // ISO
}


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
  carriageId?: string; // ID вагона, к которому привязано оборудование
  photos: {
    equipment?: File | null;
    serial?: File | null;
    mac?: File | null;
  };
}

// Интерфейс для вагона в форме
export interface CarriageFormItem {
  id?: string; // Уникальный ID для связи с оборудованием
  carriageNumber: string;
  carriageType: string;
  carriagePhoto?: File | null;
  equipment?: EquipmentFormItem[]; // Оборудование, привязанное к этому вагону
}

export interface ApplicationFormData {
  id?: number; // Для сохранения черновика
  workType: string;
  trainNumber: string;
  carriages: CarriageFormItem[]; // Массив вагонов
  workCompleted: string;
  location: string;
  photo?: File | null;
  status?: 'draft' | 'completed';
}

// Интерфейс для создания заявки (соответствует бэкенду)
// export interface CreateApplicationRequest {
//   id?: number; // Для обновления черновика
//   applicationDate?: string;
//   typeWork?: string;
//   trainNumber?: string;
//   carriages: Array<{
//     carriageNumber: string;
//     carriageType: string;
//     carriagePhoto?: File | null;
//     equipment?: Array<{ // Теперь оборудование может быть привязано к вагонам
//       equipmentType: string;
//       serialNumber: string;
//       macAddress: string;
//       quantity: number;
//       photos: {
//         equipmentPhoto?: File | null;
//         serialPhoto?: File | null;
//         macPhoto?: File | null;
//       };
//     }>;
//   }>;
//   completedJob?: string;
//   currentLocation?: string;
//   generalPhoto?: File | null;
//   finalPhoto?: File | null;
//   userId: number;
//   userName: string;
//   userRole: string;
//   status: 'draft' | 'completed';
// }

export interface CreateApplicationRequest {
  id?: number;
  trainNumbers: string[];
  carriages: Array<{
    carriageNumber: string;
    carriageType: string;
    carriagePhoto?: File | null;
    equipment: Array<{
      equipmentName: string;
      serialNumber: string;
      macAddress?: string;
      typeWork: string;
      quantity: number;
      photos?: {
        equipmentPhoto?: File | null;
        serialPhoto?: File | null;
        macPhoto?: File | null;
      };
    }>;
  }>;
  completedJob: string;
  currentLocation: string;
  photo?: File | null;
  userId: number;
  userName: string;
  userRole: string;
  status: 'draft' | 'completed';
}

// Интерфейс для шага формы заявки
export interface ApplicationStep {
  key: string;
  label: string;
  type: 'select' | 'input' | 'equipment' | 'carriages' | 'photo';
  photoField?: string;
}

export type ApplicationStepKey =
  | 'workType'
  | 'trainNumber'
  | 'carriages'
  | 'equipment'
  | 'workCompleted'
  | 'location'
  | 'finalPhoto';

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

// // Типы для журнала работ
// export interface WorkLogEntry {
//   countEquipments?: number[];
//   equipmentTypes?: string[];
//   serialNumbers?: string[];
//   id: number;
//   equipmentDetails?: {
//     macAddress?: string;
//     quantity?: number;
//     serialNumber?: string;
//     type?: string;
//     photos?: {
//       description?: string;
//       path?: string;
//       type?: string;
//     }[];
//   }[];
//   applicationNumber: number;
//   applicationDate: string;
//   typeWork: string;
//   trainNumber: string;
//   carriageType: string;
//   carriageNumber: string;
//   equipment: string;
//   serialNumber?: string;
//   macAddress?: string;
//   countEquipment: number;
//   completedBy: string;
//   currentLocation: string;
//   user: string;
//   photos: {
//     carriagePhoto?: string;
//     equipmentPhoto?: string;
//     serialPhoto?: string;
//     macPhoto?: string;
//     generalPhoto?: string;
//     finalPhoto?: string;
//   };
// }

export interface WorkLogResponse {
  success: boolean;
  data: WorkLogEntry[];
}
