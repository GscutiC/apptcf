/**
 * Servicio de Configuración Dinámica
 * Responsabilidad: Cargar configuraciones SIEMPRE desde el backend (MongoDB)
 * 
 * ARQUITECTURA OPTIMIZADA:
 * - Backend MongoDB es la ÚNICA fuente de verdad
 * - Backend tiene su propio CacheService optimizado con TTL
 * - Frontend NO cachea, siempre consulta backend (el cache backend es rápido)
 * - Sin valores hardcodeados de fallback
 * - Sin problemas de sincronización de doble caché
 */

import { InterfaceConfig, PresetConfig } from '../types';
import { interfaceConfigService } from './interfaceConfigService';
import { DEFAULT_INTERFACE_CONFIG } from '../utils/defaultConfigs';
import { logger } from '../../../shared/utils/logger';

/**
 * Error específico cuando no se puede cargar configuración
 */
export class ConfigLoadError extends Error {
  constructor(
    message: string,
    public readonly reason: 'network' | 'auth' | 'validation' | 'unknown',
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ConfigLoadError';
  }
}

/**
 * Servicio para cargar configuraciones dinámicamente desde backend
 * Sin caché frontend - Backend maneja todo el caching
 */
class DynamicConfigService {
  private static instance: DynamicConfigService;

  private constructor() {}

  static getInstance(): DynamicConfigService {
    if (!DynamicConfigService.instance) {
      DynamicConfigService.instance = new DynamicConfigService();
    }
    return DynamicConfigService.instance;
  }

  /**
   * Obtener configuración actual desde backend
   * Backend maneja su propio caché, frontend solo consulta
   * @param getToken - Función para obtener token JWT
   */
  async getCurrentConfig(
    getToken: () => Promise<string | null>
  ): Promise<InterfaceConfig> {
    logger.info('🔄 Cargando configuración desde backend...');

    try {
      const config = await interfaceConfigService.getCurrentConfig(getToken);
      
      if (config) {
        logger.info('✅ Configuración cargada desde backend');
        return config;
      }

      // No hay configuración en backend
      throw new ConfigLoadError(
        'No se encontró configuración en backend',
        'validation'
      );

    } catch (error) {
      logger.error('❌ Error cargando configuración:', error);
      throw new ConfigLoadError(
        'No se pudo cargar configuración desde backend',
        'network',
        error as Error
      );
    }
  }

  /**
   * Obtener presets desde backend
   * Backend maneja su propio caché, frontend solo consulta
   * @param getToken - Función para obtener token JWT
   */
  async getPresets(getToken: () => Promise<string | null>): Promise<PresetConfig[]> {
    try {
      logger.info('🔄 Cargando presets desde backend...');
      
      const presets = await interfaceConfigService.getPresets(getToken);
      
      if (presets && presets.length > 0) {
        logger.info(`✅ ${presets.length} presets cargados desde backend`);
        return presets;
      }

      logger.info('ℹ️ No hay presets disponibles');
      return [];

    } catch (error) {
      logger.error('❌ Error cargando presets:', error);
      return [];
    }
  }

  /**
   * Crear configuración de emergencia
   * SOLO usar cuando TODO falla (backend caído completamente)
   * Usa la configuración centralizada de defaultConfigs.ts
   */
  getEmergencyConfig(): InterfaceConfig {
    logger.warn('⚠️ Usando configuración de emergencia desde DEFAULT_INTERFACE_CONFIG');
    return { ...DEFAULT_INTERFACE_CONFIG };
  }
}

// Exportar instancia singleton
export const dynamicConfigService = DynamicConfigService.getInstance();

// Exportar funciones helper para uso simple
export const loadCurrentConfig = (getToken: () => Promise<string | null>) => 
  dynamicConfigService.getCurrentConfig(getToken);

export const loadPresets = (getToken: () => Promise<string | null>) => 
  dynamicConfigService.getPresets(getToken);

export const getEmergencyConfig = () => 
  dynamicConfigService.getEmergencyConfig();
