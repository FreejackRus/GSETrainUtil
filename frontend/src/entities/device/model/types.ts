export interface Device {
  id: number;
  count: number;
  name: string;
  status: string;
}

export interface DeviceResponse {
  data: Device[];
}

export interface CreateDeviceData {
  name: string;
  count: number;
  status: string;
}