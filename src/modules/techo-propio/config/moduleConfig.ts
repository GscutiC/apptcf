/**
 * Configuración centralizada para el módulo Techo Propio
 * Usa variables de entorno con fallbacks seguros
 */

/**
 * Configuración de la API
 */
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  retries: 3,
  retryDelay: 1000,
} as const;

/**
 * Configuración de la interfaz de usuario
 */
export const UI_CONFIG = {
  itemsPerPage: parseInt(process.env.REACT_APP_ITEMS_PER_PAGE || '10'),
  recentItemsCount: parseInt(process.env.REACT_APP_RECENT_ITEMS_COUNT || '5'),
  priorityItemsCount: 5,
  maxFilesUpload: 5,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
} as const;

/**
 * Configuración de desarrollo y debugging
 */
export const DEV_CONFIG = {
  enableLogging: process.env.REACT_APP_ENABLE_LOGGING === 'true' || process.env.NODE_ENV === 'development',
  enableDebugMode: process.env.NODE_ENV === 'development',
  showPerformanceMetrics: false,
} as const;

/**
 * Configuración de notificaciones
 */
export const NOTIFICATION_CONFIG = {
  successDuration: 5000,
  errorDuration: 8000,
  warningDuration: 6000,
  position: 'top-right' as const,
} as const;

/**
 * Configuración de validaciones
 */
export const VALIDATION_CONFIG = {
  dniLength: 8,
  phoneMinLength: 9,
  phoneMaxLength: 15,
  maxAddressLength: 500,
  maxDescriptionLength: 1000,
  coordinatePrecision: 6,
} as const;

/**
 * Configuración de paginación
 */
export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultLimit: UI_CONFIG.itemsPerPage,
  maxLimit: 100,
  showSizeChanger: true,
  pageSizes: [10, 20, 50, 100],
} as const;

/**
 * Configuración de búsqueda
 */
export const SEARCH_CONFIG = {
  minQueryLength: 3,
  debounceDelay: 300,
  maxResults: 50,
} as const;

/**
 * Configuración completa del módulo
 */
export const MODULE_CONFIG = {
  api: API_CONFIG,
  ui: UI_CONFIG,
  dev: DEV_CONFIG,
  notifications: NOTIFICATION_CONFIG,
  validation: VALIDATION_CONFIG,
  pagination: PAGINATION_CONFIG,
  search: SEARCH_CONFIG,
} as const;

/**
 * Exportaciones por defecto para compatibilidad
 */
export default MODULE_CONFIG;

/**
 * Helper para verificar si estamos en modo desarrollo
 */
export const isDevelopment = () => DEV_CONFIG.enableDebugMode;

/**
 * Helper para verificar si el logging está habilitado
 */
export const isLoggingEnabled = () => DEV_CONFIG.enableLogging;