/**
 * ConfigLoader Optimizado - No Bloqueante
 * Versión mejorada que permite renderizar la app mientras carga la configuración
 */

import React, { useEffect, useState } from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';

interface OptimizedConfigLoaderProps {
  children: React.ReactNode;
  timeout?: number; // Timeout en ms para forzar renderizado
}

export const OptimizedConfigLoader: React.FC<OptimizedConfigLoaderProps> = ({ 
  children,
  timeout = 1000 // Reducido de 3000 a 1000ms
}) => {
  const { config, loading, error } = useInterfaceConfig();
  const [shouldRender, setShouldRender] = useState(false);

  // ============================================
  // ESTRATEGIA NO BLOQUEANTE
  // ============================================
  // Renderiza INMEDIATAMENTE después de timeout o cuando la config esté lista
  
  useEffect(() => {
    // Asegurar que el body sea visible desde el inicio
    document.body.classList.add('config-loaded');
    
    // Timer para forzar renderizado si la config tarda
    const timeoutTimer = setTimeout(() => {
      setShouldRender(true);
    }, timeout);

    // Si la config ya está disponible, renderizar inmediatamente
    if (!loading || config) {
      setShouldRender(true);
      clearTimeout(timeoutTimer);
    }

    return () => clearTimeout(timeoutTimer);
  }, [loading, config, timeout]);

  // ============================================
  // APLICAR CONFIGURACIÓN EN PARALELO
  // ============================================
  // Aplica estilos y configuración sin bloquear el renderizado
  
  useEffect(() => {
    if (!config) return;

    const root = document.documentElement;
    
    // Aplicar variables CSS (no bloqueante)
    requestAnimationFrame(() => {
      if (config.theme?.colors) {
        const { primary, neutral } = config.theme.colors;
        
        if (primary) {
          root.style.setProperty('--color-primary-500', primary[500] || '#3b82f6');
          root.style.setProperty('--color-primary-600', primary[600] || '#2563eb');
          root.style.setProperty('--color-primary-700', primary[700] || '#1d4ed8');
        }
        
        if (neutral) {
          root.style.setProperty('--color-neutral-50', neutral[50] || '#f9fafb');
          root.style.setProperty('--color-neutral-800', neutral[800] || '#1f2937');
          root.style.setProperty('--color-neutral-900', neutral[900] || '#111827');
        }
      }
      
      // Aplicar título
      if (config.branding?.appName) {
        document.title = config.branding.appName;
      }
    });
  }, [config]);

  // ============================================
  // MANEJO DE ERRORES
  // ============================================
  // En caso de error, muestra advertencia pero NO bloquea la app
  
  if (error && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Error al cargar configuración, usando valores por defecto:', error);
  }

  // ============================================
  // RENDERIZADO PROGRESIVO
  // ============================================
  
  if (!shouldRender) {
    // Mini loader mientras esperamos
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Preparando aplicación...</p>
        </div>
      </div>
    );
  }

  // Renderizar app inmediatamente
  return <>{children}</>;
};

export default OptimizedConfigLoader;
