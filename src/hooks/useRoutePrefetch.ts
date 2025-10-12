/**
 * Hook de prefetching para rutas de React Router
 * Pre-carga componentes lazy cuando el usuario hace hover
 */

import React, { useEffect, useRef } from 'react';

type PreloadableComponent = {
  preload?: () => Promise<any>;
};

/**
 * Hook para prefetchear una ruta cuando se hace hover
 * @param importFn - Función de import dinámica
 * @returns Handlers de eventos para aplicar al elemento
 */
export const useRoutePrefetch = (importFn: () => Promise<any>) => {
  const prefetchedRef = useRef(false);

  const prefetch = () => {
    if (!prefetchedRef.current) {
      prefetchedRef.current = true;
      importFn().catch((error) => {
        console.warn('Prefetch failed:', error);
        prefetchedRef.current = false; // Permitir reintentar
      });
    }
  };

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
};

/**
 * Prefetchea múltiples rutas críticas al inicio
 * @param routes - Array de funciones de import
 */
export const prefetchCriticalRoutes = (routes: Array<() => Promise<any>>) => {
  // Esperar a que la app esté idle antes de prefetchear
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routes.forEach((route) => {
        route().catch((error) => {
          console.warn('Critical route prefetch failed:', error);
        });
      });
    });
  } else {
    // Fallback para navegadores sin requestIdleCallback
    setTimeout(() => {
      routes.forEach((route) => {
        route().catch((error) => {
          console.warn('Critical route prefetch failed:', error);
        });
      });
    }, 1000);
  }
};

/**
 * Hook para prefetchear rutas críticas al montar el componente
 * @param routes - Array de funciones de import a prefetchear
 */
export const usePrefetchCriticalRoutes = (routes: Array<() => Promise<any>>) => {
  useEffect(() => {
    prefetchCriticalRoutes(routes);
  }, []); // Solo ejecutar una vez al montar
};

/**
 * Crea un componente lazy con prefetch manual
 * @param importFn - Función de import dinámica
 * @returns Componente lazy con método preload
 */
export const lazyWithPreload = (importFn: () => Promise<any>) => {
  const Component = React.lazy(importFn) as any;
  Component.preload = importFn;
  return Component;
};

export default useRoutePrefetch;
