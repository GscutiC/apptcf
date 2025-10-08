/**
 * Servicio de Configuración Dinámica
 * Responsabilidad: Cargar configuraciones SIEMPRE desde el backend (MongoDB)
 * Elimina dependencias de configuraciones hardcodeadas
 * 
 * ARQUITECTURA:
 * - Backend MongoDB es la ÚNICA fuente de verdad
 * - Cache inteligente para modo offline
 * - Sin valores hardcodeados de fallback
 */

import { InterfaceConfig, PresetConfig } from '../types';
import { interfaceConfigService } from './interfaceConfigService';
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
 * Estrategia de carga de configuración
 */
export type LoadStrategy = 
  | 'backend-first'      // Intenta backend primero (default)
  | 'cache-first'        // Usa cache si existe
  | 'backend-only';      // Solo backend, falla si no está disponible

/**
 * Servicio para cargar configuraciones dinámicamente desde backend
 */
class DynamicConfigService {
  private static instance: DynamicConfigService;
  
  // Cache en memoria (más rápido que localStorage)
  private memoryCache: {
    config: InterfaceConfig | null;
    presets: PresetConfig[] | null;
    timestamp: number;
  } = {
    config: null,
    presets: null,
    timestamp: 0
  };

  private readonly MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  private constructor() {}

  static getInstance(): DynamicConfigService {
    if (!DynamicConfigService.instance) {
      DynamicConfigService.instance = new DynamicConfigService();
    }
    return DynamicConfigService.instance;
  }

  /**
   * Obtener configuración actual desde backend
   * @param getToken - Función para obtener token JWT
   * @param strategy - Estrategia de carga
   */
  async getCurrentConfig(
    getToken: () => Promise<string | null>,
    strategy: LoadStrategy = 'backend-first'
  ): Promise<InterfaceConfig> {
    logger.info('🔄 Cargando configuración con estrategia:', strategy);

    try {
      // Estrategia: cache-first
      if (strategy === 'cache-first') {
        const cached = this.getFromMemoryCache();
        if (cached) {
          logger.info('✅ Configuración cargada desde memoria cache');
          return cached;
        }
      }

      // Intentar cargar desde backend
      const config = await interfaceConfigService.getCurrentConfig(getToken);
      
      if (config) {
        // Guardar en cache de memoria
        this.saveToMemoryCache(config);
        logger.info('✅ Configuración cargada desde backend y cacheada');
        return config;
      }

      // Si no hay configuración en backend, verificar cache
      const cachedConfig = this.getFromMemoryCache();
      if (cachedConfig) {
        logger.warn('⚠️ Backend sin configuración, usando cache');
        return cachedConfig;
      }

      // No hay configuración en ningún lado
      throw new ConfigLoadError(
        'No se encontró configuración en backend ni en cache',
        'validation'
      );

    } catch (error) {
      logger.error('❌ Error cargando configuración:', error);

      // Para backend-only, fallar inmediatamente
      if (strategy === 'backend-only') {
        throw new ConfigLoadError(
          'Backend no disponible y estrategia es backend-only',
          'network',
          error as Error
        );
      }

      // Para otras estrategias, intentar cache como último recurso
      const cachedConfig = this.getFromMemoryCache();
      if (cachedConfig) {
        logger.warn('⚠️ Error de red, usando configuración cacheada');
        return cachedConfig;
      }

      // Sin cache disponible
      throw new ConfigLoadError(
        'No se pudo cargar configuración y no hay cache disponible',
        'network',
        error as Error
      );
    }
  }

  /**
   * Obtener presets desde backend
   * @param getToken - Función para obtener token JWT
   */
  async getPresets(getToken: () => Promise<string | null>): Promise<PresetConfig[]> {
    try {
      // Verificar cache primero
      if (this.memoryCache.presets && this.isCacheValid()) {
        logger.info('✅ Presets cargados desde memoria cache');
        return this.memoryCache.presets;
      }

      // Cargar desde backend
      const presets = await interfaceConfigService.getPresets(getToken);
      
      if (presets && presets.length > 0) {
        this.memoryCache.presets = presets;
        this.memoryCache.timestamp = Date.now();
        logger.info('✅ Presets cargados desde backend y cacheados');
        return presets;
      }

      // Si no hay presets en backend, retornar cache si existe
      if (this.memoryCache.presets) {
        logger.warn('⚠️ Backend sin presets, usando cache');
        return this.memoryCache.presets;
      }

      // No hay presets disponibles
      logger.warn('⚠️ No hay presets disponibles');
      return [];

    } catch (error) {
      logger.error('❌ Error cargando presets:', error);
      
      // Retornar cache si existe
      if (this.memoryCache.presets) {
        logger.warn('⚠️ Error de red, usando presets cacheados');
        return this.memoryCache.presets;
      }

      return [];
    }
  }

  /**
   * Crear configuración mínima de emergencia
   * SOLO usar cuando TODO falla (backend caído + sin cache)
   * No contiene valores de negocio hardcodeados
   */
  getEmergencyConfig(): InterfaceConfig {
    logger.warn('⚠️ Usando configuración de emergencia (estructura mínima)');
    
    return {
      theme: {
        mode: 'light',
        name: 'Tema por Defecto',
        colors: {
          primary: {
            '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe',
            '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6',
            '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af',
            '900': '#1e3a8a'
          },
          secondary: {
            '50': '#faf5ff', '100': '#f3e8ff', '200': '#e9d5ff',
            '300': '#d8b4fe', '400': '#c084fc', '500': '#a855f7',
            '600': '#9333ea', '700': '#7c3aed', '800': '#6b21a8',
            '900': '#581c87'
          },
          accent: {
            '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0',
            '300': '#6ee7b7', '400': '#34d399', '500': '#10b981',
            '600': '#059669', '700': '#047857', '800': '#065f46',
            '900': '#064e3b'
          },
          neutral: {
            '50': '#f9fafb', '100': '#f3f4f6', '200': '#e5e7eb',
            '300': '#d1d5db', '400': '#9ca3af', '500': '#6b7280',
            '600': '#4b5563', '700': '#374151', '800': '#1f2937',
            '900': '#111827'
          }
        },
        typography: {
          fontFamily: {
            primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            secondary: 'Georgia, serif',
            mono: 'monospace'
          },
          fontSize: {
            xs: '0.75rem', sm: '0.875rem', base: '1rem',
            lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem',
            '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem'
          },
          fontWeight: {
            light: 300, normal: 400, medium: 500,
            semibold: 600, bold: 700
          }
        },
        layout: {
          borderRadius: {
            sm: '0.125rem', base: '0.25rem', md: '0.375rem',
            lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', full: '9999px'
          },
          spacing: {
            xs: '0.5rem', sm: '0.75rem', base: '1rem',
            md: '1.5rem', lg: '2rem', xl: '3rem', '2xl': '4rem'
          },
          shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            base: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
          }
        }
      },
      logos: {
        mainLogo: {
          text: 'App',
          showText: true,
          showImage: false
        },
        favicon: {},
        sidebarLogo: {
          text: 'App',
          showText: true,
          showImage: false,
          collapsedText: 'A'
        }
      },
      branding: {
        appName: 'Aplicación',
        appDescription: 'Sistema de gestión',
        tagline: '',
        companyName: '',
        welcomeMessage: 'Bienvenido',
        loginPageTitle: 'Bienvenido',
        loginPageDescription: 'Inicia sesión para continuar'
      },
      customCSS: '',
      isActive: true
    };
  }

  /**
   * Limpiar cache
   */
  clearCache(): void {
    this.memoryCache = {
      config: null,
      presets: null,
      timestamp: 0
    };
    logger.info('🗑️ Cache de configuración limpiado');
  }

  /**
   * Invalidar cache y forzar recarga
   */
  async invalidateAndReload(getToken: () => Promise<string | null>): Promise<InterfaceConfig> {
    this.clearCache();
    return this.getCurrentConfig(getToken, 'backend-only');
  }

  // Métodos privados

  private getFromMemoryCache(): InterfaceConfig | null {
    if (this.memoryCache.config && this.isCacheValid()) {
      return this.memoryCache.config;
    }
    return null;
  }

  private saveToMemoryCache(config: InterfaceConfig): void {
    this.memoryCache.config = config;
    this.memoryCache.timestamp = Date.now();
  }

  private isCacheValid(): boolean {
    const age = Date.now() - this.memoryCache.timestamp;
    return age < this.MEMORY_CACHE_TTL;
  }
}

// Exportar instancia singleton
export const dynamicConfigService = DynamicConfigService.getInstance();

// Exportar funciones helper para uso simple
export const loadCurrentConfig = (
  getToken: () => Promise<string | null>,
  strategy?: LoadStrategy
) => dynamicConfigService.getCurrentConfig(getToken, strategy);

export const loadPresets = (getToken: () => Promise<string | null>) => 
  dynamicConfigService.getPresets(getToken);

export const getEmergencyConfig = () => 
  dynamicConfigService.getEmergencyConfig();

export const clearConfigCache = () => 
  dynamicConfigService.clearCache();
