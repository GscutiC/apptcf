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
   * Ordena las propiedades y maneja valores undefined/null
   */
  private static normalize(config: InterfaceConfig): string {
    if (!config) return '';
    
    try {
      // Crear copia sin propiedades temporales que no afectan la persistencia
      const cleanConfig = { ...config };
      delete cleanConfig.updatedAt; // Timestamps no afectan igualdad funcional
      
      // Ordenar propiedades recursivamente para comparación consistente
      const sortedKeys = Object.keys(cleanConfig).sort();
      const normalizedConfig: any = {};
      
      for (const key of sortedKeys) {
        const value = (cleanConfig as any)[key];
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Ordenar objetos anidados recursivamente
            normalizedConfig[key] = JSON.parse(JSON.stringify(value, Object.keys(value).sort()));
          } else {
            normalizedConfig[key] = value;
          }
        }
      }
      
      return JSON.stringify(normalizedConfig);
    } catch (error) {
      logger.warn('Error normalizing config:', error);
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

      logger.debug('🔍 Config comparison:', comparison);
      
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
   */
  static hasUnsavedChanges(current: InterfaceConfig, saved: InterfaceConfig): boolean {
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