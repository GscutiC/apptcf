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
  const { config, loading, error } = useInterfaceConfig();
  const [isReady, setIsReady] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  // CRÍTICO: Asegurar que el body sea visible inmediatamente
  useEffect(() => {
    // Añadir la clase config-loaded inmediatamente para evitar pantalla en blanco
    document.body.classList.add('config-loaded');
  }, []);

  useEffect(() => {
    // Aplicar configuración inmediatamente cuando esté disponible
    if (config && !loading) {
      // Aplicar título y branding INMEDIATAMENTE (sin delay)
      if (config.branding?.appName) {
        document.title = config.branding.appName;
      }
      
      // Marcar como listo después de un pequeño delay para el resto del DOM
      const timer = setTimeout(() => {
        setIsReady(true);
        document.body.classList.add('config-loaded');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [config, loading]);

  // Timeout de seguridad: si después de 3 segundos no se ha cargado, forzar mostrar
  useEffect(() => {
    const timeoutTimer = setTimeout(() => {
      // Forzar renderizado después del timeout
      setForceShow(true);
      setIsReady(true);
    }, 3000);

    // Si ya está listo, cancelar el timeout
    if (isReady || !loading) {
      clearTimeout(timeoutTimer);
    }

    return () => clearTimeout(timeoutTimer);
  }, [isReady, loading]);

  // Aplicar configuración básica mientras carga
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar variables CSS básicas inmediatamente
    if (config?.theme?.colors) {
      root.style.setProperty('--color-primary-500', config.theme.colors.primary?.[500] || '#3b82f6');
      root.style.setProperty('--color-primary-600', config.theme.colors.primary?.[600] || '#2563eb');
      root.style.setProperty('--color-neutral-50', config.theme.colors.neutral?.[50] || '#f9fafb');
      root.style.setProperty('--color-neutral-800', config.theme.colors.neutral?.[800] || '#1f2937');
    }
    
    // Aplicar título inmediatamente
    if (config?.branding?.appName) {
      document.title = config.branding.appName;
    }
  }, [config]);

  // Si hay error, mostrar el contenido de todas formas con configuración por defecto
  if (error) {
    console.error('ConfigLoader: Error en configuración, usando por defecto:', error);
  }

  if ((loading || !isReady) && !forceShow) {
    return showLoader ? (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
          {error && (
            <p className="text-red-600 text-sm mt-2">
              Error en configuración, cargando por defecto...
            </p>
          )}
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