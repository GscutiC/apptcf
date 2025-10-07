/**
 * Servicio HTTP autenticado para el módulo de configuración de interfaz
 * Implementa autenticación con Clerk JWT siguiendo el patrón del módulo user-management
 */

import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { logger } from '../../../shared/utils/logger';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Interfaz del servicio HTTP autenticado
 */
interface AuthenticatedHttpService {
  get<T>(url: string): Promise<AxiosResponse<T>>;
  post<T>(url: string, data?: any): Promise<AxiosResponse<T>>;
  put<T>(url: string, data?: any): Promise<AxiosResponse<T>>;
  patch<T>(url: string, data?: any): Promise<AxiosResponse<T>>;
  delete<T>(url: string): Promise<AxiosResponse<T>>;
}

/**
 * Crear instancia de servicio HTTP autenticado
 * Similar al patrón usado en userService.ts
 *
 * @param getToken - Función para obtener el token JWT de Clerk
 * @returns Servicio HTTP con autenticación configurada
 */
export const createAuthenticatedHttpService = (
  getToken: () => Promise<string | null>
): AuthenticatedHttpService => {
  // Crear instancia de axios específica
  const configApi: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para agregar token de autenticación en cada petición
  configApi.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        // FASE 2.3: Intentar obtener token con reintentos
        let token = await getToken();

        // Si no hay token, esperar un poco y reintentar (para resolver race conditions)
        if (!token) {
          logger.warn('[HttpService] Token no disponible, reintentando...');
          await new Promise(resolve => setTimeout(resolve, 100));
          token = await getToken();
        }

        if (token) {
          // Agregar header de autorización con el token JWT
          config.headers.Authorization = `Bearer ${token}`;
          logger.debug('[HttpService] Token agregado exitosamente');
        } else {
          logger.error('[HttpService] No hay token disponible después de reintentos para:', config.url);
          // ✅ Rechazar la petición si no hay token (evitar 403)
          throw new Error('No authentication token available after retries');
        }
      } catch (error) {
        logger.error('[HttpService] Error obteniendo token:', error);
        return Promise.reject(error);
      }

      return config;
    },
    (error) => {
      logger.error('[HttpService] Error en request interceptor:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para manejo de errores de respuesta
  configApi.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      
      // No loguear 404 de configuración contextual como error (es esperado para usuarios sin config personalizada)
      if (status === 404 && url?.includes('/contextual-config/effective/')) {
        logger.debug(`[HttpService] Configuración contextual no encontrada para: ${url}`);
      } else {
        logger.error('[HttpService] Error en respuesta:', url, status);
      }

      if (error.code === 'ECONNREFUSED') {
        throw new Error('No se pudo conectar con el servidor backend');
      }

      if (status === 401) {
        throw new Error('No autorizado - Por favor inicia sesión nuevamente');
      }

      if (status === 403) {
        throw new Error('No tienes permisos para realizar esta acción');
      }

      if (status === 404) {
        throw new Error('Recurso no encontrado');
      }

      if (status >= 500) {
        throw new Error('Error interno del servidor');
      }

      throw error;
    }
  );

  // Retornar servicio HTTP con métodos tipados
  return {
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
};

/**
 * Servicio HTTP sin autenticación (legacy, solo para compatibilidad)
 * @deprecated Usar createAuthenticatedHttpService en su lugar
 */
export const httpService = {
  async get<T>(url: string): Promise<AxiosResponse<T>> {
    logger.warn('[HttpService] Usando servicio sin autenticación (deprecated)');
    const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });
    return api.get<T>(url);
  },

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    logger.warn('[HttpService] Usando servicio sin autenticación (deprecated)');
    const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });
    return api.post<T>(url, data);
  },

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    logger.warn('[HttpService] Usando servicio sin autenticación (deprecated)');
    const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });
    return api.put<T>(url, data);
  },

  async patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    logger.warn('[HttpService] Usando servicio sin autenticación (deprecated)');
    const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });
    return api.patch<T>(url, data);
  },

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    logger.warn('[HttpService] Usando servicio sin autenticación (deprecated)');
    const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });
    return api.delete<T>(url);
  },
};