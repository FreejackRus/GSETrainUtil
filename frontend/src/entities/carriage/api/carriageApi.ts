import { apiClient } from '../../../shared/api';

interface CarriageEquipment {
  id: number;
  snNumber?: string;
  mac?: string;
  lastService: string;
  name: string;
}

interface Carriage {
  carriageNumber: string;
  carriageType: string;
  trainNumber: string;
  trainNumbers:string[]
  equipment: CarriageEquipment[];
}

interface CarriageResponse {
  success: boolean;
  data: Carriage[];
}

export const carriageApi = {
  getCarriages: async (): Promise<CarriageResponse> => {
    const response = await apiClient.get('/carriages');
    return response.data;
  },

  getCarriageByNumber: async (carriageNumber: string): Promise<{ success: boolean; data: Carriage }> => {
    const response = await apiClient.get(`/carriages/${carriageNumber}`);
    return response.data;
  },
};