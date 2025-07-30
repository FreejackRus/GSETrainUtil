interface Work {
  description: string;
  equipment: string[];
  equipmentCount: number[];
}
interface Wagon {
  wagonNumber: string;
  wagonType: string;
  workPlace: string;
  works: Work[];
}

export const jsonData = {
  wagons: <Wagon[]>[
    {
      wagonNumber: "085 65012",
      wagonType: "Одноэтажный",
      workPlace: "Москва",
      works: [
        {
          description: "Выезд специалиста в депо",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Дополнительные работы по демонтажу оборудования",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Дополнительные работы по монтажу оборудования",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Монтаж коммутатора, черт. ТСФВ.467000.008",
          equipment: ["Источник питания (24V, 150W)"],
          equipmentCount: [1],
        },
        {
          description: "Монтаж маршрутизатора Mikrotik Hex RB750Gr3",
          equipment: ["Коммутатор, черт. ТСФВ.467000.008"],
          equipmentCount: [1],
        },
        {
          description: "Проверка кабельных трасс",
          equipment: [
            "Выключатель автоматический двухполюсный MD63 2P 16А C 6kA",
            "Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)",
            "Маршрутизатора Mikrotik Hex RB750Gr3",
            "Точка доступа ТСФВ.465000.006-005",
          ],
          equipmentCount: [1, 2, 1, 2],
        },
      ],
    },
    {
      wagonNumber: "085 65012",
      wagonType: "Одноэтажный",
      workPlace: "Москва",
      works: [
        {
          description: "Выезд специалиста в депо",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Дополнительные работы по демонтажу оборудования",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Дополнительные работы по монтажу оборудования",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Монтаж коммутатора, черт. ТСФВ.467000.008",
          equipment: ["Источник питания (24V, 150W)"],
          equipmentCount: [1],
        },
        {
          description: "Монтаж маршрутизатора Mikrotik Hex RB750Gr3",
          equipment: ["Коммутатор, черт. ТСФВ.467000.008"],
          equipmentCount: [1],
        },
        {
          description: "Проверка кабельных трасс",
          equipment: [
            "Выключатель автоматический двухполюсный MD63 2P 16А C 6kA",
            "Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)",
            "Маршрутизатора Mikrotik Hex RB750Gr3",
            "Точка доступа ТСФВ.465000.006-005",
          ],
          equipmentCount: [1, 2, 1, 2],
        },
      ],
    },
    {
      wagonNumber: "085 65012",
      wagonType: "Одноэтажный",
      workPlace: "Москва",
      works: [
        {
          description: "Выезд специалиста в депо",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Дополнительные работы по демонтажу оборудования",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Дополнительные работы по монтажу оборудования",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Монтаж коммутатора, черт. ТСФВ.467000.008",
          equipment: ["Источник питания (24V, 150W)"],
          equipmentCount: [1],
        },
        {
          description: "Монтаж маршрутизатора Mikrotik Hex RB750Gr3",
          equipment: ["Коммутатор, черт. ТСФВ.467000.008"],
          equipmentCount: [1],
        },
        {
          description: "Проверка кабельных трасс",
          equipment: [
            "Выключатель автоматический двухполюсный MD63 2P 16А C 6kA",
            "Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)",
            "Маршрутизатора Mikrotik Hex RB750Gr3",
            "Точка доступа ТСФВ.465000.006-005",
          ],
          equipmentCount: [1, 2, 1, 2],
        },
      ],
    },
    {
      wagonNumber: "020 20121",
      wagonType: "Одноэтажный",
      workPlace: "Москва",
      works: [
        {
          description: "Монтаж коммутатора, черт. ТСФВ.467000.008",
          equipment: [],
          equipmentCount: [],
        },
        {
          description: "Монтаж маршрутизатора Mikrotik Hex RB750Gr3",
          equipment: [],
          equipmentCount: [],
        },
      ],
    },
  ],
};
