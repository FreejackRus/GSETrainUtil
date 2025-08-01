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

  getAll: async (): Promise<any[]> => {
    const response = await apiClient.get('/applications');
    const applications = response.data;
    
    // Преобразуем данные из формата API в формат фронтенда
    return applications.map((app: any) => ({
      id: app.id.toString(),
      applicationNumber: app.applicationNumber,
      applicationDate: app.applicationDate,
      status: app.status,
      workType: app.typeWork?.name || '',
      trainNumber: app.train?.number || '',
      carriageType: app.carriage?.type || '',
      carriageNumber: app.carriage?.number || '',
      equipment: [], // TODO: добавить оборудование когда будет готово
      workCompleted: app.completedJob?.name || '',
      location: app.currentLocation?.name || '',
      carriagePhoto: app.carriagePhoto,
      generalPhoto: app.generalPhoto,
      finalPhoto: app.finalPhoto,
      user: 'Текущий пользователь' // TODO: добавить реального пользователя
    }));
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

  // Методы для работы с черновиками
  saveDraft: async (data: any): Promise<ApplicationResponse> => {
    const response = await apiClient.post('/applications/draft', data);
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  updateDraft: async (id: number, data: any): Promise<ApplicationResponse> => {
    const response = await apiClient.put(`/applications/draft/${id}`, data);
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  getDrafts: async (userId: number, userRole?: string): Promise<ApplicationResponse> => {
    const roleParam = userRole ? `&userRole=${userRole}` : '';
    const response = await apiClient.get(`/applications/drafts?userId=${userId}${roleParam}`);
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  completeDraft: async (data: any): Promise<ApplicationResponse> => {
    const response = await apiClient.post('/applications', data);
    return response.data.data; // Извлекаем данные из структуры { success, message, data }
  },

  deleteDraft: async (id: string): Promise<ApplicationResponse> => {
    const response = await apiClient.delete(`/applications/drafts/${id}`);
    return response.data;
  },
};