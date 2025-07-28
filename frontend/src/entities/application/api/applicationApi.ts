import { apiClient } from '../../../shared/api';
import type { Application } from '../model/types';
import type { ApplicationFormData } from '../model/types';

export const applicationApi = {
  create: async (data: ApplicationFormData): Promise<Application> => {
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

  update: async (id: string, data: Partial<ApplicationFormData>): Promise<Application> => {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/${id}`);
  },
};