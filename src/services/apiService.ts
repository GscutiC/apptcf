import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED') {
      throw new Error('No se pudo conectar con el servidor backend');
    }
    throw error;
  }
);

export interface WelcomeResponse {
  message: string;
  timestamp: string;
}

export interface MessageResponse {
  response: string;
  processed_by: string;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
}

export const apiService = {
  // Endpoints básicos
  async checkHealth(): Promise<HealthResponse> {
    const response = await api.get('/health');
    return response.data;
  },

  async getRoot(): Promise<{ message: string }> {
    const response = await api.get('/');
    return response.data;
  },

  async getHelloWorld(): Promise<{
    message: string;
    status: string;
    timestamp: string;
    backend: string;
    version: string;
  }> {
    const response = await api.get('/hello');
    return response.data;
  },

  // Endpoints de IA y mensajería
  async getWelcomeMessage(): Promise<WelcomeResponse> {
    const response = await api.get('/ai/welcome');
    return response.data;
  },

  async sendMessage(message: string): Promise<MessageResponse> {
    const response = await api.post('/ai/message', { message });
    return response.data;
  },

  // Endpoints de usuarios (CRUD ejemplo)
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async getUser(userId: string): Promise<User> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },
};

export default apiService;