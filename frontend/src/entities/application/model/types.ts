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