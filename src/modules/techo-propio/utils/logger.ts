/**
 * Logger condicional para el módulo Techo Propio
 * Solo muestra logs en desarrollo, evita logs en producción
 */

import { isLoggingEnabled, isDevelopment } from '../config/moduleConfig';

/**
 * Niveles de logging disponibles
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Configuración de colores para cada nivel
 */
const LOG_COLORS = {
  [LogLevel.DEBUG]: '🔍',
  [LogLevel.INFO]: '🔵',
  [LogLevel.WARN]: '🟡',
  [LogLevel.ERROR]: '🔴',
} as const;

/**
 * Clase Logger para el módulo Techo Propio
 */
class TechoPropioLogger {
  private readonly prefix = '[TECHO-PROPIO]';

  /**
   * Formatea el mensaje con timestamp y contexto
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const emoji = LOG_COLORS[level];
    return `${emoji} ${this.prefix} [${timestamp}] ${message}`;
  }

  /**
   * Verifica si debe loggear según la configuración
   */
  private shouldLog(): boolean {
    return isLoggingEnabled();
  }

  /**
   * Log de debug - Solo en desarrollo
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog() && isDevelopment()) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message), ...args);
    }
  }

  /**
   * Log informativo
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.log(this.formatMessage(LogLevel.INFO, message), ...args);
    }
  }

  /**
   * Log de advertencia
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.warn(this.formatMessage(LogLevel.WARN, message), ...args);
    }
  }

  /**
   * Log de error - Siempre se muestra
   */
  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage(LogLevel.ERROR, message), ...args);
  }

  /**
   * Log de inicio de operación
   */
  start(operation: string, data?: any): void {
    if (this.shouldLog()) {
      const message = `🚀 Iniciando: ${operation}`;
      if (data) {
        console.log(this.formatMessage(LogLevel.INFO, message), data);
      } else {
        console.log(this.formatMessage(LogLevel.INFO, message));
      }
    }
  }

  /**
   * Log de finalización exitosa
   */
  success(operation: string, result?: any): void {
    if (this.shouldLog()) {
      const message = `✅ Completado: ${operation}`;
      if (result) {
        console.log(this.formatMessage(LogLevel.INFO, message), result);
      } else {
        console.log(this.formatMessage(LogLevel.INFO, message));
      }
    }
  }

  /**
   * Log de fallo en operación
   */
  failure(operation: string, error?: any): void {
    const message = `❌ Falló: ${operation}`;
    if (error) {
      console.error(this.formatMessage(LogLevel.ERROR, message), error);
    } else {
      console.error(this.formatMessage(LogLevel.ERROR, message));
    }
  }

  /**
   * Log de API request
   */
  apiRequest(method: string, url: string, data?: any): void {
    if (this.shouldLog()) {
      const message = `📤 API ${method.toUpperCase()}: ${url}`;
      if (data) {
        console.log(this.formatMessage(LogLevel.DEBUG, message), data);
      } else {
        console.log(this.formatMessage(LogLevel.DEBUG, message));
      }
    }
  }

  /**
   * Log de API response
   */
  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (this.shouldLog()) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      const message = `📥 API ${method.toUpperCase()} ${status}: ${url}`;
      if (data) {
        console.log(`${emoji} ${this.prefix} ${message}`, data);
      } else {
        console.log(`${emoji} ${this.prefix} ${message}`);
      }
    }
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number): void {
    if (this.shouldLog() && isDevelopment()) {
      const message = `⏱️ Performance: ${operation} tardó ${duration}ms`;
      console.log(this.formatMessage(LogLevel.DEBUG, message));
    }
  }

  /**
   * Grouping de logs relacionados
   */
  group(label: string): void {
    if (this.shouldLog()) {
      console.group(this.formatMessage(LogLevel.INFO, label));
    }
  }

  /**
   * Fin del grupo de logs
   */
  groupEnd(): void {
    if (this.shouldLog()) {
      console.groupEnd();
    }
  }
}

/**
 * Instancia singleton del logger
 */
export const logger = new TechoPropioLogger();

/**
 * Exportación por defecto
 */
export default logger;

/**
 * Helpers para logging específico
 */
export const logApi = {
  request: (method: string, url: string, data?: any) => logger.apiRequest(method, url, data),
  response: (method: string, url: string, status: number, data?: any) => 
    logger.apiResponse(method, url, status, data),
};

export const logPerformance = {
  start: (operation: string) => {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      logger.performance(operation, Math.round(duration));
    };
  },
};