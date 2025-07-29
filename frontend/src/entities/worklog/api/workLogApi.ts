import { apiClient } from '../../../shared/api';
import type { WorkLogResponse, WorkLogEntry, WorkLogDetailResponse, WorkLogUpdateResponse } from '../model/types';

export const workLogApi = {
  getWorkLog: async (): Promise<WorkLogResponse> => {
    const response = await apiClient.get('/work-log');
    return response.data;
  },

  getWorkLogById: async (id: number): Promise<WorkLogDetailResponse> => {
    const response = await apiClient.get(`/work-log/${id}`);
    return response.data;
  },

  updateWorkLogById: async (id: number, data: Partial<WorkLogEntry>): Promise<WorkLogUpdateResponse> => {
    const response = await apiClient.put(`/work-log/${id}`, data);
    return response.data;
  },
};