/**
 * Servicio HTTP para la configuración visual del módulo Techo Propio
 * Maneja todas las peticiones HTTP al backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  TechoPropioConfig,
  TechoPropioConfigResponse,
  TechoPropioConfigExistsResponse,
  TechoPropioConfigDeleteResponse,
  DEFAULT_CONFIG
} from '../types/config.types';

// API Base URL desde variable de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const CONFIG_ENDPOINT = '/api/techo-propio/config';

/**
 * Error personalizado para la API
 */
export interface ConfigApiError {
  success: false;
  error: string;
  detail?: string;
  status_code?: number;
}

/**
 * Servicio de configuración de Techo Propio
 */
class TechoPropioConfigService {
  private client: AxiosInstance;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos
    });

    // Request interceptor para agregar token de autenticación
    this.client.interceptors.request.use(
      async (config) => {
        // Obtener token de Clerk
        if (this.getToken) {
          const token = await this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        console.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejo de errores
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Configurar función para obtener token de autenticación
   */
  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  /**
   * Manejar errores de la API
   */
  private handleError(error: AxiosError): ConfigApiError {
    if (error.response) {
      // El servidor respondió con un error
      const data = error.response.data as any;
      return {
        success: false,
        error: data.error || data.message || data.detail || 'Error del servidor',
        detail: data.detail,
        status_code: error.response.status
      };
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return {
        success: false,
        error: 'Error de red: no se pudo conectar con el servidor',
        status_code: 0
      };
    } else {
      // Algo más salió mal
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * GET /api/techo-propio/config
   * Obtener configuración del usuario actual
   * Si no existe, retorna la configuración por defecto
   */
  async getMyConfig(): Promise<TechoPropioConfig> {
    try {
      const response = await this.client.get<TechoPropioConfigResponse>(CONFIG_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      // Si no hay configuración, retornar default
      return DEFAULT_CONFIG;
    }
  }

  /**
   * POST /api/techo-propio/config
   * Guardar/actualizar configuración del usuario actual
   */
  async saveMyConfig(config: Omit<TechoPropioConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<TechoPropioConfig> {
    try {
      const response = await this.client.post<TechoPropioConfigResponse>(
        CONFIG_ENDPOINT,
        config
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      throw error;
    }
  }

  /**
   * PUT /api/techo-propio/config
   * Actualizar parcialmente la configuración
   */
  async updateMyConfig(configPartial: Partial<Omit<TechoPropioConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<TechoPropioConfig> {
    try {
      const response = await this.client.put<TechoPropioConfigResponse>(
        CONFIG_ENDPOINT,
        configPartial
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
      throw error;
    }
  }

  /**
   * DELETE /api/techo-propio/config
   * Eliminar configuración (reset a default)
   */
  async deleteMyConfig(): Promise<void> {
    try {
      await this.client.delete<TechoPropioConfigDeleteResponse>(CONFIG_ENDPOINT);
    } catch (error) {
      console.error('❌ Error eliminando configuración:', error);
      throw error;
    }
  }

  /**
   * GET /api/techo-propio/config/exists
   * Verificar si el usuario tiene configuración personalizada
   */
  async configExists(): Promise<boolean> {
    try {
      const response = await this.client.get<TechoPropioConfigExistsResponse>(
        `${CONFIG_ENDPOINT}/exists`
      );
      return response.data.exists;
    } catch (error) {
      console.error('❌ Error verificando existencia de configuración:', error);
      return false;
    }
  }

  /**
   * GET /api/techo-propio/config/default
   * Obtener configuración por defecto (sin autenticación)
   */
  async getDefaultConfig(): Promise<TechoPropioConfig> {
    try {
      const response = await this.client.get<TechoPropioConfigResponse>(
        `${CONFIG_ENDPOINT}/default`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo configuración por defecto:', error);
      return DEFAULT_CONFIG;
    }
  }
}

// Exportar instancia singleton
export const techoPropioConfigService = new TechoPropioConfigService();

// Exportar clase para testing
export { TechoPropioConfigService };
