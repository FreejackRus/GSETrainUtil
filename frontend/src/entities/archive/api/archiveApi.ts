import { API_BASE_URL } from '../../../shared/api/base';

export interface StorageInfo {
  totalSize: number;
  totalFiles: number;
  folders: number;
  sizeFormatted: string;
}

export interface CleanupResult {
  deletedFiles: number;
  freedSpace: number;
  freedSpaceFormatted: string;
}



/**
 * API для работы с архивированием фотографий
 */
export const archiveApi = {
  /**
   * Скачивает архив фотографий для конкретной заявки
   */
  async downloadApplicationArchive(applicationId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/archive/application/${applicationId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании архива');
      }

      // Получаем имя файла из заголовков
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `application_${applicationId}_archive.zip`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }

      // Создаем blob и скачиваем файл
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Очищаем ресурсы
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Ошибка при скачивании архива заявки:', error);
      throw error;
    }
  },

  /**
   * Скачивает архив фотографий за период
   */
  async downloadArchiveByDateRange(dateFrom: string, dateTo: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/archive/date-range?dateFrom=${dateFrom}&dateTo=${dateTo}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании архива');
      }

      // Получаем имя файла из заголовков
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `applications_${dateFrom}_to_${dateTo}.zip`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }

      // Создаем blob и скачиваем файл
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Очищаем ресурсы
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Ошибка при скачивании архива за период:', error);
      throw error;
    }
  },

  /**
   * Получает информацию о размере хранилища
   */
  async getStorageInfo(): Promise<StorageInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/archive/storage-info`);
      
      if (!response.ok) {
        throw new Error('Ошибка при получении информации о хранилище');
      }

      const data = await response.json();
      return data.data;
      
    } catch (error) {
      console.error('Ошибка при получении информации о хранилище:', error);
      throw error;
    }
  },

  /**
   * Очищает старые фотографии
   */
  async cleanupOldPhotos(daysOld: number = 365): Promise<CleanupResult> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/archive/cleanup?daysOld=${daysOld}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при очистке старых фотографий');
      }

      const data = await response.json();
      return data.data;
      
    } catch (error) {
      console.error('Ошибка при очистке старых фотографий:', error);
      throw error;
    }
  }
};