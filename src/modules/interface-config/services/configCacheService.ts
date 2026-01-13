/**
 * Servicio de cach\u00e9 para configuraciones de interfaz
 * Maneja localStorage con expiraci\u00f3n y validaci\u00f3n
 */

import { InterfaceConfig } from '../types';
import { logger } from '../../../shared/utils/logger';

const CONFIG_CACHE_KEY = 'interface-config-cache';
const CONFIG_TIMESTAMP_KEY = 'interface-config-timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export class ConfigCacheService {
  /**
   * Guardar configuraci\u00f3n en cache
   */
  static setCache(config: InterfaceConfig): void {
    try {
      localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(config));
      localStorage.setItem(CONFIG_TIMESTAMP_KEY, Date.now().toString());
      logger.debug('\ud83d\udcbe Config guardada en cache');
    } catch (error) {
      logger.warn('No se pudo guardar en localStorage:', error);
    }
  }

  /**
   * Obtener configuraci\u00f3n desde cache (si es v\u00e1lida)
   */
  static getCache(): InterfaceConfig | null {
    try {
      const cachedConfig = localStorage.getItem(CONFIG_CACHE_KEY);
      const timestamp = localStorage.getItem(CONFIG_TIMESTAMP_KEY);

      if (!cachedConfig || !timestamp) {
        return null;
      }

      const age = Date.now() - parseInt(timestamp);

      if (age >= CACHE_DURATION) {
        logger.debug('\ud83d\uddd1\ufe0f Cache expirada');
        this.clearCache();
        return null;
      }

      const config = JSON.parse(cachedConfig) as InterfaceConfig;
      logger.debug('\u26a1 Config cargada desde cache');
      return config;

    } catch (error) {
      logger.warn('Error leyendo cache:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Limpiar cache
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(CONFIG_CACHE_KEY);
      localStorage.removeItem(CONFIG_TIMESTAMP_KEY);
      logger.debug('\ud83e\uddf9 Cache limpiada');
    } catch (error) {
      logger.warn('Error limpiando cache:', error);
    }
  }

  /**
   * Verificar si existe cache v\u00e1lida
   */
  static hasValidCache(): boolean {
    const timestamp = localStorage.getItem(CONFIG_TIMESTAMP_KEY);
    if (!timestamp) return false;

    const age = Date.now() - parseInt(timestamp);
    return age < CACHE_DURATION;
  }

  /**
   * Obtener configuraci\u00f3n precargada desde window
   */
  static getPreloadedConfig(): InterfaceConfig | null {
    try {
      // @ts-ignore - window.__INITIAL_CONFIG__ es inyectado por index.html
      const config = window.__INITIAL_CONFIG__;
      if (config) {
        logger.info('\u2705 Usando config precargada desde window');
        return config as InterfaceConfig;
      }
      return null;
    } catch (error) {
      logger.warn('Error obteniendo config precargada:', error);
      return null;
    }
  }

  /**
   * Invalidar cache cuando el usuario cambia
   */
  static invalidateCacheOnUserChange(userId: string): void {
    const lastUserId = localStorage.getItem('last-user-id');
    
    if (lastUserId && lastUserId !== userId) {
      logger.info('\ud83d\udd04 Usuario cambi\u00f3, invalidando cache');
      this.clearCache();
    }
    
    localStorage.setItem('last-user-id', userId);
  }
}

// Declaraci\u00f3n global para TypeScript
declare global {
  interface Window {
    __INITIAL_CONFIG__?: InterfaceConfig;
  }
}
