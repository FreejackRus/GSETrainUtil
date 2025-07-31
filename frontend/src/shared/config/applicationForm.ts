import type { ApplicationStep, ApplicationFormData } from '../../entities/application';

export const APPLICATION_STEPS: ApplicationStep[] = [
  { key: "workType", label: "Тип работ", type: "select" },
  { key: "trainNumber", label: "Номер поезда", type: "select" },
  { key: "carriageType", label: "Тип вагона", type: "select" },
  { key: "carriageNumber", label: "Номер вагона", type: "input", photoField: "carriagePhoto" },
  { key: "equipment", label: "Оборудование", type: "equipment" }, // Новый тип для множественного оборудования
  { key: "workCompleted", label: "Работы выполнены", type: "select" },
  { key: "location", label: "Текущее место (депо/станция)", type: "select" },
  { key: "finalPhoto", label: "Общая фотография", type: "photo" },
];

export const INITIAL_FORM_DATA: ApplicationFormData = {
  workType: '',
  trainNumber: '',
  carriageType: '',
  carriageNumber: '',
  equipment: [], // Массив оборудования
  workCompleted: '',
  location: '',
  
  // Пути к изображениям
  carriagePhoto: null,
  generalPhoto: null,
  finalPhoto: null,
};

export const FALLBACK_DATA = {
  workTypes: ["Монтаж", "Демонтаж"],
  trainNumbers: ["001", "002", "003"],
  carriageTypes: [ "Штаб-1", "Лин-1", "Лин-1 (аренда)", "ВР-1"],
  equipmentTypes: [
    "Промышленный компьютер БТ-37-НМК (5550.i5 OSUb2204)",
    "Маршрутизатор Mikrotik Hex RB750Gr3", 
    "Коммутатор, черт. ТСФВ.467000.008",
    "Источник питания (24V, 150W)",
    "Точка доступа ТСФВ.465000.006-005"
  ],
  locations: ["Депо #1", "Депо #2"],
};