/**
 * Configuraciones predefinidas del sistema
 * REFACTORIZADO: Ya no contiene valores hardcodeados
 * Actúa como adaptador al dynamicConfigService
 * 
 * MIGRACIÓN:
 * - Mantiene compatibilidad con código existente
 * - Delega carga real al backend vía dynamicConfigService
 * - Solo exporta configuración de emergencia como última opción
 */

import { InterfaceConfig, PresetConfig } from '../types';
import { logger } from '../../../shared/utils/logger';

/**
 * 🚨 CONFIGURACIÓN DE EMERGENCIA ÚNICAMENTE
 * Solo se usa cuando hay fallo total del sistema (servidor caído, sin caché, etc.)
 * Contiene estructura mínima para evitar errores de UI
 * 
 * ⚠️ IMPORTANTE: Esta config debe ser lo más genérica posible
 * NO debe contener valores de negocio específicos (colores, branding, etc.)
 */
const EMERGENCY_CONFIG: InterfaceConfig = {
  theme: {
    mode: 'light',
    name: 'Configuración de Emergencia',
    colors: {
      primary: {
        '50': '#f8fafc', '100': '#f1f5f9', '200': '#e2e8f0',
        '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b',
        '600': '#475569', '700': '#334155', '800': '#1e293b',
        '900': '#0f172a'
      },
      secondary: {
        '50': '#f8fafc', '100': '#f1f5f9', '200': '#e2e8f0',
        '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b',
        '600': '#475569', '700': '#334155', '800': '#1e293b',
        '900': '#0f172a'
      },
      accent: {
        '50': '#f8fafc', '100': '#f1f5f9', '200': '#e2e8f0',
        '300': '#cbd5e1', '400': '#94a3b8', '500': '#64748b',
        '600': '#475569', '700': '#334155', '800': '#1e293b',
        '900': '#0f172a'
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
      text: 'Sistema',
      showText: true,
      showImage: false
    },
    favicon: {},
    sidebarLogo: {
      text: 'Sistema',
      showText: true,
      showImage: false,
      collapsedText: 'S'
    }
  },
  branding: {
    appName: 'Sistema en Mantenimiento',
    appDescription: 'Cargando configuración...',
    tagline: 'Conectando con servidor',
    companyName: 'Sistema',
    welcomeMessage: 'Cargando...',
    loginPageTitle: 'Accediendo al sistema',
    loginPageDescription: 'Estableciendo conexión segura'
  },
  customCSS: '',
  isActive: true
};

/**
 * Configuración de emergencia para fallback
 * Mantenida porque interfaceConfigService.ts la usa como fallback
 */
export const DEFAULT_INTERFACE_CONFIG: InterfaceConfig = EMERGENCY_CONFIG;

/**
 * Validar configuración (mantiene utilidad)
 * Esta función sigue siendo útil para validación
 */
export const validateConfig = (config: InterfaceConfig): string[] => {
  const errors: string[] = [];

  if (!config.theme?.name?.trim()) {
    errors.push('El nombre del tema es obligatorio');
  }

  if (!config.branding?.appName?.trim()) {
    errors.push('El nombre de la aplicación es obligatorio');
  }

  if (!config.branding?.appDescription?.trim()) {
    errors.push('La descripción de la aplicación es obligatoria');
  }

  if (!config.logos?.mainLogo?.text?.trim() && !config.logos?.mainLogo?.imageUrl) {
    errors.push('Debe especificar texto o imagen para el logo principal');
  }

  return errors;
};

/**
 * ✅ NUEVA FUNCIÓN: Cargar configuración desde backend
 * Esta es la forma recomendada de obtener configuraciones
 * 
 * @param getToken - Función para obtener token JWT
 * @returns Promise con la configuración actual del backend
 */
export const loadConfigFromBackend = async (
  getToken: () => Promise<string | null>
): Promise<InterfaceConfig> => {
  // Import dinámico para evitar problemas circulares
  const { dynamicConfigService } = await import('../services/dynamicConfigService');
  return await dynamicConfigService.getCurrentConfig(getToken);
};

/**
 * ✅ NUEVA FUNCIÓN: Cargar presets desde backend
 * Esta es la forma recomendada de obtener presets
 * 
 * @param getToken - Función para obtener token JWT
 * @returns Promise con los presets del backend
 */
export const loadPresetsFromBackend = async (
  getToken: () => Promise<string | null>
): Promise<PresetConfig[]> => {
  // Import dinámico para evitar problemas circulares
  const { dynamicConfigService } = await import('../services/dynamicConfigService');
  return await dynamicConfigService.getPresets(getToken);
};