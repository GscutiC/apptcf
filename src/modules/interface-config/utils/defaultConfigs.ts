/**
 * Configuraciones predefinidas del sistema
 */

import { InterfaceConfig, PresetConfig } from '../types';

// Configuración por defecto (tu tema actual elegante)
export const DEFAULT_INTERFACE_CONFIG: InterfaceConfig = {
  theme: {
    mode: 'light',
    name: 'Tema Elegante Azul',
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      secondary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
      },
      accent: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      },
      neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
    },
    typography: {
      fontFamily: {
        primary: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\', \'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\', \'Helvetica Neue\', sans-serif',
        secondary: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\', \'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\', \'Helvetica Neue\', sans-serif',
        mono: 'source-code-pro, Menlo, Monaco, Consolas, \'Courier New\', monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    layout: {
      borderRadius: {
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        base: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
    },
  },
  logos: {
    mainLogo: {
      text: 'MA',
      imageUrl: undefined,
      showText: true,
      showImage: false,
    },
    favicon: {
      imageUrl: undefined,
    },
    sidebarLogo: {
      text: 'Mi App Completa',
      imageUrl: undefined,
      showText: true,
      showImage: false,
      collapsedText: 'MA',
    },
  },
  branding: {
    appName: 'Mi App Completa',
    appDescription: 'Sistema de gestión integral con IA',
    tagline: 'Gestión inteligente y eficiente',
    companyName: '',
    welcomeMessage: '¡Bienvenido a Mi App Completa!',
    loginPageTitle: '¡Bienvenido a Mi App Completa!',
    loginPageDescription: 'Inicia sesión o regístrate para acceder a todas las funcionalidades de la aplicación.',
  },
  customCSS: '',
  isActive: true,
};

// Tema oscuro alternativo
export const DARK_THEME_CONFIG: InterfaceConfig = {
  ...DEFAULT_INTERFACE_CONFIG,
  theme: {
    ...DEFAULT_INTERFACE_CONFIG.theme,
    mode: 'dark',
    name: 'Tema Oscuro Elegante',
    colors: {
      ...DEFAULT_INTERFACE_CONFIG.theme.colors,
      neutral: {
        50: '#111827',
        100: '#1f2937',
        200: '#374151',
        300: '#4b5563',
        400: '#6b7280',
        500: '#9ca3af',
        600: '#d1d5db',
        700: '#e5e7eb',
        800: '#f3f4f6',
        900: '#f9fafb',
      },
    },
  },
};

// Tema verde corporativo
export const GREEN_CORPORATE_CONFIG: InterfaceConfig = {
  ...DEFAULT_INTERFACE_CONFIG,
  theme: {
    ...DEFAULT_INTERFACE_CONFIG.theme,
    name: 'Tema Verde Corporativo',
    colors: {
      ...DEFAULT_INTERFACE_CONFIG.theme.colors,
      primary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      },
    },
  },
  branding: {
    ...DEFAULT_INTERFACE_CONFIG.branding,
    tagline: 'Soluciones empresariales sostenibles',
  },
};

// Configuraciones predefinidas del sistema
export const SYSTEM_PRESETS: PresetConfig[] = [
  {
    id: 'default-elegant-blue',
    name: 'Elegante Azul (Por defecto)',
    description: 'Tema elegante con gradientes azul-morado, perfecto para aplicaciones profesionales',
    config: DEFAULT_INTERFACE_CONFIG,
    isDefault: true,
    isSystem: true,
  },
  {
    id: 'dark-elegant',
    name: 'Oscuro Elegante',
    description: 'Versión oscura del tema elegante, ideal para uso prolongado',
    config: DARK_THEME_CONFIG,
    isDefault: false,
    isSystem: true,
  },
  {
    id: 'green-corporate',
    name: 'Verde Corporativo',
    description: 'Tema verde profesional para empresas enfocadas en sostenibilidad',
    config: GREEN_CORPORATE_CONFIG,
    isDefault: false,
    isSystem: true,
  },
];

// Función para obtener configuración por defecto
export const getDefaultConfig = (): InterfaceConfig => {
  return JSON.parse(JSON.stringify(DEFAULT_INTERFACE_CONFIG));
};

// Función para obtener preset por ID
export const getPresetById = (id: string): PresetConfig | undefined => {
  return SYSTEM_PRESETS.find(preset => preset.id === id);
};

// Función para validar configuración
export const validateConfig = (config: InterfaceConfig): string[] => {
  const errors: string[] = [];

  if (!config.theme.name.trim()) {
    errors.push('El nombre del tema es obligatorio');
  }

  if (!config.branding.appName.trim()) {
    errors.push('El nombre de la aplicación es obligatorio');
  }

  if (!config.branding.appDescription.trim()) {
    errors.push('La descripción de la aplicación es obligatoria');
  }

  if (!config.logos.mainLogo.text.trim() && !config.logos.mainLogo.imageUrl) {
    errors.push('Debe especificar texto o imagen para el logo principal');
  }

  return errors;
};