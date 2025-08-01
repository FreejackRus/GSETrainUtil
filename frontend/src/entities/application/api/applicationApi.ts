import { apiClient } from '../../../shared/api';
import type { Application, CreateApplicationRequest } from '../model/types';

export const applicationApi = {
  create: async (data: CreateApplicationRequest): Promise<Application> => {
    const response = await apiClient.post('/applications', data);
    return response.data;
  },

  getAll: async (): Promise<Application[]> => {
    const response = await apiClient.get('/applications');
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  // Получить заявки пользователя
  getUserApplications: async (userId: number): Promise<Application[]> => {
    const response = await apiClient.get(`/applications?userId=${userId}`);
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  getById: async (id: string): Promise<Application> => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  update: async (id: string, data: Partial<CreateApplicationRequest>): Promise<Application> => {
    const response = await apiClient.put(`/applications/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/${id}`);
  },

  // Сохранить черновик
  saveDraft: async (data: CreateApplicationRequest): Promise<Application> => {
    const response = await apiClient.post('/applications/draft', { ...data, status: 'draft' });
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  // Получить все черновики
  getDrafts: async (userId: number, userRole: string = 'engineer'): Promise<Application[]> => {
    const response = await apiClient.get(`/applications/drafts?userId=${userId}&userRole=${userRole}`);
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  // Обновить черновик
  updateDraft: async (id: number, data: CreateApplicationRequest): Promise<Application> => {
    const response = await apiClient.put(`/applications/draft/${id}`, { ...data, status: 'draft' });
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  // Завершить черновик (перевести в статус completed)
  completeDraft: async (id: number, data: Partial<CreateApplicationRequest>): Promise<Application> => {
    const response = await apiClient.put(`/applications/${id}/complete`, { ...data, status: 'completed' });
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  // Удалить черновик
  deleteDraft: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/drafts/${id}`);
  },

  // Загрузка файлов
  uploadFiles: async (files: FormData): Promise<{ [key: string]: string }> => {
    const response = await apiClient.post('/applications/upload', files, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};