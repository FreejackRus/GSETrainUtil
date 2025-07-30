interface WagonData {
  number: string;
  type: string;
}

interface EquipmentItem {
  name: string;
  serial: string;
  note?: string;
}

interface Act {
  actNumber: string;
  date: string;
  contractNumber: string;
  contractDate: string;
  wagonData: WagonData;
  equipmentData: EquipmentItem[];
}

export interface IJsonTechAct {
  acts: Act[];
}
export const actsData: IJsonTechAct = {
  acts: [
    {
      actNumber: "7.1",
      date: "«16» июля 2025 г.",
      contractNumber: "214-СИОИТ/ГСЭ25",
      contractDate: "«09» июня 2025 г.",
      wagonData: {
        number: "085 65012",
        type: "Одноэтажный (ресторан)",
      },
      equipmentData: [
        {
          name: "Маршрутизатор Mikrotik Hex RB750Gr3",
          serial: "HGW0AA2QSCX",
        },
        { name: "Коммутатор, черт. ТСФВ.467000.008", serial: "DT005581" },
        { name: "Источник питания (24V, 150W)", serial: "SC554F4469" },
        {
          name: "Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)",
          serial: "-",
          note: "2 шт.",
        },
        {
          name: "Выключатель автоматический двухполюсный MD63 2P 16А C 6kA",
          serial: "-",
        },
        { name: "Точка доступа ТСФВ.465000.006-005", serial: "HGY0AD1VA0C" },
        { name: "Точка доступа ТСФВ.465000.006-005", serial: "HGN09PS3ZSQ" },
      ],
    },
    {
      actNumber: "7.2",
      date: "«17» июля 2025 г.",
      contractNumber: "214-СИОИТ/ГСЭ25",
      contractDate: "«09» июня 2025 г.",
      wagonData: {
        number: "085 65013",
        type: "Двухэтажный",
      },
      equipmentData: [
        { name: "Коммутатор Cisco", serial: "CS123456" },
        { name: "Источник питания", serial: "PS987654", note: "Резервный" },
      ],
    },
  ],
};
