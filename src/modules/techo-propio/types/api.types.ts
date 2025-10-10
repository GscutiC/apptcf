/**
 * API Request/Response Types for Techo Propio Module
 * Maps to backend API DTOs
 */

import {
  TechoPropioApplication,
  Applicant,
  HouseholdMember,
  EconomicInfo,
  PropertyInfo,
  ApplicationStatus,
  ApplicationStatistics,
  ApplicationFilters,
  PaginatedResponse,
  UbigeoDepartment,
  UbigeoProvince,
  UbigeoDistrict,
  ReniecValidationResponse
} from './application.types';

// ==================== CREATE APPLICATION ====================

export interface CreateApplicationRequest {
  applicant: Applicant;
  household_members: HouseholdMember[];
  economic_info: EconomicInfo;
  property_info: PropertyInfo;
  comments?: string;
}

export interface CreateApplicationResponse {
  success: boolean;
  data: TechoPropioApplication;
  message: string;
}

// ==================== UPDATE APPLICATION ====================

export interface UpdateApplicationRequest {
  applicant?: Partial<Applicant>;
  household_members?: HouseholdMember[];
  economic_info?: Partial<EconomicInfo>;
  property_info?: Partial<PropertyInfo>;
  comments?: string;
  status?: ApplicationStatus;
}

export interface UpdateApplicationResponse {
  success: boolean;
  data: TechoPropioApplication;
  message: string;
}

// ==================== GET APPLICATIONS ====================

export interface GetApplicationsRequest {
  status?: ApplicationStatus[];
  department?: string;
  province?: string;
  district?: string;
  priority_min?: number;
  priority_max?: number;
  created_from?: string;
  created_to?: string;
  skip?: number;
  limit?: number;
}

export interface GetApplicationsResponse {
  success: boolean;
  data: PaginatedResponse<TechoPropioApplication>;
}

// ==================== GET SINGLE APPLICATION ====================

export interface GetApplicationResponse {
  success: boolean;
  data: TechoPropioApplication;
}

// ==================== DELETE APPLICATION ====================

export interface DeleteApplicationResponse {
  success: boolean;
  message: string;
}

// ==================== SEARCH APPLICATIONS ====================

export interface SearchApplicationsRequest {
  query?: string; // Search by code, DNI, name
  filters?: ApplicationFilters;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface SearchApplicationsResponse {
  success: boolean;
  data: {
    results: TechoPropioApplication[];
    total: number;
    page: number;
    page_size: number;
  };
}

// ==================== STATISTICS ====================

export interface GetStatisticsRequest {
  department?: string;
  from_date?: string;
  to_date?: string;
}

export interface GetStatisticsResponse {
  success: boolean;
  data: ApplicationStatistics;
}

// ==================== CHANGE STATUS ====================

export interface ChangeStatusRequest {
  new_status: ApplicationStatus;
  comment?: string;
}

export interface ChangeStatusResponse {
  success: boolean;
  data: TechoPropioApplication;
  message: string;
}

// ==================== VALIDATE DNI ====================

export interface ValidateDniRequest {
  dni: string;
}

export interface ValidateDniResponse {
  success: boolean;
  data?: ReniecValidationResponse;
  error?: string;
}

// ==================== UBIGEO ====================

export interface GetDepartmentsResponse extends Array<UbigeoDepartment> {}

export interface GetProvincesResponse extends Array<UbigeoProvince> {}

export interface GetDistrictsResponse extends Array<UbigeoDistrict> {}

export interface GetDistrictsResponseOLD {
  success: boolean;
  data: UbigeoDistrict[];
}

// ==================== ERROR RESPONSES ====================

export interface ApiErrorResponse {
  success: false;
  error: string;
  detail?: string;
  status_code?: number;
}

// ==================== GENERIC API RESPONSE ====================

export type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
} | ApiErrorResponse;

// ==================== EXPORT DEFAULT ====================

export interface TechoPropioApiEndpoints {
  // Base
  BASE_URL: string;

  // Applications
  APPLICATIONS: string;
  APPLICATION_BY_ID: (id: string) => string;

  // Search & Statistics
  SEARCH: string;
  STATISTICS: string;

  // Validations
  VALIDATE_DNI: string;

  // UBIGEO
  DEPARTMENTS: string;
  PROVINCES: (deptCode: string) => string;
  DISTRICTS: (provCode: string) => string;

  // Status
  CHANGE_STATUS: (id: string) => string;
}
