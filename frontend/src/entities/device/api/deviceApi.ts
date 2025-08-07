import { DeviceResponse, CreateDeviceData } from "../model/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const deviceApi = {
  async getDevices(): Promise<DeviceResponse> {
    const response = await fetch(`${API_BASE_URL}/devices`);
    
    if (!response.ok) {
      throw new Error("Ошибка получения списка устройств");
    }

    return response.json();
  },

  async createDevice(deviceData: CreateDeviceData) {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      throw new Error("Ошибка создания устройства");
    }

    return response.json();
  },

  async updateDevice(id: number, deviceData: Partial<CreateDeviceData>) {
    const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      throw new Error("Ошибка обновления устройства");
    }

    return response.json();
  },

  async deleteDevice(id: number) {
    const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Ошибка удаления устройства");
    }

    return response.json();
  }
};