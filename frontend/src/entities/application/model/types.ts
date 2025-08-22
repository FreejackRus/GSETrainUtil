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

// // Интерфейс для одного элемента оборудования
// export interface EquipmentPhoto {
//   type: string;
//   path: string;
// }
//
// export interface EquipmentDetail {
//   id: number;
//   name: string;
//   deviceType: string;
//   typeWork: string;
//   serialNumber: string;
//   macAddress: string;
//   quantity: number;
//   photos: EquipmentPhoto[];
// }
//
// export interface CarriageWithEquipment {
//   number: string;
//   type: string;
//   train: string;
//   photo: string | null;
//   equipment: EquipmentDetail[];
// }
//
// export interface Application {
//   id: number;
//   photo: string | null;           // фото самой заявки
//   status: string;
//   trainNumbers: string[];         // массив номеров поездов
//   carriages: CarriageWithEquipment[];
//   countEquipment: number;         // суммарное количество
//   completedJob: string;
//   currentLocation: string;
//   user: {
//     id: number;
//     name: string;
//     role: string;
//   };
//   createdAt: string;              // ISO
//   updatedAt: string;              // ISO
// }

// Фото, которые приходят с бэка и которые мы же шлём при аплоаде
export type EquipmentPhotoType = 'equipment' | 'serial' | 'mac';

export interface EquipmentPhoto {
  type: EquipmentPhotoType;
  path: string; // относительный путь, дергать как GET /files/<path>
}

export interface EquipmentDetail {
  id: number;
  name: string;
  typeWork: string;
  serialNumber: string | null;
  macAddress: string | null;
  photos: EquipmentPhoto[];
}

export interface CarriageWithEquipment {
  generalPhotoEquipmentCarriage: string | null;
  number: string;
  type: string;
  train: string;         // номер поезда
  photo: string | null;  // фото типа "carriage" (если есть)
  equipment: EquipmentDetail[];
}

export interface Application {
  id: number;
  photo: null; // общего фото заявки больше нет
  status: 'draft' | 'completed';
  trainNumbers: string[];
  carriages: CarriageWithEquipment[];
  countEquipment: number;
  performer: string;
  currentLocation: string;
  user: { id: number; name: string; role: 'admin' | 'engineer' };
  createdAt: string;
  updatedAt: string;
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

// // Интерфейс для одного элемента оборудования в форме
// export interface EquipmentFormItem {
//   equipmentType: string;
//   serialNumber: string;
//   macAddress: string;
//   quantity: number;
//   carriageId?: string; // ID вагона, к которому привязано оборудование
//   photos: {
//     equipment?: File | null;
//     serial?: File | null;
//     mac?: File | null;
//   };
// }

// // Интерфейс для вагона в форме
// export interface CarriageFormItem {
//   id?: string; // Уникальный ID для связи с оборудованием
//   carriageNumber: string;
//   carriageType: string;
//   carriagePhoto?: File | null;
//   equipment?: EquipmentFormItem[]; // Оборудование, привязанное к этому вагону
// }

// export interface ApplicationFormData {
//   id?: number; // Для сохранения черновика
//   workType: string;
//   trainNumber: string;
//   carriages: CarriageFormItem[]; // Массив вагонов
//   workCompleted: string;
//   location: string;
//   photo?: File | null;
//   status?: 'draft' | 'completed';
// }

export interface EquipmentFormItem {
  equipmentType: string;
  typeWork: string;
  serialNumber: string;
  macAddress: string;
  quantity: number;
  carriageId?: string;
  photos: {
    equipment?: File | null|string;
    serial?: File | null|string;
    mac?: File | null|string;
  };
}

export interface CarriageFormItem {
  id?: string;
  carriageNumber: string;
  carriageType: string;
  carriagePhotos: {
    carriage: File | null;
    equipment: File | null;
  };
  equipment?: EquipmentFormItem[];
}

export interface TrainFormItem {
  trainNumber: string;
  carriages: CarriageFormItem[];
}

export interface ApplicationFormData {
  trains: TrainFormItem[];
  workCompleted: string;
  location: string;
  photo?: File | null;
  status?: 'draft' | 'completed';
}

export interface CreateApplicationRequest {
  id?: number;
  status: 'draft' | 'completed';
  userId: number;
  performer: string;         // раньше не было — теперь ОБЯЗАТЕЛЬНО для completed
  currentLocation: string;   // тоже обязательно для completed
  requestTrains: Array<{
    trainNumber: string;
    carriages: Array<{
      carriageNumber: string;
      carriageType: string;
      carriagePhotos?: {
        carriage?: File | null;    // фото номера вагона
        equipment?: File | null;   // общий снимок "оборудования в вагоне"
      };
      equipments: Array<{
        equipmentName: string;
        serialNumber?: string;
        macAddress?: string;
        typeWork: string;
        photos?: {
          equipment?: File | null; // общий вид
          serial?: File | null;    // серийник
          mac?: File | null;       // MAC
        };
      }>;
    }>;
  }>;
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
