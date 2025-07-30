interface Item {
  name: string;
  count: number;
  unit: string;
  price: number;
}

interface ActData {
  actNumber: string;
  actDate: string;
  contractNumber: string;
  contractDate: string;
  applicationNumber: string;
  items: Item[];
}

export const testJsonActWorksCompleted: ActData = {
    actNumber: "7",
    actDate: "16.07.2025",
    contractNumber: "214-СИОИТ/ГСЭ25",
    contractDate: "09.06.2025",
    applicationNumber: "9",
    items: [
      {
        name: "Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)",
        count: 16,
        unit: "шт.",
        price: 3333.33,
      },
      {
        name: "Монтаж коммутатора, черт. ТСФВ.467000.008",
        count: 16,
        unit: "усл.",
        price: 3333.33,
      },
      {
        name: "Монтаж точки доступа ТСФВ.465000.006-005",
        count: 16,
        unit: "усл.",
        price: 3333.33,
      },
      {
        name: "Дополнительные работы по монтажу оборудования",
        count: 17,
        unit: "усл.",
        price: 5833.33,
      },
      {
        name: "Выезд специалиста в депо",
        count: 1,
        unit: "усл.",
        price: 3333.33,
      },
    ],
  };
