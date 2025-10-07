/**
 * Hook principal simplificado para la gestión de configuración de interfaz
 * Usa los servicios especializados para una arquitectura más limpia
 */

import { useReducer, useEffect, useCallback, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { InterfaceConfig, PresetConfig } from '../types';
import { ConfigStateService, ConfigState, ConfigAction } from '../services/configStateService';
import { ConfigComparisonService } from '../services/configComparisonService';
import { DOMConfigService } from '../services/domConfigService';
import { interfaceConfigService } from '../services/interfaceConfigService';
import { useAuthProfile } from '../../../hooks/useAuthProfile';
import { adaptUserProfileToUser } from '../../../shared/utils/userAdapter';
import { logger } from '../../../shared/utils/logger';

export interface UseInterfaceConfigReturn {
  // Estado
  config: InterfaceConfig;
  savedConfig: InterfaceConfig;
  presets: PresetConfig[];
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isGlobalAdmin: boolean;
  configSource: ConfigState['configSource'];
  
  // Acciones
  setConfig: (updates: Partial<InterfaceConfig> | InterfaceConfig) => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
  resetToDefault: () => void;
  forceApplyToDOM: () => void;
  
  // Utilidades
  hasUnsavedChanges: boolean;
  changesSummary: string;
  canModifyConfig: boolean;
  isReady: boolean;
}

/**
 * Hook principal para gestión de configuración de interfaz
 */
export function useInterfaceConfig(): UseInterfaceConfigReturn {
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { userProfile: profile, loading: profileLoading } = useAuthProfile();
  
  // Estado principal usando el servicio especializado
  const [state, dispatch] = useReducer(
    ConfigStateService.reducer,
    ConfigStateService.createInitialState()
  );
  
  // Control de inicialización para evitar llamadas múltiples
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Acciones del servicio
  const actions = ConfigStateService.createActions(dispatch);
  const selectors = ConfigStateService.createSelectors(state);

  /**
   * Cargar configuración inicial (solo una vez)
   */
  const loadInitialConfig = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (isInitializing || isInitialized) {
      return;
    }
    
    if (!authLoaded || profileLoading || !profile) {
      return;
    }

    setIsInitializing(true);

    try {
      actions.setLoading(true);
      actions.setError(null);
      
      logger.info('🔄 Cargando configuración inicial...');
      
      const user = adaptUserProfileToUser(profile);
      if (!user) {
        throw new Error('Usuario no válido');
      }
      
      // Asegurar que tenemos un token válido antes de proceder
      const token = await getToken();
      if (!token) {
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      const configResponse = await interfaceConfigService.getConfigForUser(user.clerk_id, getToken);
      
      if (configResponse) {
        logger.info(`✅ Configuración cargada desde: ${configResponse.source}`);
        
        // Actualizar estado contextual
        actions.setContextualData({
          isGlobalAdmin: configResponse.isGlobalAdmin,
          configSource: configResponse.source,
          contextualData: null
        });
        
        // Configurar la configuración (esto establece tanto config como savedConfig)
        actions.setConfig(configResponse.config);
        
        // Aplicar al DOM inmediatamente
        DOMConfigService.applyConfigToDOM(configResponse.config);
        
        // Marcar como inicializado exitosamente
        setIsInitialized(true);
        
      } else {
        throw new Error('No se pudo obtener configuración');
      }
      
    } catch (error) {
      logger.error('Error cargando configuración inicial:', error);
      actions.setError('Error cargando configuración');
      
      // Fallback: usar configuración por defecto
      const defaultConfig = ConfigStateService.createInitialState().config;
      actions.setConfig(defaultConfig);
      DOMConfigService.applyConfigToDOM(defaultConfig);
      
    } finally {
      actions.setLoading(false);
      setIsInitializing(false);
    }
  // Solo depender de authLoaded y profileLoading para evitar loops
  }, [authLoaded, profileLoading]);

  /**
   * Función inteligente para actualizar configuración
   */
  const setConfig = useCallback((updates: Partial<InterfaceConfig> | InterfaceConfig) => {
    logger.debug('🎯 setConfig llamado:', updates);
    
    // Si es una configuración completa (preset), reemplazar todo
    if ('theme' in updates && 'logos' in updates && 'branding' in updates) {
      actions.replaceConfig(updates as InterfaceConfig);
    } else {
      // Si son actualizaciones parciales, hacer merge
      actions.updateConfig(updates);
    }
  }, [actions]);

  /**
   * Guardar cambios
   */
  const saveChanges = useCallback(async () => {
    if (!profile) {
      throw new Error('Usuario no autenticado');
    }

    try {
      actions.setSaving(true);
      actions.setError(null);
      
      logger.info('💾 Guardando configuración...');
      
      const user = adaptUserProfileToUser(profile);
      if (!user) {
        throw new Error('Usuario no válido');
      }
      
      // Asegurar que tenemos un token válido antes de proceder
      const token = await getToken();
      if (!token) {
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      const savedConfig = await interfaceConfigService.saveConfigForUser(
        user.clerk_id, 
        state.config, 
        getToken
      );
      
      // Actualizar la configuración guardada
      actions.setSavedConfig(savedConfig);
      
      logger.info('✅ Configuración guardada exitosamente');
      
    } catch (error) {
      logger.error('Error guardando configuración:', error);
      actions.setError('Error guardando configuración');
      throw error;
    } finally {
      actions.setSaving(false);
    }
  }, [profile, state.config, getToken, actions]);

  /**
   * Aplicar configuración al DOM con debounce
   */
  useEffect(() => {
    if (!state.config) return;

    const timeoutId = setTimeout(() => {
      DOMConfigService.applyConfigToDOM(state.config);
    }, 150); // Debounce de 150ms

    return () => clearTimeout(timeoutId);
  }, [state.config]);

  /**
   * Forzar aplicación al DOM (sin debounce)
   */
  const forceApplyToDOM = useCallback(() => {
    if (state.config) {
      DOMConfigService.applyConfigToDOM(state.config);
      DOMConfigService.forceStyleRefresh();
    }
  }, [state.config]);

  /**
   * Cargar configuración inicial al montar
   */
  useEffect(() => {
    if (!isInitialized) {
      loadInitialConfig();
    }
  }, [loadInitialConfig, isInitialized]);

  // Retorno del hook
  return {
    // Estado
    config: state.config,
    savedConfig: state.savedConfig,
    presets: state.presets,
    loading: state.loading,
    error: state.error,
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    isGlobalAdmin: state.isGlobalAdmin,
    configSource: state.configSource,
    
    // Acciones
    setConfig,
    saveChanges,
    discardChanges: actions.discardChanges,
    resetToDefault: actions.resetToDefault,
    forceApplyToDOM,
    
    // Utilidades derivadas
    hasUnsavedChanges: selectors.hasUnsavedChanges,
    changesSummary: selectors.changesSummary,
    canModifyConfig: selectors.canModifyConfig,
    isReady: selectors.isReady,
  };
}