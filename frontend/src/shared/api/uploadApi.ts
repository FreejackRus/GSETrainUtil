import { API_BASE_URL } from './base';

export interface UploadPhotoParams {
  file: File;
  applicationNumber: string;
  date: string;
  trainNumber: string;
  carriageNumber: string;
  equipmentName: string;
  photoType: 'carriage' | 'equipment' | 'serial' | 'mac' | 'general' | 'final';
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    originalName: string;
    path: string;
    url: string;
    size: number;
    mimetype: string;
  };
}

export const uploadPhoto = async (params: UploadPhotoParams): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('photo', params.file);
  formData.append('applicationNumber', params.applicationNumber);
  formData.append('date', params.date);
  formData.append('trainNumber', params.trainNumber);
  formData.append('carriageNumber', params.carriageNumber);
  formData.append('equipmentName', params.equipmentName);
  formData.append('photoType', params.photoType);

  const response = await fetch(`${API_BASE_URL}/upload/photo`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const uploadMultiplePhotos = async (
  files: File[],
  params: Omit<UploadPhotoParams, 'file'>
): Promise<UploadResponse> => {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('photos', file);
  });
  
  formData.append('applicationNumber', params.applicationNumber);
  formData.append('date', params.date);
  formData.append('trainNumber', params.trainNumber);
  formData.append('carriageNumber', params.carriageNumber);
  formData.append('equipmentName', params.equipmentName);
  formData.append('photoType', params.photoType);

  const response = await fetch(`${API_BASE_URL}/upload/photos`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};