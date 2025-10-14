/**
 * Tipos TypeScript para la configuración visual del módulo Techo Propio
 * Define la estructura de datos del frontend
 */

export interface TechoPropioColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface TechoPropioLogos {
  // Opción 1: Emoji/texto (siempre presente como fallback)
  sidebar_icon: string;
  
  // Opción 2: Archivo subido para sidebar
  sidebar_icon_file_id?: string;
  sidebar_icon_url?: string;
  
  // Header logo (opcional)
  header_logo?: string;
  header_logo_file_id?: string;
  header_logo_url?: string;
}

export interface TechoPropioBranding {
  module_title: string;
  module_description: string;
  dashboard_welcome: string;
}

export interface TechoPropioConfig {
  id?: string;
  user_id?: string;
  colors: TechoPropioColors;
  logos: TechoPropioLogos;
  branding: TechoPropioBranding;
  created_at?: string;
  updated_at?: string;
}

/**
 * Configuración por defecto del módulo
 * Se usa cuando el usuario no ha personalizado su vista
 */
export const DEFAULT_CONFIG: TechoPropioConfig = {
  colors: {
    primary: '#16A34A',    // Verde
    secondary: '#2563EB',  // Azul
    accent: '#DC2626'      // Rojo
  },
  logos: {
    sidebar_icon: '🏠',
    sidebar_icon_file_id: undefined,
    sidebar_icon_url: undefined,
    header_logo: undefined,
    header_logo_file_id: undefined,
    header_logo_url: undefined
  },
  branding: {
    module_title: 'Techo Propio',
    module_description: 'Gestión de Solicitudes',
    dashboard_welcome: 'Bienvenido al sistema'
  }
};

/**
 * Tipos para respuestas de la API
 */
export interface TechoPropioConfigResponse {
  id?: string;
  user_id: string;
  colors: TechoPropioColors;
  logos: TechoPropioLogos;
  branding: TechoPropioBranding;
  created_at?: string;
  updated_at?: string;
}

export interface TechoPropioConfigExistsResponse {
  exists: boolean;
}

export interface TechoPropioConfigDeleteResponse {
  message: string;
  detail: string;
}

/**
 * Helper para determinar qué logo mostrar (imagen vs emoji/texto)
 */
export interface LogoDisplay {
  type: 'image' | 'emoji';
  value: string;
}

export function getLogoToDisplay(
  logos: TechoPropioLogos | null | undefined, 
  position: 'sidebar' | 'header'
): LogoDisplay {
  // Validación defensiva: si no hay logos, usar fallbacks por defecto
  if (!logos) {
    return position === 'sidebar' 
      ? { type: 'emoji', value: '🏠' }
      : { type: 'emoji', value: '' };
  }

  if (position === 'sidebar') {
    // Prioridad: URL > file_id > emoji
    if (logos.sidebar_icon_url) {
      return { type: 'image', value: logos.sidebar_icon_url };
    }
    if (logos.sidebar_icon_file_id) {
      return { type: 'image', value: `/api/files/${logos.sidebar_icon_file_id}` };
    }
    return { type: 'emoji', value: logos.sidebar_icon || '🏠' };
  }
  
  // Header
  if (logos.header_logo_url) {
    return { type: 'image', value: logos.header_logo_url };
  }
  if (logos.header_logo_file_id) {
    return { type: 'image', value: `/api/files/${logos.header_logo_file_id}` };
  }
  return { type: 'emoji', value: logos.header_logo || '' };
}
