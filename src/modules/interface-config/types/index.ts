/**
 * Tipos para el módulo de configuración de interfaz
 */

// Configuración de tonos de color
export type ColorShades = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  [key: string]: string; // Permite indexación con string
};

// Configuración de colores
export interface ColorConfig {
  primary: ColorShades;
  secondary: ColorShades;
  accent: ColorShades;
  neutral: ColorShades;
  [key: string]: ColorShades; // Permite indexación con string
}

// Configuración de tipografía
export interface TypographyConfig {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

// Configuración de un logo individual
export interface LogoItem {
  text?: string;
  imageUrl?: string; // URL completa de la imagen (Base64 o URL del servidor)
  fileId?: string; // ID del archivo en el servidor (para nuevas imágenes)
  showText?: boolean;
  showImage?: boolean;
  collapsedText?: string; // Texto cuando el sidebar está colapsado (solo para sidebarLogo)
}

// Configuración de logos
export interface LogoConfig {
  mainLogo: LogoItem & {
    text: string;
    showText: boolean;
    showImage: boolean;
  };
  favicon: {
    imageUrl?: string;
    fileId?: string;
  };
  sidebarLogo: LogoItem & {
    text: string;
    showText: boolean;
    showImage: boolean;
    collapsedText: string;
  };
}

// Configuración de branding
export interface BrandingConfig {
  appName: string;
  appDescription: string;
  tagline?: string; // eslogan
  companyName?: string;
  welcomeMessage: string;
  loginPageTitle: string;
  loginPageDescription: string;
}

// Configuración de layout
export interface LayoutConfig {
  borderRadius: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  spacing: {
    xs: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  shadows: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

// Configuración de tema
export interface ThemeConfig {
  mode: 'light' | 'dark';
  name: string;
  colors: ColorConfig;
  typography: TypographyConfig;
  layout: LayoutConfig;
}

// Configuración completa de interfaz
export interface InterfaceConfig {
  id?: string;
  theme: ThemeConfig;
  logos: LogoConfig;
  branding: BrandingConfig;
  customCSS?: string; // CSS personalizado adicional
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string; // ID del usuario que creó la configuración
}

// Configuración predefinida del sistema
export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  config: InterfaceConfig;
  isDefault: boolean;
  isSystem: boolean; // No se puede eliminar
}

// Contexto del tema
export interface ThemeContextValue {
  config: InterfaceConfig;
  savedConfig: InterfaceConfig;
  setConfig: (config: Partial<InterfaceConfig>) => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
  resetToDefault: () => void;
  presets: PresetConfig[];
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  isSaving: boolean;
}

// Estados para el formulario de configuración
export interface ConfigFormState {
  config: InterfaceConfig;
  isDirty: boolean;
  isSaving: boolean;
  validationErrors: Record<string, string>;
}

// Eventos de cambio de configuración
export type ConfigChangeEvent = {
  type: 'theme' | 'logo' | 'branding' | 'layout';
  field: string;
  value: any;
  config: InterfaceConfig;
};