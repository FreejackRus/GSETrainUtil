import { AuthResponse, LoginCredentials } from "../model/types";

const API_BASE_URL = "http://localhost:3000/api/v1";

export const userApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Ошибка авторизации");
    }

    const data = await response.json();
    return data;
  },

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    
    if (!response.ok) {
      throw new Error("Ошибка получения списка пользователей");
    }

    return response.json();
  },

  async createUser(userData: { login: string; password: string; role: string }) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Ошибка создания пользователя");
    }

    return response.json();
  }
};