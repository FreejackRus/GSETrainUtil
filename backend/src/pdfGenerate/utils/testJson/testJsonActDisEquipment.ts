interface EquipmentItem {
  wagonNumber: string;
  equipmentName: string;
  serialNumber: string;
  quantity: string;
}

interface DismantlingActData {
  actNumber: string; // например "9.1"
  actDate: string; // например "«__» июля 2025 г."
  contractNumber: string; // например "214-СИОИТ/ГСЭ25"
  contractDate: string; // например "«09» июня 2025 г."
  applicationNumber: string; // например "9"
  equipment: EquipmentItem[];
}

export const testJsonActDisEquipment: DismantlingActData = {
    actNumber: "9.1",
    actDate: "«__» июля 2025 г.",
    contractNumber: "214-СИОИТ/ГСЭ25",
    contractDate: "«09» июня 2025 г.",
    applicationNumber: "9",
    equipment: [
      {
        wagonNumber: "088 20052",
        equipmentName: "Маршрутизатор Mikrotik Hex RB750Gr3",
        serialNumber: "HGQ09SGWKBJ",
        quantity: "1",
      },
      {
        wagonNumber: "088 20052",
        equipmentName: "Коммутатор, черт. ТСФВ.467000.008",
        serialNumber: "DT005276",
        quantity: "1",
      },
      {
        wagonNumber: "088 20052",
        equipmentName: "Источник питания (24V, 150W)",
        serialNumber: "SC554F4465",
        quantity: "1",
      },
      {
        wagonNumber: "088 20052",
        equipmentName: "Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)",
        serialNumber: "-",
        quantity: "2",
      },
      {
        wagonNumber: "088 20052",
        equipmentName:
          "Выключатель автоматический двухполюсный MD63 2P 16A C 6kA",
        serialNumber: "-",
        quantity: "1",
      },
      {
        wagonNumber: "088 20052",
        equipmentName: "Точка доступа ТСФВ.465000.006-005",
        serialNumber: "HGT0A13JJQ4",
        quantity: "1",
      },
      {
        wagonNumber: "096 27449",
        equipmentName: "Маршрутизатор Mikrotik Hex RB750Gr3",
        serialNumber: "HH80A6HH5KJ",
        quantity: "1",
      },
      {
        wagonNumber: "096 27449",
        equipmentName: "Коммутатор, черт. ТСФВ.467000.008",
        serialNumber: "DT005265",
        quantity: "1",
      },
      {
        wagonNumber: "096 27449",
        equipmentName: "Источник питания (24V, 150W)",
        serialNumber: "SC554F4466",
        quantity: "1",
      },
      {
        wagonNumber: "096 27449",
        equipmentName: "Коннектор SUPRLAN 8P8C STP Cat.6A (RJ-45)",
        serialNumber: "-",
        quantity: "2",
      },
      {
        wagonNumber: "096 27449",
        equipmentName:
          "Выключатель автоматический двухполюсный MD63 2P 16A C 6kA",
        serialNumber: "-",
        quantity: "1",
      },
      {
        wagonNumber: "096 27449",
        equipmentName: "Точка доступа ТСФВ.465000.006-005",
        serialNumber: "HH40AFTFYYM",
        quantity: "1",
      },
    ],
  };
