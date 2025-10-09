/**
 * Configuración de React Query Client
 * Optimizado para trabajar con el backend cache (TTL: 5 minutos)
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente de React Query configurado con:
 * - staleTime: 5 minutos (alineado con backend cache)
 * - cacheTime: 10 minutos (mantiene datos en memoria)
 * - Retry limitado para evitar sobrecarga
 * - Refetch deshabilitado para reducir llamadas innecesarias
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo antes de considerar datos como obsoletos
      // Alineado con el backend cache (300 segundos)
      staleTime: 5 * 60 * 1000, // 5 minutos

      // Tiempo que los datos permanecen en cache después de no usarse
      gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime en v4)

      // Optimizaciones para reducir refetch innecesarios
      refetchOnWindowFocus: false,  // No refetch al cambiar de pestaña
      refetchOnMount: false,        // No refetch al montar si hay cache válido
      refetchOnReconnect: false,    // No refetch al reconectar internet

      // Estrategia de reintentos
      retry: 1,                     // Solo 1 reintento en caso de fallo
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Configuración de red
      networkMode: 'online',        // Solo hacer requests cuando hay conexión
    },
    mutations: {
      // Configuración para mutaciones (create, update, delete)
      retry: 0,                     // No reintentar mutaciones fallidas
      networkMode: 'online',
    },
  },
});

/**
 * Configuración específica para consultas de larga duración
 * Usar para datos que cambian muy raramente (ej: configuraciones del sistema)
 */
export const longCacheOptions = {
  staleTime: 15 * 60 * 1000,  // 15 minutos
  gcTime: 30 * 60 * 1000,     // 30 minutos
};

/**
 * Configuración para datos que cambian frecuentemente
 * Usar para datos en tiempo real (ej: notificaciones)
 */
export const shortCacheOptions = {
  staleTime: 1 * 60 * 1000,   // 1 minuto
  gcTime: 5 * 60 * 1000,      // 5 minutos
  refetchInterval: 60 * 1000, // Refetch cada 60 segundos
};
