/**
 * Hook personalizado para gestionar la configuración visual del módulo Techo Propio
 * Proporciona acceso fácil a la configuración y métodos para modificarla
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { TechoPropioConfig, DEFAULT_CONFIG } from '../types/config.types';
import { techoPropioConfigService } from '../services/techoPropioConfigService';
import { applyConfigToDOM, removeConfigFromDOM } from '../utils/domApplier';

/**
 * Resultado del hook
 */
export interface UseTechoPropioConfigResult {
  config: TechoPropioConfig | null;
  loading: boolean;
  error: string | null;
  isCustomized: boolean;
  saveConfig: (newConfig: Partial<TechoPropioConfig>) => Promise<{ success: boolean; error?: string }>;
  resetConfig: () => Promise<{ success: boolean; error?: string }>;
  reloadConfig: () => Promise<void>;
}

/**
 * Hook para gestionar la configuración visual del módulo Techo Propio
 *
 * @example
 * ```tsx
 * const { config, loading, saveConfig, resetConfig } = useTechoPropioConfig();
 *
 * // Cambiar colores
 * await saveConfig({
 *   colors: { primary: '#16A34A', secondary: '#2563EB', accent: '#DC2626' }
 * });
 *
 * // Reset a default
 * await resetConfig();
 * ```
 */
export function useTechoPropioConfig(): UseTechoPropioConfigResult {
  const { getToken, isSignedIn } = useAuth();
  const [config, setConfig] = useState<TechoPropioConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCustomized, setIsCustomized] = useState<boolean>(false);

  /**
   * Cargar configuración del usuario actual
   */
  const loadConfig = useCallback(async () => {
    if (!isSignedIn) {
      // Usuario no autenticado - usar config por defecto
      setConfig(DEFAULT_CONFIG);
      setIsCustomized(false);
      applyConfigToDOM(DEFAULT_CONFIG);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Configurar el servicio con el token getter
      techoPropioConfigService.setTokenGetter(getToken);

      // Obtener configuración del backend
      const userConfig = await techoPropioConfigService.getMyConfig();

      if (userConfig && userConfig.id) {
        // Usuario tiene configuración personalizada
        setConfig(userConfig);
        setIsCustomized(true);
        applyConfigToDOM(userConfig);
      } else {
        // Usuario no tiene configuración, usar default
        setConfig(DEFAULT_CONFIG);
        setIsCustomized(false);
        applyConfigToDOM(DEFAULT_CONFIG);
      }
    } catch (err: any) {
      console.error('❌ Error cargando configuración:', err);
      setError(err.message || 'Error al cargar configuración');

      // Fallback a configuración por defecto en caso de error
      setConfig(DEFAULT_CONFIG);
      setIsCustomized(false);
      applyConfigToDOM(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  /**
   * Guardar/actualizar configuración
   */
  const saveConfig = useCallback(async (
    newConfig: Partial<TechoPropioConfig>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSignedIn) {
      return {
        success: false,
        error: 'Debes iniciar sesión para guardar la configuración'
      };
    }

    try {
      setLoading(true);
      setError(null);

      // Configurar servicio
      techoPropioConfigService.setTokenGetter(getToken);

      // Merge con configuración actual
      const updatedConfig = {
        colors: newConfig.colors || config?.colors || DEFAULT_CONFIG.colors,
        logos: newConfig.logos || config?.logos || DEFAULT_CONFIG.logos,
        branding: newConfig.branding || config?.branding || DEFAULT_CONFIG.branding
      };

      // Guardar en backend
      const savedConfig = await techoPropioConfigService.saveMyConfig(updatedConfig);

      // Actualizar estado local
      setConfig(savedConfig);
      setIsCustomized(true);

      // Aplicar al DOM
      applyConfigToDOM(savedConfig);

      console.log('✅ Configuración guardada exitosamente');
      return { success: true };
    } catch (err: any) {
      console.error('❌ Error guardando configuración:', err);
      const errorMessage = err.error || err.message || 'Error al guardar configuración';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [config, getToken, isSignedIn]);

  /**
   * Reset configuración a default (eliminar personalización)
   */
  const resetConfig = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSignedIn) {
      return {
        success: false,
        error: 'Debes iniciar sesión para resetear la configuración'
      };
    }

    try {
      setLoading(true);
      setError(null);

      // Configurar servicio
      techoPropioConfigService.setTokenGetter(getToken);

      // Eliminar configuración del backend
      await techoPropioConfigService.deleteMyConfig();

      // Volver a default
      setConfig(DEFAULT_CONFIG);
      setIsCustomized(false);

      // Aplicar default al DOM
      applyConfigToDOM(DEFAULT_CONFIG);

      console.log('✅ Configuración reseteada a default');
      return { success: true };
    } catch (err: any) {
      console.error('❌ Error reseteando configuración:', err);
      const errorMessage = err.error || err.message || 'Error al resetear configuración';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  /**
   * Recargar configuración desde el servidor
   */
  const reloadConfig = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Limpiar configuración al desmontar
  useEffect(() => {
    return () => {
      // No limpiar el DOM aquí porque otros componentes pueden estar usándolo
      // removeConfigFromDOM();
    };
  }, []);

  return {
    config,
    loading,
    error,
    isCustomized,
    saveConfig,
    resetConfig,
    reloadConfig
  };
}
