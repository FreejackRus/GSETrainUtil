import { apiClient } from './base';

export interface ReferenceData {
  typeWork: string[];
  trainNumber: string[];
  typeWagon: string[];
  equipment: string[];
  currentLocation: string[];
}

interface WorkTypeResponse {
  name: string;
}

interface TrainNumberResponse {
  number: string;
}

interface CarriageTypeResponse {
  type: string;
}

interface EquipmentResponse {
  id: number;
  name: string;
  deviceId: number;
  serialNumber: string;
  macAddress: string;
  lastService: string;
  carriageId: number;
  carriage: {
    id: number;
    number: string;
    type: string;
    trainId: number;
    train: {
      id: number;
      number: string;
    };
  };
}

interface LocationResponse {
  name: string;
}

export const referenceApi = {
  getWorkTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/typeWork');
    return response.data.map((item: WorkTypeResponse) => item.name);
  },

  getTrainNumbers: async (): Promise<string[]> => {
    const response = await apiClient.get('/trainNumber');
    return response.data.map((item: TrainNumberResponse) => item.number);
  },

  getCarriageTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/typeCarriage');
    return response.data.map((item: CarriageTypeResponse) => item.type);
  },

  getEquipmentTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/equipment');
    console.log(response);

    return response.data.map((item: EquipmentResponse) => item.name);
  },

  getLocations: async (): Promise<string[]> => {
    const response = await apiClient.get('/currentLocation');
    return response.data.map((item: LocationResponse) => item.name);
  },

  getAllReferences: async (): Promise<ReferenceData> => {
    const [workTypes, trainNumbers, carriageTypes, equipmentTypes, locations] =
      await Promise.allSettled([
        referenceApi.getWorkTypes(),
        referenceApi.getTrainNumbers(),
        referenceApi.getCarriageTypes(),
        referenceApi.getEquipmentTypes(),
        referenceApi.getLocations(),
      ]);

    return {
      typeWork: workTypes.status === 'fulfilled' ? workTypes.value : [],
      trainNumber: trainNumbers.status === 'fulfilled' ? trainNumbers.value : [],
      typeWagon: carriageTypes.status === 'fulfilled' ? carriageTypes.value : [],
      equipment: equipmentTypes.status === 'fulfilled' ? equipmentTypes.value : [],
      currentLocation: locations.status === 'fulfilled' ? locations.value : [],
    };
  },
};
