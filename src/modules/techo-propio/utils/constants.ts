/**
 * Constants for Techo Propio Module
 */

import {
  ApplicationStatus,
  MaritalStatus,
  PropertyType,
  LandOwnership,
  Gender,
  RelationshipType
} from '../types';

// ==================== API ENDPOINTS ====================

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const ENDPOINTS = {
  // Applications
  APPLICATIONS: '/api/techo-propio/applications',
  APPLICATION_BY_ID: (id: string) => `/api/techo-propio/applications/${id}`,

  // Search & Statistics
  SEARCH: '/api/techo-propio/applications/search',
  STATISTICS: '/api/techo-propio/statistics',

  // Validations
  VALIDATE_DNI: '/api/techo-propio/validate/dni',

  // UBIGEO
  DEPARTMENTS: '/api/techo-propio/locations/departments',
  PROVINCES: (deptName: string) => `/api/techo-propio/locations/provinces/${deptName}`,
  DISTRICTS: (deptName: string, provName: string) => `/api/techo-propio/locations/districts/${deptName}/${provName}`,

  // Status
  CHANGE_STATUS: (id: string) => `/api/techo-propio/applications/${id}/status`,
};

// ==================== STATUS CONFIG ====================

export const STATUS_CONFIG = {
  [ApplicationStatus.DRAFT]: {
    label: 'Borrador',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    icon: '📝'
  },
  [ApplicationStatus.SUBMITTED]: {
    label: 'Enviada',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    icon: '📤'
  },
  [ApplicationStatus.IN_REVIEW]: {
    label: 'En Revisión',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    icon: '🔍'
  },
  [ApplicationStatus.APPROVED]: {
    label: 'Aprobada',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    icon: '✅'
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rechazada',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    icon: '❌'
  },
  [ApplicationStatus.CANCELLED]: {
    label: 'Cancelada',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    icon: '🚫'
  }
};

// ==================== STATUS TRANSITIONS ====================

export const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.DRAFT]: [ApplicationStatus.SUBMITTED, ApplicationStatus.CANCELLED],
  [ApplicationStatus.SUBMITTED]: [ApplicationStatus.IN_REVIEW, ApplicationStatus.CANCELLED],
  [ApplicationStatus.IN_REVIEW]: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
  [ApplicationStatus.APPROVED]: [],
  [ApplicationStatus.REJECTED]: [ApplicationStatus.IN_REVIEW],
  [ApplicationStatus.CANCELLED]: []
};

// ==================== MARITAL STATUS ====================

export const MARITAL_STATUS_OPTIONS = [
  { value: MaritalStatus.SINGLE, label: 'Soltero/a' },
  { value: MaritalStatus.MARRIED, label: 'Casado/a' },
  { value: MaritalStatus.DIVORCED, label: 'Divorciado/a' },
  { value: MaritalStatus.WIDOWED, label: 'Viudo/a' },
  { value: MaritalStatus.COHABITING, label: 'Conviviente' }
];

// ==================== GENDER ====================

export const GENDER_OPTIONS = [
  { value: Gender.MALE, label: 'Masculino' },
  { value: Gender.FEMALE, label: 'Femenino' },
  { value: Gender.OTHER, label: 'Otro' }
];

// ==================== PROPERTY TYPE ====================

export const PROPERTY_TYPE_OPTIONS = [
  { value: PropertyType.URBAN, label: 'Urbano' },
  { value: PropertyType.RURAL, label: 'Rural' }
];

// ==================== LAND OWNERSHIP ====================

export const LAND_OWNERSHIP_OPTIONS = [
  { value: LandOwnership.OWN, label: 'Propio' },
  { value: LandOwnership.POSSESSION, label: 'Posesión' },
  { value: LandOwnership.LEASE, label: 'Alquiler' },
  { value: LandOwnership.ASSIGNMENT, label: 'Cesión' }
];

// ==================== RELATIONSHIP TYPE ====================

export const RELATIONSHIP_OPTIONS = [
  { value: RelationshipType.SPOUSE, label: 'Cónyuge' },
  { value: RelationshipType.CHILD, label: 'Hijo/a' },
  { value: RelationshipType.PARENT, label: 'Padre/Madre' },
  { value: RelationshipType.SIBLING, label: 'Hermano/a' },
  { value: RelationshipType.OTHER, label: 'Otro' }
];

// ==================== FORM STEPS ====================

export const FORM_STEPS = [
  {
    id: 1,
    title: 'Datos del Solicitante',
    description: 'Información personal y de contacto',
    icon: '👤'
  },
  {
    id: 2,
    title: 'Grupo Familiar',
    description: 'Miembros del hogar',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: 3,
    title: 'Información Económica',
    description: 'Ingresos y gastos',
    icon: '💰'
  },
  {
    id: 4,
    title: 'Datos del Predio',
    description: 'Información del terreno',
    icon: '🏠'
  },
  {
    id: 5,
    title: 'Revisión',
    description: 'Verificar y enviar',
    icon: '📋'
  }
];

// ==================== PRIORITY THRESHOLDS ====================

export const PRIORITY_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
  LOW: 0
};

export const PRIORITY_CONFIG = {
  HIGH: {
    label: 'Alta',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '🔥'
  },
  MEDIUM: {
    label: 'Media',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: '⚡'
  },
  LOW: {
    label: 'Baja',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: '📌'
  }
};

// ==================== PAGINATION ====================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ==================== VALIDATION ====================

export const VALIDATION_RULES = {
  DNI: {
    length: 8,
    pattern: /^\d{8}$/,
    errorMessage: 'El DNI debe tener 8 dígitos'
  },
  PHONE: {
    length: 9,
    pattern: /^9\d{8}$/,
    errorMessage: 'El teléfono debe tener 9 dígitos y empezar con 9'
  },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: 'Email inválido'
  },
  POSITIVE_NUMBER: {
    min: 0,
    errorMessage: 'Debe ser un número positivo'
  }
};

// ==================== LOCAL STORAGE KEYS ====================

export const STORAGE_KEYS = {
  DRAFT_APPLICATION: 'techo_propio_draft',
  SAVED_FILTERS: 'techo_propio_filters',
  USER_PREFERENCES: 'techo_propio_preferences'
};

// ==================== DATE FORMATS ====================

export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss"
};

// ==================== EXPORT FORMATS ====================

export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'xlsx',
  PDF: 'pdf'
};

// ==================== MODULE PERMISSIONS ====================

export const MODULE_PERMISSION = 'techo-propio';

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
  NOT_FOUND: 'El recurso solicitado no existe.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  GENERIC_ERROR: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'
};

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  APPLICATION_CREATED: 'Solicitud creada exitosamente',
  APPLICATION_UPDATED: 'Solicitud actualizada exitosamente',
  APPLICATION_DELETED: 'Solicitud eliminada exitosamente',
  STATUS_CHANGED: 'Estado cambiado exitosamente',
  DRAFT_SAVED: 'Borrador guardado'
};
