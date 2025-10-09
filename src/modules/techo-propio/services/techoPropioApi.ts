/**
 * API Service for Techo Propio Module
 * Handles all HTTP requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  TechoPropioApplication,
  CreateApplicationRequest,
  CreateApplicationResponse,
  UpdateApplicationRequest,
  UpdateApplicationResponse,
  GetApplicationsRequest,
  GetApplicationsResponse,
  GetApplicationResponse,
  DeleteApplicationResponse,
  SearchApplicationsRequest,
  SearchApplicationsResponse,
  GetStatisticsRequest,
  GetStatisticsResponse,
  ChangeStatusRequest,
  ChangeStatusResponse,
  ValidateDniRequest,
  ValidateDniResponse,
  GetDepartmentsResponse,
  GetProvincesResponse,
  GetDistrictsResponse,
  ApiErrorResponse
} from '../types';
import { API_BASE_URL, ENDPOINTS, ERROR_MESSAGES } from '../utils';

/**
 * API Client Class
 */
class TechoPropioApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage (Clerk integration)
        const token = localStorage.getItem('clerk-db-jwt');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): ApiErrorResponse {
    if (error.response) {
      // Server responded with error
      const data = error.response.data as any;
      return {
        success: false,
        error: data.error || data.message || ERROR_MESSAGES.SERVER_ERROR,
        detail: data.detail,
        status_code: error.response.status
      };
    } else if (error.request) {
      // Request was made but no response
      return {
        success: false,
        error: ERROR_MESSAGES.NETWORK_ERROR,
        status_code: 0
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.GENERIC_ERROR
      };
    }
  }

  // ==================== APPLICATIONS CRUD ====================

  /**
   * Create a new application
   */
  async createApplication(data: CreateApplicationRequest): Promise<CreateApplicationResponse> {
    const response = await this.client.post<CreateApplicationResponse>(
      ENDPOINTS.APPLICATIONS,
      data
    );
    return response.data;
  }

  /**
   * Get all applications with optional filters
   */
  async getApplications(params?: GetApplicationsRequest): Promise<GetApplicationsResponse> {
    const response = await this.client.get<GetApplicationsResponse>(
      ENDPOINTS.APPLICATIONS,
      { params }
    );
    return response.data;
  }

  /**
   * Get single application by ID
   */
  async getApplication(id: string): Promise<GetApplicationResponse> {
    const response = await this.client.get<GetApplicationResponse>(
      ENDPOINTS.APPLICATION_BY_ID(id)
    );
    return response.data;
  }

  /**
   * Update an existing application
   */
  async updateApplication(
    id: string,
    data: UpdateApplicationRequest
  ): Promise<UpdateApplicationResponse> {
    const response = await this.client.put<UpdateApplicationResponse>(
      ENDPOINTS.APPLICATION_BY_ID(id),
      data
    );
    return response.data;
  }

  /**
   * Delete an application
   */
  async deleteApplication(id: string): Promise<DeleteApplicationResponse> {
    const response = await this.client.delete<DeleteApplicationResponse>(
      ENDPOINTS.APPLICATION_BY_ID(id)
    );
    return response.data;
  }

  // ==================== SEARCH & STATISTICS ====================

  /**
   * Search applications with advanced filters
   */
  async searchApplications(params: SearchApplicationsRequest): Promise<SearchApplicationsResponse> {
    const response = await this.client.get<SearchApplicationsResponse>(
      ENDPOINTS.SEARCH,
      { params }
    );
    return response.data;
  }

  /**
   * Get statistics
   */
  async getStatistics(params?: GetStatisticsRequest): Promise<GetStatisticsResponse> {
    const response = await this.client.get<GetStatisticsResponse>(
      ENDPOINTS.STATISTICS,
      { params }
    );
    return response.data;
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Change application status
   */
  async changeStatus(id: string, data: ChangeStatusRequest): Promise<ChangeStatusResponse> {
    const response = await this.client.patch<ChangeStatusResponse>(
      ENDPOINTS.CHANGE_STATUS(id),
      data
    );
    return response.data;
  }

  // ==================== VALIDATIONS ====================

  /**
   * Validate DNI with RENIEC
   */
  async validateDni(dni: string): Promise<ValidateDniResponse> {
    const response = await this.client.post<ValidateDniResponse>(
      ENDPOINTS.VALIDATE_DNI,
      { dni }
    );
    return response.data;
  }

  // ==================== UBIGEO ====================

  /**
   * Get all departments
   */
  async getDepartments(): Promise<GetDepartmentsResponse> {
    const response = await this.client.get<GetDepartmentsResponse>(
      ENDPOINTS.DEPARTMENTS
    );
    return response.data;
  }

  /**
   * Get provinces by department code
   */
  async getProvinces(departmentCode: string): Promise<GetProvincesResponse> {
    const response = await this.client.get<GetProvincesResponse>(
      ENDPOINTS.PROVINCES(departmentCode)
    );
    return response.data;
  }

  /**
   * Get districts by province code
   */
  async getDistricts(provinceCode: string): Promise<GetDistrictsResponse> {
    const response = await this.client.get<GetDistrictsResponse>(
      ENDPOINTS.DISTRICTS(provinceCode)
    );
    return response.data;
  }

  // ==================== EXPORT ====================

  /**
   * Export applications to CSV
   */
  async exportToCSV(filters?: GetApplicationsRequest): Promise<Blob> {
    const response = await this.client.get(
      `${ENDPOINTS.APPLICATIONS}/export/csv`,
      {
        params: filters,
        responseType: 'blob'
      }
    );
    return response.data;
  }

  /**
   * Export applications to Excel
   */
  async exportToExcel(filters?: GetApplicationsRequest): Promise<Blob> {
    const response = await this.client.get(
      `${ENDPOINTS.APPLICATIONS}/export/excel`,
      {
        params: filters,
        responseType: 'blob'
      }
    );
    return response.data;
  }

  // ==================== DOCUMENTS (if needed) ====================

  /**
   * Upload document
   */
  async uploadDocument(applicationId: string, file: File, type: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.client.post(
      `${ENDPOINTS.APPLICATION_BY_ID(applicationId)}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  /**
   * Delete document
   */
  async deleteDocument(applicationId: string, documentId: string): Promise<any> {
    const response = await this.client.delete(
      `${ENDPOINTS.APPLICATION_BY_ID(applicationId)}/documents/${documentId}`
    );
    return response.data;
  }
}

// Export singleton instance
export const techoPropioApi = new TechoPropioApiService();

// Export class for testing
export { TechoPropioApiService };
