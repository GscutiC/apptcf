import React, { useEffect, useState } from 'react';
import { logger } from '../../../shared/utils/logger';

interface ConfigDiagnosticProps {
  children: React.ReactNode;
}

/**
 * 🆕 COMPONENTE DE DIAGNÓSTICO AUTOMÁTICO
 * Se monta al inicio de la aplicación y diagnostica/limpia configuración obsoleta
 */
export const ConfigDiagnosticWrapper: React.FC<ConfigDiagnosticProps> = ({ children }) => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [diagnosticComplete, setDiagnosticComplete] = useState(false);

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        logger.info('🔬 Iniciando diagnóstico automático de configuración...');
        
        // Verificar si hay configuración obsoleta
        const hasObsoleteConfig = checkForObsoleteConfiguration();
        
        if (hasObsoleteConfig) {
          logger.warn('🚨 Configuración obsoleta detectada, iniciando limpieza...');
          setIsCleaningUp(true);
          
          // Limpiar todo el localStorage relacionado con configuración
          await performAggressiveCleanup();
          
          // Esperar un momento y recargar
          setTimeout(() => {
            logger.info('🔄 Recargando aplicación con configuración limpia...');
            window.location.reload();
          }, 1500);
          
          return;
        }
        
        logger.info('✅ Diagnóstico completado: configuración es válida');
        setDiagnosticComplete(true);
        
      } catch (error) {
        logger.error('❌ Error durante diagnóstico:', error);
        setDiagnosticComplete(true);
      }
    };

    // Solo ejecutar una vez
    if (!diagnosticComplete && !isCleaningUp) {
      runDiagnostic();
    }
  }, [diagnosticComplete, isCleaningUp]);

  // Mostrar indicador de limpieza si es necesario
  if (isCleaningUp) {
    return (
      <div className="fixed inset-0 bg-blue-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Actualizando Configuración
          </h3>
          <p className="text-gray-600">
            Detectamos configuración obsoleta y la estamos actualizando. 
            La aplicación se recargará automáticamente.
          </p>
        </div>
      </div>
    );
  }

  // Renderizar children normalmente una vez completado el diagnóstico
  return <>{children}</>;
};

/**
 * Verificar si hay configuración obsoleta
 */
function checkForObsoleteConfiguration(): boolean {
  try {
    // Verificar localStorage
    const configKeys = [
      'interface-config',
      'config-cache',
      'user-preferences'
    ];

    for (const key of configKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          
          // Verificar por nombre de app obsoleto
          const appName = parsed.branding?.appName || parsed.appName;
          if (appName && isObsoleteName(appName)) {
            logger.warn(`🚨 Configuración obsoleta encontrada en ${key}: ${appName}`);
            return true;
          }
          
          // Verificar por tema obsoleto
          const themeName = parsed.theme?.name;
          if (themeName && isObsoleteTheme(themeName)) {
            logger.warn(`🚨 Tema obsoleto encontrado en ${key}: ${themeName}`);
            return true;
          }
          
        } catch (e) {
          logger.warn(`🚨 Cache corrupto encontrado: ${key}`);
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    logger.error('Error verificando configuración obsoleta:', error);
    return false;
  }
}

/**
 * Verificar si un nombre de app es obsoleto
 */
function isObsoleteName(name: string): boolean {
  const obsoleteNames = [
    'WorkTecApp',
    'Aplicación',
    'Sistema en Mantenimiento',
    'Sistema',
    'App',
    'WorkTec Solutions',
    'Mi App Completa'
  ];
  
  return obsoleteNames.some(obsolete => 
    name.toLowerCase().includes(obsolete.toLowerCase())
  );
}

/**
 * Verificar si un tema es obsoleto
 */
function isObsoleteTheme(theme: string): boolean {
  const obsoleteThemes = [
    'Tema Corporativo',
    'Tema por Defecto',
    'Configuración por Defecto',
    'Configuración de Emergencia'
  ];
  
  return obsoleteThemes.some(obsolete => 
    theme.toLowerCase().includes(obsolete.toLowerCase())
  );
}

/**
 * Realizar limpieza agresiva de localStorage
 */
async function performAggressiveCleanup(): Promise<void> {
  return new Promise((resolve) => {
    try {
      logger.info('🧽 Realizando limpieza agresiva de localStorage...');
      
      // Lista completa de claves a eliminar
      const keysToRemove = [
        'interface-config',
        'interface-config-timestamp',
        'config-cache',
        'user-preferences',
        'permissions-cache-timestamp',
        'user-permissions',
        'theme-config',
        'app-config',
        'cached-config',
        'ui-config'
      ];
      
      // Eliminar claves específicas
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          logger.debug(`🗑️ Eliminado: ${key}`);
        }
      });
      
      // Eliminar claves que coincidan con patrones obsoletos
      const allKeys = Object.keys(localStorage);
      const obsoletePatterns = [
        /worktec/i,
        /work-tec/i,
        /aplicacion/i,
        /obsolete/i,
        /old-config/i
      ];
      
      allKeys.forEach(key => {
        const shouldRemove = obsoletePatterns.some(pattern => pattern.test(key));
        if (shouldRemove) {
          localStorage.removeItem(key);
          logger.debug(`🗑️ Eliminado patrón obsoleto: ${key}`);
        }
      });
      
      logger.info('✅ Limpieza agresiva completada');
      
      // Pequeño delay para asegurar que se completó
      setTimeout(resolve, 500);
      
    } catch (error) {
      logger.error('❌ Error durante limpieza agresiva:', error);
      resolve();
    }
  });
}