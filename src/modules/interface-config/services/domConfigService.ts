/**
 * Servicio especializado para aplicar configuraciones al DOM
 * Responsabilidad: Aplicar estilos CSS y variables personalizadas
 */

import { InterfaceConfig } from '../types';
import { logger } from '../../../shared/utils/logger';

export class DOMConfigService {
  private static readonly CSS_VARIABLES_PREFIX = '--config-';
  private static readonly FAVICON_SELECTOR = 'link[rel="icon"]';
  private static readonly TITLE_SELECTOR = 'title';

  /**
   * Aplica toda la configuración al DOM
   */
  static applyConfigToDOM(config: InterfaceConfig): void {
    try {
      logger.debug('🎨 Aplicando configuración al DOM:', config.id);
      
      if (!config || !config.theme) {
        logger.warn('Configuración inválida, omitiendo aplicación al DOM');
        return;
      }

      // Aplicar en orden específico para evitar conflictos
      this.applyThemeVariables(config);
      this.applyBrandingToDocument(config);
      this.applyFavicon(config);
      
      logger.debug('✅ Configuración aplicada exitosamente al DOM');
      
    } catch (error) {
      logger.error('Error aplicando configuración al DOM:', error);
    }
  }

  /**
   * Aplica las variables CSS del tema
   */
  private static applyThemeVariables(config: InterfaceConfig): void {
    try {
      const root = document.documentElement;
      const { colors, typography, layout } = config.theme;

      // Limpiar variables previas
      this.clearPreviousVariables(root);

      // Aplicar colores
      if (colors) {
        this.applyColorVariables(root, colors);
      }

      // Aplicar tipografía
      if (typography) {
        this.applyTypographyVariables(root, typography);
      }

      // Aplicar layout
      if (layout) {
        this.applyLayoutVariables(root, layout);
      }

      logger.debug('🎨 Variables CSS aplicadas');
      
    } catch (error) {
      logger.error('Error aplicando variables CSS:', error);
    }
  }

  /**
   * Aplica variables de colores
   */
  private static applyColorVariables(root: HTMLElement, colors: any): void {
    try {
      Object.entries(colors).forEach(([colorName, shades]) => {
        if (typeof shades === 'object' && shades !== null) {
          Object.entries(shades as Record<string, string>).forEach(([shade, value]) => {
            if (typeof value === 'string') {
              root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}${colorName}-${shade}`, value);
            }
          });
        }
      });

      // Variables alias comunes
      if (colors.primary?.['500']) {
        root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}primary`, colors.primary['500']);
      }
      if (colors.secondary?.['500']) {
        root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}secondary`, colors.secondary['500']);
      }
      if (colors.accent?.['500']) {
        root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}accent`, colors.accent['500']);
      }

    } catch (error) {
      logger.error('Error aplicando variables de colores:', error);
    }
  }

  /**
   * Aplica variables de tipografía
   */
  private static applyTypographyVariables(root: HTMLElement, typography: any): void {
    try {
      // Font families
      if (typography.fontFamily) {
        Object.entries(typography.fontFamily).forEach(([key, value]) => {
          if (typeof value === 'string') {
            root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}font-${key}`, value);
          }
        });
      }

      // Font sizes
      if (typography.fontSize) {
        Object.entries(typography.fontSize).forEach(([key, value]) => {
          if (typeof value === 'string') {
            root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}text-${key}`, value);
          }
        });
      }

      // Font weights
      if (typography.fontWeight) {
        Object.entries(typography.fontWeight).forEach(([key, value]) => {
          root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}font-weight-${key}`, String(value));
        });
      }

    } catch (error) {
      logger.error('Error aplicando variables de tipografía:', error);
    }
  }

  /**
   * Aplica variables de layout
   */
  private static applyLayoutVariables(root: HTMLElement, layout: any): void {
    try {
      // Spacing
      if (layout.spacing) {
        Object.entries(layout.spacing).forEach(([key, value]) => {
          if (typeof value === 'string') {
            root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}space-${key}`, value);
          }
        });
      }

      // Border radius
      if (layout.borderRadius) {
        Object.entries(layout.borderRadius).forEach(([key, value]) => {
          if (typeof value === 'string') {
            root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}rounded-${key}`, value);
          }
        });
      }

      // Shadows
      if (layout.shadows) {
        Object.entries(layout.shadows).forEach(([key, value]) => {
          if (typeof value === 'string') {
            root.style.setProperty(`${this.CSS_VARIABLES_PREFIX}shadow-${key}`, value);
          }
        });
      }

    } catch (error) {
      logger.error('Error aplicando variables de layout:', error);
    }
  }

  /**
   * Aplica branding al documento (título, meta, etc.)
   */
  private static applyBrandingToDocument(config: InterfaceConfig): void {
    try {
      const { branding } = config;
      
      if (!branding) return;

      // Actualizar título de la página
      if (branding.appName) {
        const titleElement = document.querySelector(this.TITLE_SELECTOR);
        if (titleElement) {
          titleElement.textContent = branding.appName;
        }
      }

      // Actualizar meta descripción
      if (branding.appDescription) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', branding.appDescription);
      }

      logger.debug('📝 Branding aplicado al documento');

    } catch (error) {
      logger.error('Error aplicando branding al documento:', error);
    }
  }

  /**
   * Aplica favicon si está configurado
   */
  private static applyFavicon(config: InterfaceConfig): void {
    try {
      const { logos } = config;
      
      const faviconUrl = logos?.favicon?.imageUrl;
      if (!faviconUrl) return;

      let faviconElement = document.querySelector(this.FAVICON_SELECTOR) as HTMLLinkElement;
      
      if (!faviconElement) {
        faviconElement = document.createElement('link');
        faviconElement.rel = 'icon';
        document.head.appendChild(faviconElement);
      }

      faviconElement.href = faviconUrl;
      
      logger.debug('🎯 Favicon aplicado');

    } catch (error) {
      logger.error('Error aplicando favicon:', error);
    }
  }

  /**
   * Limpia variables CSS previas para evitar conflictos
   */
  private static clearPreviousVariables(root: HTMLElement): void {
    try {
      // Obtener todas las propiedades CSS personalizadas
      const computedStyles = getComputedStyle(root);
      
      // Buscar y limpiar solo nuestras variables
      for (let i = 0; i < computedStyles.length; i++) {
        const property = computedStyles[i];
        if (property.startsWith(this.CSS_VARIABLES_PREFIX)) {
          root.style.removeProperty(property);
        }
      }
      
    } catch (error) {
      // No es crítico si falla la limpieza
      logger.debug('Limpieza de variables CSS omitida:', error);
    }
  }

  /**
   * Fuerza la re-aplicación de estilos (útil para cuando los estilos no se actualizan)
   */
  static forceStyleRefresh(): void {
    try {
      // Forzar repaint
      document.body.style.display = 'none';
      // Trigger reflow
      document.body.offsetHeight;
      document.body.style.display = '';
      
      logger.debug('🔄 Forzado refresh de estilos');
      
    } catch (error) {
      logger.error('Error forzando refresh de estilos:', error);
    }
  }

  /**
   * Verifica si la configuración fue aplicada correctamente
   */
  static validateConfigApplication(config: InterfaceConfig): boolean {
    try {
      const root = document.documentElement;
      const primaryColor = config.theme?.colors?.primary?.['500'];
      
      if (primaryColor) {
        const appliedValue = getComputedStyle(root)
          .getPropertyValue(`${this.CSS_VARIABLES_PREFIX}primary`).trim();
        return appliedValue === primaryColor;
      }
      
      return true; // Si no hay color primario, consideramos que está bien
      
    } catch (error) {
      logger.error('Error validando aplicación de configuración:', error);
      return false;
    }
  }
}