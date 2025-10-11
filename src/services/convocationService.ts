/**
 * Servicio para gestión de convocatorias Techo Propio
 * Maneja todas las operaciones CRUD y consultas de convocatorias
 */

import axios, { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const CONVOCATIONS_API = `${API_BASE_URL}/api/techo-propio/convocations`;

// Variable global para almacenar la función getToken de Clerk
let getTokenFunction: (() => Promise<string | null>) | null = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (getTokenFunction) {
        const token = await getTokenFunction();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error obteniendo token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('No se pudo conectar con el servidor backend');
    }

    if (error.response) {
      // El servidor respondió con un código de error
      const message = error.response.data?.detail || error.response.data?.message || 'Error del servidor';
      throw new Error(`Error ${error.response.status}: ${message}`);
    }

    throw error;
  }
);

// ==================== TIPOS DE DATOS ====================

export interface Convocation {
  id: string;
  code: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_published: boolean;
  max_applications?: number;
  year: number;
  sequential_number: number;
  created_at: string;
  updated_at: string;
}

export interface ConvocationOption {
  value: string;
  label: string;
  is_active: boolean;
  is_current: boolean;
  description?: string;
}

export interface ConvocationCreateRequest {
  code: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  is_published?: boolean;
  max_applications?: number;
}

export interface ConvocationUpdateRequest extends Partial<ConvocationCreateRequest> {
  // Todos los campos son opcionales para actualización
}

export interface ConvocationListResponse {
  convocations: Convocation[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ConvocationStatistics {
  convocation_code: string;
  total_applications: number;
  applications_by_status: Record<string, number>;
  average_priority_score?: number;
  completion_rate: number;
  applications_per_day: Record<string, number>;
  start_date: string;
  end_date: string;
  days_active: number;
  days_remaining?: number;
}

// ==================== CLASE DE SERVICIO ====================

class ConvocationService {

  /**
   * Configurar la función de obtención de token de Clerk
   * Debe ser llamado al inicio de la aplicación
   */
  setGetToken(getToken: () => Promise<string | null>) {
    getTokenFunction = getToken;
  }

  // ==================== OPERACIONES CRUD ====================
  
  /**
   * Obtener todas las convocatorias con paginación
   */
  async getConvocations(params?: {
    skip?: number;
    limit?: number;
    include_inactive?: boolean;
    year?: number;
    search?: string;
  }): Promise<ConvocationListResponse> {
    const response = await api.get('/api/techo-propio/convocations/', { params });
    return response.data;
  }

  /**
   * Obtener opciones de convocatorias para dropdowns
   */
  async getConvocationOptions(): Promise<ConvocationOption[]> {
    const response = await api.get('/api/techo-propio/convocations/active');
    return response.data;
  }

  /**
   * Obtener convocatoria por ID
   */
  async getConvocationById(id: string): Promise<Convocation> {
    const response = await api.get(`/api/techo-propio/convocations/${id}`);
    return response.data;
  }

  /**
   * Crear nueva convocatoria
   */
  async createConvocation(data: ConvocationCreateRequest): Promise<Convocation> {
    const response = await api.post('/api/techo-propio/convocations/', data);
    return response.data;
  }

  /**
   * Actualizar convocatoria existente
   */
  async updateConvocation(id: string, data: ConvocationUpdateRequest): Promise<Convocation> {
    const response = await api.put(`/api/techo-propio/convocations/${id}`, data);
    return response.data;
  }

  /**
   * Eliminar convocatoria
   */
  async deleteConvocation(id: string): Promise<void> {
    await api.delete(`/api/techo-propio/convocations/${id}`);
  }

  // ==================== OPERACIONES DE ESTADO ====================

  /**
   * Activar convocatoria
   */
  async activateConvocation(id: string): Promise<Convocation> {
    const response = await api.patch(`/api/techo-propio/convocations/${id}/activate`);
    return response.data;
  }

  /**
   * Desactivar convocatoria
   */
  async deactivateConvocation(id: string): Promise<Convocation> {
    const response = await api.patch(`/api/techo-propio/convocations/${id}/deactivate`);
    return response.data;
  }

  /**
   * Publicar convocatoria
   */
  async publishConvocation(id: string): Promise<Convocation> {
    const response = await api.patch(`/api/techo-propio/convocations/${id}/publish`);
    return response.data;
  }

  /**
   * Despublicar convocatoria
   */
  async unpublishConvocation(id: string): Promise<Convocation> {
    const response = await api.patch(`/api/techo-propio/convocations/${id}/unpublish`);
    return response.data;
  }

  /**
   * Extender fecha límite de convocatoria
   */
  async extendDeadline(id: string, newEndDate: string): Promise<Convocation> {
    const response = await api.patch(`/api/techo-propio/convocations/${id}/extend-deadline`, {
      new_end_date: newEndDate
    });
    return response.data;
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtener estadísticas de una convocatoria específica
   */
  async getConvocationStatistics(convocationCode: string): Promise<ConvocationStatistics> {
    const response = await api.get(`/api/techo-propio/convocations/stats/${convocationCode}`);
    return response.data;
  }

  /**
   * Obtener estadísticas generales de todas las convocatorias
   */
  async getGeneralStatistics(): Promise<any> {
    const response = await api.get('/api/techo-propio/convocations/stats/general');
    return response.data;
  }

  // ==================== OPERACIONES MASIVAS ====================

  /**
   * Operación masiva en múltiples convocatorias
   */
  async bulkOperation(
    convocationIds: string[],
    operation: 'activate' | 'deactivate' | 'publish' | 'unpublish' | 'delete'
  ): Promise<any> {
    const response = await api.post('/api/techo-propio/convocations/bulk', {
      convocation_ids: convocationIds,
      operation
    });
    return response.data;
  }

  // ==================== UTILIDADES ====================

  /**
   * Validar código de convocatoria
   */
  validateConvocationCode(code: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!code || code.trim().length === 0) {
      errors.push('El código de convocatoria es obligatorio');
    } else {
      // Validar formato CONV-YYYY-XX
      const codeRegex = /^CONV-\d{4}-\d{2}$/;
      if (!codeRegex.test(code)) {
        errors.push('El código debe tener el formato CONV-YYYY-XX (ej: CONV-2025-01)');
      } else {
        const parts = code.split('-');
        const year = parseInt(parts[1]);
        const sequence = parseInt(parts[2]);
        
        if (year < 2020 || year > 2030) {
          errors.push('El año debe estar entre 2020 y 2030');
        }
        
        if (sequence < 1 || sequence > 99) {
          errors.push('El número secuencial debe estar entre 01 y 99');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar fechas de convocatoria
   */
  validateConvocationDates(startDate: string, endDate: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!startDate) {
      errors.push('La fecha de inicio es obligatoria');
    }
    
    if (!endDate) {
      errors.push('La fecha de fin es obligatoria');
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
      
      if (start < new Date()) {
        errors.push('La fecha de inicio debe ser futura');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ==================== EXPORTACIÓN ====================

export const convocationService = new ConvocationService();
export default convocationService;