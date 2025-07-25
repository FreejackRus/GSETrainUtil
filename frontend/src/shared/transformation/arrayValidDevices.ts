import { deviceApi, type Device } from '../../entities';

export const arrayValidDevices = async (): Promise<Device[]> => {
  try {
    const response = await deviceApi.getDevices();
    
    // Безопасная проверка структуры данных
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Неожиданная структура данных в arrayValidDevices:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
};
