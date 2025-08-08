export interface equipmentDetails {
  macAddress?: string;
  serialNumber?: string;
  carriageNumber?: string;
  name: string;
  typeWork: string;
  carriageType?:string
}[];

export interface ResponseJson {
  applicationNumber: number;
  carriageNumbers: {
    number: string;
    type: string;
    train: string;
    photo: string;
}[];
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
