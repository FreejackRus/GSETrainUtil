export interface User {
  id: number;
  login: string;
  role: 'admin' | 'engineer';
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export interface LoginCredentials {
  login: string;
  password: string;
}