import { apiClient } from '../../../shared/api';
import type { Application, CreateApplicationRequest } from '../model/types';

export const applicationApi = {
  create: async (data: CreateApplicationRequest): Promise<Application> => {
    const response = await apiClient.post('/applications', data);
    return response.data;
  },

  getAll: async (): Promise<Application[]> => {
    const response = await apiClient.get('/applications');
    return response.data;
  },

  getById: async (id: string): Promise<Application> => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateApplicationRequest>): Promise<Application> => {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/${id}`);
  },
};