import { apiClient } from '../../../shared/api';
import type { Application, CreateApplicationRequest } from '../model/types';

export const applicationApi = {
  create: async (data: CreateApplicationRequest): Promise<Application> => {
    try {
      console.log("=== API: Отправка запроса на создание заявки ===");
      console.log("URL:", '/applications');
      console.log("Данные запроса:", data);

      // TODO: сделать через абстрактную функцию
      const fd = new FormData();

      if (data.id != null) fd.append('id', String(data.id));
      if (data.applicationDate) fd.append('applicationDate', data.applicationDate);
      if (data.typeWork) fd.append('typeWork', data.typeWork);
      if (data.trainNumber) fd.append('trainNumber', data.trainNumber);
      // if (data.carriageType) fd.append('carriageType', data.carriageType);
      // if (data.carriageNumber) fd.append('carriageNumber', data.carriageNumber);
      if (data.completedJob) fd.append('completedJob', data.completedJob);
      if (data.currentLocation) fd.append('currentLocation', data.currentLocation);
      fd.append('userId',   String(data.userId));
      fd.append('userName', data.userName);
      fd.append('userRole', data.userRole);
      fd.append('status',   data.status);

      data.equipment.forEach((item, index) => {
        fd.append(`equipment[${index}][equipmentType]`, item.equipmentType);
        fd.append(`equipment[${index}][serialNumber]`, item.serialNumber);
        fd.append(`equipment[${index}][macAddress]`, item.macAddress);
        fd.append(`equipment[${index}][quantity]`, String(item.quantity));
        if (item.photos.equipmentPhoto) {
          fd.append(
              `equipment[${index}][photos][equipmentPhoto]`,
              item.photos.equipmentPhoto
          );
        }
        if (item.photos.serialPhoto) {
          fd.append(
              `equipment[${index}][photos][serialPhoto]`,
              item.photos.serialPhoto
          );
        }
        if (item.photos.macPhoto) {
          fd.append(
              `equipment[${index}][photos][macPhoto]`,
              item.photos.macPhoto
          );
        }
      });
      fd.append('equipmentLength', String(data.equipment.length));

      if (data.carriagePhoto) fd.append('carriagePhoto', data.carriagePhoto);
      if (data.generalPhoto) fd.append('generalPhoto', data.generalPhoto);
      if (data.finalPhoto) fd.append('finalPhoto', data.finalPhoto);

      // TODO: Проверить тут
      const response = await apiClient.post('/applications', fd);
      
      console.log("=== API: Успешный ответ ===");
      console.log("Статус:", response.status);
      console.log("Данные ответа:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("=== API: Ошибка при создании заявки ===");
      console.error("Тип ошибки:", error?.constructor?.name);
      console.error("Сообщение:", error?.message);
      console.error("Статус:", error?.response?.status);
      console.error("Данные ошибки:", error?.response?.data);
      console.error("Заголовки ошибки:", error?.response?.headers);
      console.error("Конфигурация запроса:", error?.config);
      console.error("Полная ошибка:", error);
      throw error;
    }
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
    try {
      console.log("=== API: Отправка запроса на завершение черновика ===");
      console.log("URL:", `/applications/${id}/complete`);
      console.log("ID черновика:", id);
      console.log("Данные запроса:", data);
      
      const response = await apiClient.put(`/applications/${id}/complete`, { ...data, status: 'completed' });
      
      console.log("=== API: Успешное завершение черновика ===");
      console.log("Статус:", response.status);
      console.log("Данные ответа:", response.data);
      
      return response.data.data; // Извлекаем данные из структуры { success, message, data }
    } catch (error) {
      console.error("=== API: Ошибка при завершении черновика ===");
      console.error("ID черновика:", id);
      console.error("Тип ошибки:", error?.constructor?.name);
      console.error("Сообщение:", error?.message);
      console.error("Статус:", error?.response?.status);
      console.error("Данные ошибки:", error?.response?.data);
      console.error("Заголовки ошибки:", error?.response?.headers);
      console.error("Конфигурация запроса:", error?.config);
      console.error("Полная ошибка:", error);
      throw error;
    }
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