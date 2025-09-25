/**
 * Componente para prevenir FOUC (Flash of Unstyled Content)
 * y asegurar que la configuración se aplique antes del renderizado
 */

import React, { useEffect, useState } from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';

interface ConfigLoaderProps {
  children: React.ReactNode;
  showLoader?: boolean;
}

export const ConfigLoader: React.FC<ConfigLoaderProps> = ({ 
  children, 
  showLoader = true 
}) => {
  const { config, loading } = useInterfaceConfig();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Aplicar configuración inmediatamente
    if (config && !loading) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        setIsReady(true);
        // Remover la clase que previene FOUC
        document.body.classList.add('config-loaded');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [config, loading]);

  // Aplicar configuración básica mientras carga
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar variables CSS básicas inmediatamente
    if (config?.theme?.colors) {
      root.style.setProperty('--color-primary-500', config.theme.colors.primary[500] || '#3b82f6');
      root.style.setProperty('--color-primary-600', config.theme.colors.primary[600] || '#2563eb');
      root.style.setProperty('--color-neutral-50', config.theme.colors.neutral[50] || '#f9fafb');
      root.style.setProperty('--color-neutral-800', config.theme.colors.neutral[800] || '#1f2937');
    }
    
    // Aplicar título inmediatamente
    if (config?.branding?.appName) {
      document.title = config.branding.appName;
    }
  }, [config]);

  if (loading || !isReady) {
    return showLoader ? (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando configuración...</p>
        </div>
      </div>
    ) : (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};