/**
 * ConfigLoader Optimizado - Versi\u00f3n 2.0
 * Usa precarga desde index.html para eliminar parpadeo
 */

import React, { useEffect, useState } from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';

interface OptimizedConfigLoaderProps {
  children: React.ReactNode;
  timeout?: number;
}

export const OptimizedConfigLoader: React.FC<OptimizedConfigLoaderProps> = ({ 
  children,
  timeout = 500 // Reducido porque la precarga hace esto casi instant\u00e1neo
}) => {
  const { config, loading, error } = useInterfaceConfig();
  const [shouldRender, setShouldRender] = useState(false);

  // Detectar config precargada y renderizar INMEDIATAMENTE
  useEffect(() => {
    document.body.classList.add('config-loaded');
    
    // @ts-ignore
    const hasPreloaded = window.__INITIAL_CONFIG__ !== undefined;
    
    if (hasPreloaded || config || !loading) {
      setShouldRender(true);
      return;
    }
    
    const timer = setTimeout(() => setShouldRender(true), timeout);
    return () => clearTimeout(timer);
  }, [loading, config, timeout]);

  // Aplicar estilos si config cambia
  useEffect(() => {
    if (!config) return;

    requestAnimationFrame(() => {
      const root = document.documentElement;
      
      if (config.theme?.colors?.primary) {
        Object.entries(config.theme.colors.primary).forEach(([shade, color]) => {
          root.style.setProperty(`--color-primary-${shade}`, color);
        });
      }
      
      if (config.branding?.appName) {
        document.title = config.branding.appName;
      }
    });
  }, [config]);

  if (error && process.env.NODE_ENV === 'development') {
    console.warn('\u26a0\ufe0f Error al cargar configuraci\u00f3n:', error);
  }

  if (!shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-neutral-50, transparent)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: 'var(--color-primary-600, #3b82f6)' }}></div>
          <p className="text-sm" style={{ color: 'var(--color-neutral-500, #6b7280)' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OptimizedConfigLoader;
