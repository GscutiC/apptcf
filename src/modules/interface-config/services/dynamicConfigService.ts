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
   * Crear configuración mínima de emergencia
   * SOLO usar cuando TODO falla (backend caído completamente)
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
