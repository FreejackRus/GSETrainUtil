export interface Device {
  id: number;
  name: string;
  deviceType: string;
  snNumber: string;
  mac: string;
  lastService: string;
  isActive: boolean;
  carriageType: string;
  carriageNumber: string;
  trainNumber: string;
  trainNumbers: string[]
}

export interface DeviceResponse {
  data: Device[];
}

export interface CreateDeviceData {
  name: string;
  count: number;
  status: string;
}
