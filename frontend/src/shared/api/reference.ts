import { apiClient } from './base';

export interface ReferenceData {
  typeWork: string[];
  trainNumber: string[];
  typeWagon: string[];
  equipment: string[];
  currentLocation: string[];
}

interface WorkTypeResponse {
  typeWork: string;
}

interface TrainNumberResponse {
  trainNumber: string;
}

interface CarriageTypeResponse {
  typeWagon: string;
}

interface EquipmentResponse {
  type: string;
}

interface LocationResponse {
  currentLocation: string;
}

export const referenceApi = {
  getWorkTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/typeWork');
    return response.data.map((item: WorkTypeResponse) => item.typeWork);
  },

  getTrainNumbers: async (): Promise<string[]> => {
    const response = await apiClient.get('/trainNumber');
    return response.data.map((item: TrainNumberResponse) => item.trainNumber);
  },

  getCarriageTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/typeCarriage');
    return response.data.map((item: CarriageTypeResponse) => item.typeWagon);
  },

  getEquipmentTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/equipment');
    return response.data.map((item: EquipmentResponse) => item.type);
  },

  getLocations: async (): Promise<string[]> => {
    const response = await apiClient.get('/currentLocation');
    return response.data.map((item: LocationResponse) => item.currentLocation);
  },

  getAllReferences: async (): Promise<ReferenceData> => {
    const [workTypes, trainNumbers, carriageTypes, equipmentTypes, locations] = await Promise.allSettled([
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