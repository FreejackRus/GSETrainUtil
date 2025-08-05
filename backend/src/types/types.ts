export interface equipmentDetails {
  macAddress?: string;
  quantity?: number;
  serialNumber?: string;
  carriageNumber?: string;
  type?: string;
}[];

export interface ResponseJson {
  applicationNumber: number;
  carriageNumber: string;
  carriageType: string;
  equipmentTypes: string[];
  countEquipments: number[];
  serialNumbers: string[];
  applicationDate: string;
  contractNumber: string;
  actDate: string;
  typeWork: string;
  trainNumber: string;
  contractDate?: string;
  currentLocation?: string;
  equipmentDetails?: equipmentDetails[]
}
