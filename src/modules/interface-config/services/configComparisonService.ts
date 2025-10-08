/**
 * Servicio especializado para comparación y diff de configuraciones
 * Responsabilidad: Determinar si dos configuraciones son iguales y generar diffs
 */

import { InterfaceConfig } from '../types';
import { logger } from '../../../shared/utils/logger';

export interface ConfigComparison {
  areEqual: boolean;
  differences: string[];
  summary: {
    config1Hash: string;
    config2Hash: string;
    config1Id?: string;
    config2Id?: string;
  };
}

export class ConfigComparisonService {
  /**
   * Hace deep clone de una configuración para evitar referencias compartidas
   */
  static deepClone(config: InterfaceConfig): InterfaceConfig {
    try {
      return JSON.parse(JSON.stringify(config));
    } catch (error) {
      logger.warn('Error cloning config:', error);
      return { ...config };
    }
  }

  /**
   * Normaliza una configuración para comparación
   * REFACTORIZADO: Comparación más robusta sin referencias compartidas
   */
  private static normalize(config: InterfaceConfig): string {
    if (!config) return '';
    
    try {
      // 🔧 SOLUCIÓN: Hacer deep clone REAL antes de normalizar
      const deepClonedConfig = JSON.parse(JSON.stringify(config));
      
      // 🗑️ Remover propiedades temporales que no afectan persistencia
      delete deepClonedConfig.updatedAt;
      delete deepClonedConfig.id; // ID puede cambiar, no es relevante para comparación funcional
      
      // 🔄 Crear objeto normalizado con claves ordenadas recursivamente
      const normalizeObject = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(normalizeObject);
        
        const sorted: any = {};
        Object.keys(obj).sort().forEach(key => {
          sorted[key] = normalizeObject(obj[key]);
        });
        return sorted;
      };
      
      const normalized = normalizeObject(deepClonedConfig);
      const result = JSON.stringify(normalized);
      

      
      return result;
    } catch (error) {
      logger.warn('Error normalizing config:', error);
      // Fallback: comparación simple
      return JSON.stringify(config);
    }
  }

  /**
   * Compara dos configuraciones de manera robusta
   */
  static compare(config1: InterfaceConfig, config2: InterfaceConfig): ConfigComparison {
    try {
      const normalized1 = this.normalize(config1);
      const normalized2 = this.normalize(config2);
      
      const areEqual = normalized1 === normalized2;
      const differences = areEqual ? [] : this.findDifferences(config1, config2);
      
      const comparison: ConfigComparison = {
        areEqual,
        differences,
        summary: {
          config1Hash: this.generateHash(normalized1),
          config2Hash: this.generateHash(normalized2),
          config1Id: config1?.id,
          config2Id: config2?.id,
        }
      };


      
      logger.debug('🔍 [ConfigComparison] Comparing configs:', {
        areEqual,
        differencesCount: differences.length,
        differences: differences,
        config1Logos: {
          mainLogo: config1.logos?.mainLogo?.imageUrl?.substring(0, 50),
          mainLogoFileId: config1.logos?.mainLogo?.fileId,
          mainLogoText: config1.logos?.mainLogo?.text
        },
        config2Logos: {
          mainLogo: config2.logos?.mainLogo?.imageUrl?.substring(0, 50),
          mainLogoFileId: config2.logos?.mainLogo?.fileId,
          mainLogoText: config2.logos?.mainLogo?.text
        }
      });
      
      return comparison;
    } catch (error) {
      logger.error('Error comparing configs:', error);
      return {
        areEqual: false,
        differences: ['Error during comparison'],
        summary: {
          config1Hash: 'error',
          config2Hash: 'error',
          config1Id: config1?.id,
          config2Id: config2?.id,
        }
      };
    }
  }

  /**
   * Encuentra diferencias específicas entre configuraciones
   */
  private static findDifferences(config1: InterfaceConfig, config2: InterfaceConfig): string[] {
    const differences: string[] = [];
    
    try {
      // Comparar propiedades principales
      if (config1.branding?.appName !== config2.branding?.appName) {
        differences.push(`branding.appName: "${config1.branding?.appName}" → "${config2.branding?.appName}"`);
      }
      
      if (config1.branding?.appDescription !== config2.branding?.appDescription) {
        differences.push(`branding.appDescription: changed`);
      }
      
      if (config1.theme?.name !== config2.theme?.name) {
        differences.push(`theme.name: "${config1.theme?.name}" → "${config2.theme?.name}"`);
      }

      // Comparar colores primarios
      const primary1 = config1.theme?.colors?.primary?.['500'];
      const primary2 = config2.theme?.colors?.primary?.['500'];
      if (primary1 !== primary2) {
        differences.push(`theme.colors.primary.500: "${primary1}" → "${primary2}"`);
      }

      // Comparar logos
      // Main Logo
      if (config1.logos?.mainLogo?.imageUrl !== config2.logos?.mainLogo?.imageUrl) {
        differences.push(`logos.mainLogo.imageUrl: changed`);
      }
      if (config1.logos?.mainLogo?.fileId !== config2.logos?.mainLogo?.fileId) {
        differences.push(`logos.mainLogo.fileId: changed`);
      }
      if (config1.logos?.mainLogo?.text !== config2.logos?.mainLogo?.text) {
        differences.push(`logos.mainLogo.text: "${config1.logos?.mainLogo?.text}" → "${config2.logos?.mainLogo?.text}"`);
      }
      if (config1.logos?.mainLogo?.showText !== config2.logos?.mainLogo?.showText) {
        differences.push(`logos.mainLogo.showText: ${config1.logos?.mainLogo?.showText} → ${config2.logos?.mainLogo?.showText}`);
      }
      if (config1.logos?.mainLogo?.showImage !== config2.logos?.mainLogo?.showImage) {
        differences.push(`logos.mainLogo.showImage: ${config1.logos?.mainLogo?.showImage} → ${config2.logos?.mainLogo?.showImage}`);
      }

      // Sidebar Logo
      if (config1.logos?.sidebarLogo?.imageUrl !== config2.logos?.sidebarLogo?.imageUrl) {
        differences.push(`logos.sidebarLogo.imageUrl: changed`);
      }
      if (config1.logos?.sidebarLogo?.fileId !== config2.logos?.sidebarLogo?.fileId) {
        differences.push(`logos.sidebarLogo.fileId: changed`);
      }
      if (config1.logos?.sidebarLogo?.text !== config2.logos?.sidebarLogo?.text) {
        differences.push(`logos.sidebarLogo.text: changed`);
      }
      if (config1.logos?.sidebarLogo?.showText !== config2.logos?.sidebarLogo?.showText) {
        differences.push(`logos.sidebarLogo.showText: ${config1.logos?.sidebarLogo?.showText} → ${config2.logos?.sidebarLogo?.showText}`);
      }
      if (config1.logos?.sidebarLogo?.showImage !== config2.logos?.sidebarLogo?.showImage) {
        differences.push(`logos.sidebarLogo.showImage: ${config1.logos?.sidebarLogo?.showImage} → ${config2.logos?.sidebarLogo?.showImage}`);
      }

      // Favicon
      if (config1.logos?.favicon?.imageUrl !== config2.logos?.favicon?.imageUrl) {
        differences.push(`logos.favicon.imageUrl: changed`);
      }
      if (config1.logos?.favicon?.fileId !== config2.logos?.favicon?.fileId) {
        differences.push(`logos.favicon.fileId: changed`);
      }
      
      // Agregar más comparaciones específicas según necesidades
      
    } catch (error) {
      logger.warn('Error finding differences:', error);
      differences.push('Unable to determine specific differences');
    }
    
    return differences;
  }

  /**
   * Genera un hash corto para identificación rápida
   */
  private static generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  /**
   * Verifica si una configuración tiene cambios pendientes
   * REFACTORIZADO: Comparación más directa para casos específicos
   */
  static hasUnsavedChanges(current: InterfaceConfig, saved: InterfaceConfig): boolean {
    // Verificación rápida: Si las referencias son iguales, no hay cambios
    if (current === saved) {
      return false;
    }
    
    // Verificación directa de campos críticos antes de comparación completa (más eficiente)
    const hasLogoChanges = (
      current.logos?.mainLogo?.text !== saved.logos?.mainLogo?.text ||
      current.logos?.mainLogo?.imageUrl !== saved.logos?.mainLogo?.imageUrl ||
      current.logos?.mainLogo?.fileId !== saved.logos?.mainLogo?.fileId ||
      current.logos?.mainLogo?.showText !== saved.logos?.mainLogo?.showText ||
      current.logos?.mainLogo?.showImage !== saved.logos?.mainLogo?.showImage ||
      current.logos?.sidebarLogo?.text !== saved.logos?.sidebarLogo?.text ||
      current.logos?.sidebarLogo?.imageUrl !== saved.logos?.sidebarLogo?.imageUrl ||
      current.logos?.sidebarLogo?.collapsedText !== saved.logos?.sidebarLogo?.collapsedText ||
      current.logos?.sidebarLogo?.showText !== saved.logos?.sidebarLogo?.showText ||
      current.logos?.sidebarLogo?.showImage !== saved.logos?.sidebarLogo?.showImage ||
      current.logos?.favicon?.imageUrl !== saved.logos?.favicon?.imageUrl ||
      current.logos?.favicon?.fileId !== saved.logos?.favicon?.fileId
    );
    
    // Si hay cambios en logos, retornar inmediatamente (optimización)
    if (hasLogoChanges) {
      return true;
    }
    
    // Verificación completa como respaldo para otros campos
    const comparison = this.compare(current, saved);
    return !comparison.areEqual;
  }

  /**
   * Genera un resumen de cambios para mostrar al usuario
   */
  static getChangesSummary(current: InterfaceConfig, saved: InterfaceConfig): string {
    const comparison = this.compare(current, saved);
    
    if (comparison.areEqual) {
      return 'Sin cambios pendientes';
    }
    
    const changeCount = comparison.differences.length;
    return `${changeCount} cambio${changeCount !== 1 ? 's' : ''} pendiente${changeCount !== 1 ? 's' : ''}`;
  }
}