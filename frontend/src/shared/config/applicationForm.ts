import type { ApplicationStep, ApplicationFormData } from '../../entities/application';

export const APPLICATION_STEPS: ApplicationStep[] = [
  { key: "workType", label: "Тип работ", type: "select" },
  { key: "trainNumber", label: "Номер поезда", type: "select" },
  { key: "carriageType", label: "Тип вагона", type: "select" },
  { key: "carriageNumber", label: "Номер вагона", type: "input", photoField: "carriagePhoto" },
  { key: "equipment", label: "Наименование и фото оборудования", type: "select", photoField: "equipmentPhoto" },
  { key: "serialNumber", label: "Серийный номер", type: "input", photoField: "serialPhoto" },
  { key: "macAddress", label: "MAC-адрес (если есть)", type: "input", photoField: "macPhoto" },
  { key: "count", label: "Количество", type: "input" },
  { key: "workCompleted", label: "Работы выполнены", type: "select" },
  { key: "location", label: "Текущее место (депо/станция)", type: "select" },
  { key: "finalPhoto", label: "Общая фотография", type: "photo" },
];

export const INITIAL_FORM_DATA: ApplicationFormData = {
  workType: '',
  trainNumber: '',
  carriageType: '',
  carriageNumber: '',
  equipment: '',
  serialNumber: '',
  macAddress: '',
  count: 1,
  workCompleted: '',
  location: '',
  applicationDate: new Date().toISOString().split('T')[0],
  
  // Пути к изображениям
  carriagePhoto: null,
  equipmentPhoto: null,
  serialPhoto: null,
  macPhoto: null,
  generalPhoto: null,
  finalPhoto: null,
};

export const FALLBACK_DATA = {
  workTypes: ["Монтаж", "Демонтаж"],
  trainNumbers: ["001", "002", "003"],
  carriageTypes: [ "Штаб-1", "Лин-1", "Лин-1 (аренда)", "ВР-1"],
  equipmentTypes: ["GSE Terminal", "GSE Router", "GSE Switch", "GSE Access Point", "GSE Controller", "GSE Sensor"],
  locations: ["Депо #1", "Депо #2"],
};