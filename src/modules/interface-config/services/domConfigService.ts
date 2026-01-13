/**
 * Servicio especializado para aplicar configuraciones al DOM
 * Responsabilidad: Aplicar estilos CSS y variables personalizadas
 */

import { InterfaceConfig } from '../types';
import { logger } from '../../../shared/utils/logger';

// Declarar tipo para window con nuestra propiedad personalizada
declare global {
  interface Window {
    __CONFIG_APPLIED__?: boolean;
    __INITIAL_CONFIG__?: InterfaceConfig;
    __LAST_CONFIG_ID__?: string;
  }
}

export class DOMConfigService {
  private static readonly CSS_VARIABLES_PREFIX = '--color-';
  private static readonly FAVICON_SELECTOR = 'link[rel="icon"]';
  private static readonly TITLE_SELECTOR = 'title';

  /**
   * Aplica toda la configuración al DOM
   * OPTIMIZADO: Evita re-aplicaciones innecesarias si la config no cambió
   */
  static applyConfigToDOM(config: InterfaceConfig): void {
    try {
      if (!config || !config.theme) {
        logger.warn('Configuración inválida, omitiendo aplicación al DOM');
        return;
      }

      // Evitar re-aplicación si es la misma configuración
      const configId = config.id || JSON.stringify(config.theme?.colors?.primary?.['500'] || '');
      if (window.__LAST_CONFIG_ID__ === configId && window.__CONFIG_APPLIED__) {
        logger.debug('⏭️ Config ya aplicada, omitiendo');
        return;
      }

      logger.debug('🎨 Aplicando configuración al DOM:', config.id);

      // Aplicar en orden específico para evitar conflictos
      this.applyThemeVariables(config);
      this.applyBrandingToDocument(config);
      this.applyFavicon(config);
      
      // Marcar como aplicada
      window.__CONFIG_APPLIED__ = true;
      window.__LAST_CONFIG_ID__ = configId;
      
      logger.debug('✅ Configuración aplicada exitosamente al DOM');
      
    } catch (error) {
      logger.error('Error aplicando configuración al DOM:', error);
    }
  }

  /**
   * Aplica solo favicon al DOM (función pública para usar en LoginPage)
   */
  static applyFaviconOnly(config: InterfaceConfig): void {
    this.applyFavicon(config);
  }

  /**
   * Genera favicon SVG con tamaño específico (para Apple Touch Icon y otros)
   */
  private static generateFaviconWithSize(appName: string, config: InterfaceConfig, size: number): string {
    try {
      const initials = appName
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
      
      const primaryColor = config.theme?.colors?.primary?.['500'] || '#10B981';
      const primaryDark = config.theme?.colors?.primary?.['600'] || '#059669';
      const textColor = '#FFFFFF';
      
      // Ajustar tamaño de fuente proporcionalmente
      const fontSize = Math.floor(size * 0.44); // ~44% del tamaño total
      const borderRadius = Math.floor(size * 0.1875); // ~18.75% para bordes redondeados
      
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <defs>
            <linearGradient id="bgGradient${size}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${primaryDark};stop-opacity:1" />
            </linearGradient>
            <filter id="textShadow${size}" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          
          <rect width="${size}" height="${size}" rx="${borderRadius}" fill="url(#bgGradient${size})"/>
          
          <text x="${size/2}" y="${size/2 + fontSize*0.1}" 
                font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                text-anchor="middle" 
                fill="${textColor}"
                filter="url(#textShadow${size})"
                dominant-baseline="middle">
            ${initials}
          </text>
        </svg>
      `.trim();
      
      return `data:image/svg+xml;base64,${btoa(svg)}`;
      
    } catch (error) {
      logger.error(`Error generando favicon ${size}x${size}:`, error);
      return '';
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
   * Aplica favicon si está configurado, con fallback automático al logo principal
   */
  private static applyFavicon(config: InterfaceConfig): void {
    try {
      const { logos, branding } = config;
      
      // Intentar usar favicon configurado primero
      let faviconUrl = logos?.favicon?.imageUrl;
      let faviconSource = 'favicon configurado';
      let needsEnhancement = false;
      
      // ✅ FALLBACK 1: Si no hay favicon, usar logo principal
      if (!faviconUrl && logos?.mainLogo?.imageUrl && logos?.mainLogo?.showImage) {
        faviconUrl = logos.mainLogo.imageUrl;
        faviconSource = 'logo principal (fallback)';
        needsEnhancement = true; // Marcar para mejora automática
        logger.info('🔄 Usando logo principal como favicon (fallback automático)');
      }
      
      // ✅ FALLBACK 2: Si no hay ningún logo, generar favicon SVG dinámico
      if (!faviconUrl && branding?.appName) {
        faviconUrl = this.generateDynamicFavicon(branding.appName, config);
        faviconSource = 'favicon SVG generado dinámicamente';
        logger.info('🎨 Generando favicon SVG dinámico para:', branding.appName);
      }
      
      // Si aún no hay URL, no hacer nada
      if (!faviconUrl) {
        logger.debug('⚪ No hay favicon, logo ni appName para generar favicon');
        return;
      }

      // ✅ MEJORA: Para logos usados como favicon, crear versión optimizada con fondo
      if (needsEnhancement && !faviconUrl.startsWith('data:')) {
        logger.info('🎨 Mejorando logo para usar como favicon (agregando fondo y padding)');
        this.createEnhancedFaviconFromLogo(faviconUrl, config);
      } else {
        // ✅ MÚLTIPLES TAMAÑOS DE FAVICON PARA MEJOR CALIDAD
        this.applyMultipleFaviconSizes(faviconUrl, faviconSource.includes('SVG generado'));
      }
      
      logger.info(`🎯 Favicon aplicado desde: ${faviconSource}`);
      logger.debug(`📎 Favicon URL: ${faviconUrl.substring(0, 50)}...`);

    } catch (error) {
      logger.error('Error aplicando favicon:', error);
    }
  }

  /**
   * Genera un favicon SVG dinámico mejorado basado en el nombre de la app
   * Ahora genera múltiples tamaños para mejor calidad
   */
  private static generateDynamicFavicon(appName: string, config: InterfaceConfig): string {
    try {
      // Obtener las iniciales del nombre de la app
      const initials = appName
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
      
      // Obtener colores de la configuración
      const primaryColor = config.theme?.colors?.primary?.['500'] || '#10B981';
      const primaryDark = config.theme?.colors?.primary?.['600'] || '#059669';
      const textColor = '#FFFFFF';
      
      // ✅ MEJORADO: Generar múltiples tamaños de favicon dinámico
      const sizes = [
        { size: 32, fontSize: 14, shadow: 0.5 },   // Pequeño
        { size: 64, fontSize: 28, shadow: 1 },     // Mediano (por defecto)
        { size: 128, fontSize: 56, shadow: 2 },    // Grande
        { size: 180, fontSize: 80, shadow: 2.5 }   // Apple Touch Icon
      ];
      
      sizes.forEach(({ size, fontSize, shadow }) => {
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <defs>
              <!-- Gradiente para dar profundidad -->
              <linearGradient id="bgGradient${size}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${primaryDark};stop-opacity:1" />
              </linearGradient>
              <!-- Sombra para el texto proporcional al tamaño -->
              <filter id="textShadow${size}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="${shadow}" stdDeviation="${shadow}" flood-color="rgba(0,0,0,0.35)"/>
              </filter>
              <!-- Borde sutil -->
              <filter id="border${size}" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="0" stdDeviation="${Math.max(0.5, size/128)}" flood-color="rgba(0,0,0,0.1)"/>
              </filter>
            </defs>
            
            <!-- Fondo con gradiente y bordes redondeados proporcionales -->
            <rect width="${size}" height="${size}" rx="${Math.max(8, size/8)}" fill="url(#bgGradient${size})" filter="url(#border${size})"/>
            
            <!-- Texto con sombra y tamaño proporcional -->
            <text x="${size/2}" y="${size/2 + fontSize*0.1}" 
                  font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
                  font-size="${fontSize}" 
                  font-weight="700" 
                  text-anchor="middle" 
                  fill="${textColor}"
                  filter="url(#textShadow${size})"
                  dominant-baseline="middle">
              ${initials}
            </text>
          </svg>
        `.trim();
        
        const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
        
        // Aplicar favicon con tamaño específico
        this.createFaviconLinkWithSize(dataUrl, size);
        
        logger.debug(`🎨 Favicon dinámico ${size}x${size} generado con iniciales: ${initials}`);
      });
      
      logger.info(`✨ Favicon dinámico multi-tamaño generado para "${appName}": ${initials} (${sizes.map(s => s.size).join(', ')}px)`);
      
      // Retornar el tamaño mediano como referencia
      const mediumSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
          <defs>
            <linearGradient id="bgGradient64" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${primaryDark};stop-opacity:1" />
            </linearGradient>
            <filter id="textShadow64" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.35)"/>
            </filter>
          </defs>
          <rect width="64" height="64" rx="8" fill="url(#bgGradient64)"/>
          <text x="32" y="35.8" 
                font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
                font-size="28" 
                font-weight="700" 
                text-anchor="middle" 
                fill="${textColor}"
                filter="url(#textShadow64)"
                dominant-baseline="middle">
            ${initials}
          </text>
        </svg>
      `.trim();
      
      return `data:image/svg+xml;base64,${btoa(mediumSvg)}`;
      
    } catch (error) {
      logger.error('Error generando favicon dinámico:', error);
      return '';
    }
  }

  /**
   * Aplica múltiples tamaños de favicon para mejor calidad en diferentes contextos
   */
  private static applyMultipleFaviconSizes(faviconUrl: string, isDynamicSVG: boolean): void {
    try {
      // Limpiar favicons existentes
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(favicon => favicon.remove());

      if (isDynamicSVG) {
        // Para SVG dinámico, crear múltiples versiones con diferentes tamaños
        this.createFaviconLink(faviconUrl, 'icon', 'image/svg+xml');
        this.createFaviconLink(faviconUrl, 'shortcut icon', 'image/svg+xml');
        
        // También crear versiones específicas para diferentes tamaños
        const sizes = ['16x16', '32x32', '48x48', '64x64', '128x128'];
        sizes.forEach(size => {
          this.createFaviconLink(faviconUrl, 'icon', 'image/svg+xml', size);
        });
        
      } else {
        // Para imágenes subidas (PNG, etc.) - optimizar para mejor visualización
        const type = this.getFaviconTypeFromUrl(faviconUrl);
        
        // ⭐ SOLUCIÓN: Favicon principal SIN atributo sizes
        // Esto permite que el navegador use el tamaño real de la imagen
        // y la escale según necesite (16x16, 32x32, etc.)
        this.createFaviconLink(faviconUrl, 'icon', type);          // Principal
        this.createFaviconLink(faviconUrl, 'shortcut icon', type); // Fallback
        
        logger.info(`✅ Favicon principal aplicado SIN restricción de tamaño (escalado automático por el navegador)`);
        
        // Versiones adicionales con tamaños específicos (algunos navegadores las prefieren)
        this.createFaviconLink(faviconUrl, 'icon', type, '16x16');
        this.createFaviconLink(faviconUrl, 'icon', type, '32x32');
        this.createFaviconLink(faviconUrl, 'icon', type, '48x48');
        
        // Apple Touch Icon para iOS (más grande)
        const appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        appleTouchIcon.href = faviconUrl;
        appleTouchIcon.setAttribute('sizes', '180x180');
        document.head.appendChild(appleTouchIcon);
      }

      logger.debug(`🎯 Múltiples favicons aplicados (SVG dinámico: ${isDynamicSVG})`);

    } catch (error) {
      logger.error('Error aplicando múltiples tamaños de favicon:', error);
    }
  }

  /**
   * Crea un elemento link para favicon
   */
  private static createFaviconLink(href: string, rel: string, type: string, sizes?: string): void {
    const link = document.createElement('link');
    link.rel = rel;
    link.type = type;
    link.href = href;
    
    if (sizes) {
      link.setAttribute('sizes', sizes);
    }
    
    document.head.appendChild(link);
  }

  /**
   * Determina el tipo MIME del favicon basado en la URL
   */
  private static getFaviconTypeFromUrl(url: string): string {
    if (url.includes('data:image/svg')) return 'image/svg+xml';
    if (url.includes('.png')) return 'image/png';
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'image/jpeg';
    if (url.includes('.gif')) return 'image/gif';
    return 'image/x-icon'; // Por defecto ICO
  }

  /**
   * Crea un favicon mejorado a partir de un logo, agregando fondo y padding
   * Esto hace que los logos sin fondo (transparentes) se vean mucho más grandes
   */
  private static createEnhancedFaviconFromLogo(logoUrl: string, config: InterfaceConfig): void {
    try {
      const primaryColor = config.theme?.colors?.primary?.['500'] || '#10B981';
      const primaryDark = config.theme?.colors?.primary?.['600'] || '#059669';
      
      // ✅ MEJORA: Tamaños optimizados para diferentes contextos del navegador
      // - Favicon en pestaña: 16x16 o 32x32 (el navegador escala automáticamente)
      // - El tamaño base debe ser grande para mantener calidad al escalar
      const sizes = [
        { size: 32, padding: 2 },   // Tamaño pequeño (pestañas, favoritos)
        { size: 64, padding: 3 },   // Tamaño mediano (general)
        { size: 128, padding: 6 },  // Tamaño grande (pantallas HiDPI)
        { size: 180, padding: 9 }   // Apple Touch Icon (iOS, macOS)
      ];
      
      // Crear SVG para cada tamaño con optimización específica
      sizes.forEach(({ size, padding }) => {
        const logoSize = size - (padding * 2);
        
        const enhancedSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <defs>
              <linearGradient id="faviconBg${size}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${primaryDark};stop-opacity:1" />
              </linearGradient>
              <!-- Sombra sutil para dar profundidad -->
              <filter id="logoShadow${size}">
                <feDropShadow dx="0" dy="${Math.max(1, size/64)}" stdDeviation="${Math.max(1, size/64)}" flood-color="rgba(0,0,0,0.25)"/>
              </filter>
            </defs>
            
            <!-- Fondo con gradiente y bordes redondeados proporcionales -->
            <rect width="${size}" height="${size}" rx="${Math.max(8, size/8)}" fill="url(#faviconBg${size})" />
            
            <!-- Logo centrado con padding mínimo para máxima visibilidad -->
            <image href="${logoUrl}" 
                   x="${padding}" y="${padding}" 
                   width="${logoSize}" height="${logoSize}" 
                   preserveAspectRatio="xMidYMid meet"
                   filter="url(#logoShadow${size})"
                   style="image-rendering: optimizeQuality;" />
          </svg>
        `.trim();
        
        const enhancedDataUrl = `data:image/svg+xml;base64,${btoa(enhancedSvg)}`;
        
        // Aplicar favicon con tamaño específico
        this.createFaviconLinkWithSize(enhancedDataUrl, size);
        
        logger.debug(`📐 Favicon ${size}x${size}: Logo ocupa ${logoSize}x${logoSize}px (${Math.round(logoSize/size*100)}%)`);
      });
      
      logger.info(`✨ Favicons multi-tamaño aplicados: ${sizes.map(s => s.size).join('x, ')}x para mejor calidad en todos los dispositivos`);
      
    } catch (error) {
      logger.error('Error creando favicon mejorado:', error);
      // Fallback: usar el logo original
      this.applyMultipleFaviconSizes(logoUrl, false);
    }
  }

  /**
   * Crea un favicon link con tamaño específico
   */
  private static createFaviconLinkWithSize(dataUrl: string, size: number): void {
    // Limpiar favicons existentes del mismo tamaño
    const existingFavicon = document.querySelector(`link[rel="icon"][sizes="${size}x${size}"]`);
    if (existingFavicon) {
      existingFavicon.remove();
    }
    
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = dataUrl;
    link.setAttribute('sizes', `${size}x${size}`);
    document.head.appendChild(link);
    
    // Para el tamaño más grande, también crear Apple Touch Icon
    if (size === 180) {
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = dataUrl;
      appleTouchIcon.setAttribute('sizes', `${size}x${size}`);
      document.head.appendChild(appleTouchIcon);
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