import { apiClient } from './base';

export interface ApplicationData {
  id?: number;
  applicationNumber: number;
  applicationDate?: string;
  typeWorkId: number;
  trainNumberId: number;
  carriageNumber: string;
  equipmentId: number;
  countEquipment: number;
  completedJobId: number;
  currentLocationId: number;
  carriagePhoto?: string;
  equipmentPhoto?: string;
  serialPhoto?: string;
  macPhoto?: string;
  generalPhoto?: string;
  finalPhoto?: string;
  userId: number;
}

export interface ApplicationResponse {
  success: boolean;
  message?: string;
  data?: ApplicationData | ApplicationData[];
}

export const applicationApi = {
  create: async (data: ApplicationData): Promise<ApplicationResponse> => {
    const response = await apiClient.post('/applications', data);
    return response.data;
  },

  getAll: async (): Promise<ApplicationResponse> => {
    const response = await apiClient.get('/applications');
    return response.data;
  },

  getById: async (id: number): Promise<ApplicationResponse> => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<ApplicationData>): Promise<ApplicationResponse> => {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApplicationResponse> => {
    const response = await apiClient.delete(`/applications/${id}`);
    return response.data;
  },
};