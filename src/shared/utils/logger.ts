/**
 * Sistema de logging centralizado para el frontend
 * Controla verbosidad según variable de entorno REACT_APP_DEBUG
 */

const DEBUG = process.env.REACT_APP_DEBUG === 'true';

export const logger = {
  /**
   * Log de debugging - Solo visible si REACT_APP_DEBUG=true
   */
  debug: (...args: any[]) => {
    if (DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log informativo - Solo visible si REACT_APP_DEBUG=true
   */
  info: (...args: any[]) => {
    if (DEBUG) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Advertencias - Siempre visibles
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Errores - Siempre visibles
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};
