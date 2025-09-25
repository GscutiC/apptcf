/**
 * Servicio HTTP genérico para el módulo de configuración de interfaz
 */

import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Crear instancia de axios específica para el módulo de configuración
const configApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
configApi.interceptors.request.use(
  (config) => {
    // Aquí podrías agregar el token de Clerk si es necesario
    // const token = localStorage.getItem('clerk-token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores
configApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Interface Config API Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('No se pudo conectar con el servidor backend');
    }
    
    if (error.response?.status === 401) {
      throw new Error('No autorizado para realizar esta acción');
    }
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Recurso no encontrado');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Error interno del servidor');
    }
    
    throw error;
  }
);

// Servicio HTTP genérico
export const httpService = {
  async get<T>(url: string): Promise<AxiosResponse<T>> {
    return configApi.get<T>(url);
  },

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return configApi.post<T>(url, data);
  },

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return configApi.put<T>(url, data);
  },

  async patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return configApi.patch<T>(url, data);
  },

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return configApi.delete<T>(url);
  },
};