/**
 * Constants for Techo Propio Module
 */

import {
  ApplicationStatus,
  CivilStatus,
  Gender,
  RelationshipType,
  EducationLevel,
  EmploymentSituation,
  EmploymentCondition,
  DisabilityType,
  PaymentMethod,
  MemberType,
  FamilyRelationship,
  WorkCondition
} from '../types';

// ==================== API ENDPOINTS ====================

// API_BASE_URL movido a config/moduleConfig.ts para mejor organización

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
  PROVINCES: (deptCode: string) => `/api/techo-propio/locations/provinces?department_code=${deptCode}`,
  DISTRICTS: (deptCode: string, provCode: string) => `/api/techo-propio/locations/districts?department_code=${deptCode}&province_code=${provCode}`,

  // Status Management
  CHANGE_STATUS: (id: string) => `/api/techo-propio/applications/${id}/status`,
  SUBMIT_APPLICATION: (id: string) => `/api/techo-propio/applications/${id}/submit`,
  START_REVIEW: (id: string) => `/api/techo-propio/applications/${id}/start-review`,
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
  [ApplicationStatus.UNDER_REVIEW]: {
    label: 'En Revisión',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    icon: '🔍'
  },
  [ApplicationStatus.ADDITIONAL_INFO_REQUIRED]: {
    label: 'Info Adicional',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    icon: '📋'
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
  [ApplicationStatus.SUBMITTED]: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.CANCELLED],
  [ApplicationStatus.UNDER_REVIEW]: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.ADDITIONAL_INFO_REQUIRED],
  [ApplicationStatus.ADDITIONAL_INFO_REQUIRED]: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.CANCELLED],
  [ApplicationStatus.APPROVED]: [],
  [ApplicationStatus.REJECTED]: [ApplicationStatus.UNDER_REVIEW],
  [ApplicationStatus.CANCELLED]: []
};

// ==================== CIVIL STATUS ====================

export const CIVIL_STATUS_OPTIONS = [
  { value: CivilStatus.SINGLE, label: 'Soltero/a' },
  { value: CivilStatus.MARRIED, label: 'Casado/a' },
  { value: CivilStatus.DIVORCED, label: 'Divorciado/a' },
  { value: CivilStatus.WIDOWED, label: 'Viudo/a' },
  { value: CivilStatus.COHABITING, label: 'Conviviente' }
];

// ==================== DOCUMENT TYPE ====================

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'dni', label: 'DNI' },
  { value: 'ce', label: 'Carnet de Extranjería' },
  { value: 'passport', label: 'Pasaporte' }
];

// ==================== GENDER ====================

export const GENDER_OPTIONS = [
  { value: Gender.MALE, label: 'Masculino' },
  { value: Gender.FEMALE, label: 'Femenino' },
  { value: Gender.OTHER, label: 'Otro' }
];

// ==================== FAMILY RELATIONSHIP ====================

export const FAMILY_RELATIONSHIP_OPTIONS = [
  { value: FamilyRelationship.SPOUSE, label: 'Cónyuge' },
  { value: FamilyRelationship.PARTNER, label: 'Conviviente' },
  { value: FamilyRelationship.CHILD, label: 'Hijo/a' },
  { value: FamilyRelationship.PARENT, label: 'Padre/Madre' },
  { value: FamilyRelationship.SIBLING, label: 'Hermano/a' },
  { value: FamilyRelationship.GRANDPARENT, label: 'Abuelo/a' },
  { value: FamilyRelationship.GRANDCHILD, label: 'Nieto/a' },
  { value: FamilyRelationship.OTHER, label: 'Otro' }
];

// ==================== EDUCATION LEVEL ====================

export const EDUCATION_LEVEL_OPTIONS = [
  { value: EducationLevel.NO_EDUCATION, label: 'Sin estudios' },
  { value: EducationLevel.PRIMARY_INCOMPLETE, label: 'Primaria incompleta' },
  { value: EducationLevel.PRIMARY_COMPLETE, label: 'Primaria completa' },
  { value: EducationLevel.SECONDARY_INCOMPLETE, label: 'Secundaria incompleta' },
  { value: EducationLevel.SECONDARY_COMPLETE, label: 'Secundaria completa' },
  { value: EducationLevel.TECHNICAL_INCOMPLETE, label: 'Técnico incompleto' },
  { value: EducationLevel.TECHNICAL_COMPLETE, label: 'Técnico completo' },
  { value: EducationLevel.UNIVERSITY_INCOMPLETE, label: 'Universitario incompleto' },
  { value: EducationLevel.UNIVERSITY_COMPLETE, label: 'Universitario completo' },
  { value: EducationLevel.POSTGRADUATE, label: 'Posgrado' }
];

// ==================== EMPLOYMENT SITUATION ====================

export const EMPLOYMENT_SITUATION_OPTIONS = [
  { value: EmploymentSituation.DEPENDENT, label: 'Dependiente' },
  { value: EmploymentSituation.INDEPENDENT, label: 'Independiente' },
  { value: EmploymentSituation.UNEMPLOYED, label: 'Desempleado' },
  { value: EmploymentSituation.RETIRED, label: 'Jubilado' },
  { value: EmploymentSituation.STUDENT, label: 'Estudiante' }
];

// ==================== LEGACY EMPLOYMENT CONDITION (DEPRECATED) ====================
// ⚠️ Usar WORK_CONDITION_OPTIONS en su lugar
export const EMPLOYMENT_CONDITION_OPTIONS = [
  { value: EmploymentCondition.FORMAL, label: 'Formal' },
  { value: EmploymentCondition.INFORMAL, label: 'Informal' }
];

// ==================== DISABILITY TYPE ====================

export const DISABILITY_TYPE_OPTIONS = [
  { value: DisabilityType.NONE, label: 'Ninguna' },
  { value: DisabilityType.PHYSICAL, label: 'Física' },
  { value: DisabilityType.VISUAL, label: 'Visual' },
  { value: DisabilityType.HEARING, label: 'Auditiva' },
  { value: DisabilityType.INTELLECTUAL, label: 'Intelectual' },
  { value: DisabilityType.PSYCHOSOCIAL, label: 'Psicosocial' },
  { value: DisabilityType.MULTIPLE, label: 'Múltiple' }
];

// ==================== WORK CONDITION ====================

export const WORK_CONDITION_OPTIONS = [
  { value: WorkCondition.FORMAL, label: 'Formal' },
  { value: WorkCondition.INFORMAL, label: 'Informal' }
];

// ==================== PAYMENT METHOD ====================

export const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.CASH, label: 'Al Contado' },
  { value: PaymentMethod.FINANCING, label: 'Financiado' }
];

// ==================== MEMBER TYPE ====================

export const MEMBER_TYPE_OPTIONS = [
  { value: MemberType.HEAD_OF_FAMILY, label: 'Jefe de Familia' },
  { value: MemberType.SPOUSE, label: 'Cónyuge/Conviviente' },
  { value: MemberType.ADDITIONAL_FAMILY, label: 'Familia Adicional' },
  { value: MemberType.FAMILY_DEPENDENT, label: 'Carga Familiar' },
  { value: MemberType.OTHER, label: 'Otro Miembro' }
];

// ==================== FAMILY BONDS ====================

export const FAMILY_BOND_OPTIONS = [
  { value: 'HIJO', label: 'Hijo/a' },
  { value: 'NIETO', label: 'Nieto/a' },
  { value: 'PADRE', label: 'Padre' },
  { value: 'MADRE', label: 'Madre' },
  { value: 'ABUELO', label: 'Abuelo/a' },
  { value: 'HERMANO', label: 'Hermano/a' },
  { value: 'TIO', label: 'Tío/a' },
  { value: 'PRIMO', label: 'Primo/a' },
  { value: 'SOBRINO', label: 'Sobrino/a' },
  { value: 'OTRO', label: 'Otro' }
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
    title: 'Datos del Predio',
    description: 'Información del terreno',
    icon: '🏠'
  },
  {
    id: 4,
    title: 'Información Económica',
    description: 'Ingresos y gastos',
    icon: '💰'
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
