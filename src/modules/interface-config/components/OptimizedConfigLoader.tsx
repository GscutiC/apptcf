/**
 * ConfigLoader Optimizado - Sin Bloqueo
 * OPTIMIZADO: Renderiza inmediatamente y aplica config en paralelo
 * No causa re-renders innecesarios
 */

import React, { useEffect } from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';

interface OptimizedConfigLoaderProps {
  children: React.ReactNode;
  timeout?: number; // Deprecado - mantenido por compatibilidad
}

export const OptimizedConfigLoader: React.FC<OptimizedConfigLoaderProps> = ({
  children
}) => {
  const { config, error } = useInterfaceConfig();

  // ============================================
  // ASEGURAR VISIBILIDAD DEL BODY
  // ============================================
  useEffect(() => {
    // Asegurar que el body sea visible desde el inicio
    document.body.classList.add('config-loaded');
  }, []);

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
  // RENDERIZADO INMEDIATO
  // ============================================
  // Renderiza inmediatamente sin esperar config
  // La config se aplicará cuando esté disponible

  return <>{children}</>;
};

export default OptimizedConfigLoader;
