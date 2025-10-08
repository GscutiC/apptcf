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
 * Configuración de emergencia inline (sin dependencias circulares)
 * Solo contiene estructura mínima sin valores de negocio
 */
const EMERGENCY_CONFIG: InterfaceConfig = {
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

/**
 * ⚠️ DEPRECADO: Usar dynamicConfigService.getCurrentConfig() en su lugar
 * Mantenido solo para compatibilidad con código legacy
 */
export const DEFAULT_INTERFACE_CONFIG: InterfaceConfig = EMERGENCY_CONFIG;

/**
 * ⚠️ DEPRECADO: Los temas alternativos deben cargarse desde backend (presets)
 * Mantenido solo para compatibilidad
 */
export const DARK_THEME_CONFIG: InterfaceConfig = EMERGENCY_CONFIG;

/**
 * ⚠️ DEPRECADO: Los temas alternativos deben cargarse desde backend (presets)
 * Mantenido solo para compatibilidad
 */
export const GREEN_CORPORATE_CONFIG: InterfaceConfig = EMERGENCY_CONFIG;

/**
 * ⚠️ DEPRECADO: Usar dynamicConfigService.getPresets() en su lugar
 * Mantenido solo para compatibilidad con código legacy
 */
export const SYSTEM_PRESETS: PresetConfig[] = [];

/**
 * ⚠️ DEPRECADO: Usar dynamicConfigService.getCurrentConfig() en su lugar
 * 
 * Esta función ahora retorna la configuración de emergencia inline.
 * Para obtener la configuración real, use:
 * 
 * ```typescript
 * import { dynamicConfigService } from '../services/dynamicConfigService';
 * const config = await dynamicConfigService.getCurrentConfig(getToken);
 * ```
 * 
 * @deprecated Usar dynamicConfigService.getCurrentConfig()
 */
export const getDefaultConfig = (): InterfaceConfig => {
  return JSON.parse(JSON.stringify(EMERGENCY_CONFIG));
};

/**
 * ⚠️ DEPRECADO: Usar dynamicConfigService.getPresets() para cargar desde backend
 * 
 * @deprecated Usar dynamicConfigService.getPresets()
 */
export const getPresetById = (id: string): PresetConfig | undefined => {
  logger.warn(
    '⚠️ getPresetById() está deprecado. ' +
    'Use dynamicConfigService.getPresets() para cargar presets desde backend.'
  );
  return undefined;
};

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