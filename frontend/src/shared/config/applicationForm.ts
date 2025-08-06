import type { ApplicationStep, ApplicationFormData } from '../../entities/application';

export const APPLICATION_STEPS: ApplicationStep[] = [
  { key: "workType", label: "Тип работ", type: "select" },
  { key: "trainNumber", label: "Номер поезда", type: "select" },
  { key: "carriages", label: "Вагоны и оборудование", type: "carriages" }, // Объединенный шаг для вагонов и оборудования
  { key: "workCompleted", label: "Работы выполнены", type: "select" },
  { key: "location", label: "Текущее место (депо/станция)", type: "select" },
  { key: "finalPhoto", label: "Общая фотография", type: "photo" },
];

export const INITIAL_FORM_DATA: ApplicationFormData = {
  workType: '',
  trainNumber: '',
  carriages: [], // Массив вагонов
  workCompleted: '',
  location: '',
  
  // Пути к изображениям
  photo: null
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