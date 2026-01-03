/**
 * Hook principal simplificado para la gestion de configuracion de interfaz
 * Usa los servicios especializados para una arquitectura mas limpia
 * 
 * REFACTORIZADO: Usa dynamicConfigService en lugar de configuraciones hardcodeadas
 * CORREGIDO: No bloquea cuando profile no esta disponible
 */

import { useReducer, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { InterfaceConfig, PresetConfig } from '../types';
import { ConfigStateService, ConfigState, ConfigAction } from '../services/configStateService';
import { ConfigComparisonService } from '../services/configComparisonService';
import { DOMConfigService } from '../services/domConfigService';
import { interfaceConfigService } from '../services/interfaceConfigService';
import { dynamicConfigService } from '../services/dynamicConfigService';
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
 * Hook principal para gestion de configuracion de interfaz
 */
export function useInterfaceConfig(): UseInterfaceConfigReturn {
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { userProfile: profile, loading: profileLoading } = useAuthProfile();
  
  // Estado principal usando el servicio especializado
  const [state, dispatch] = useReducer(
    ConfigStateService.reducer,
    ConfigStateService.createInitialState()
  );
  
  // Control de inicializacion para evitar llamadas multiples
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const timeoutTriggeredRef = useRef(false);
  
  // Acciones del servicio (memoizadas para mantener referencia estable)
  const actions = useMemo(() => 
    ConfigStateService.createActions(dispatch), 
    [dispatch]
  );
  
  const selectors = ConfigStateService.createSelectors(state);

  /**
   * Cargar configuracion con timeout de emergencia
   * Si profile no llega en 3 segundos, carga config de emergencia
   */
  useEffect(() => {
    if (isInitialized || !authLoaded) return;
    
    const timeout = setTimeout(() => {
      if (!isInitialized && !timeoutTriggeredRef.current) {
        timeoutTriggeredRef.current = true;
        logger.warn('Timeout: cargando config de emergencia...');
        
        const emergencyConfig = dynamicConfigService.getEmergencyConfig();
        actions.setConfig(emergencyConfig);
        DOMConfigService.applyConfigToDOM(emergencyConfig);
        actions.setLoading(false);
        setIsInitialized(true);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [authLoaded, isInitialized, actions]);

  /**
   * Cargar configuracion inicial (solo una vez)
   */
  const loadInitialConfig = useCallback(async () => {
    // Evitar multiples llamadas simultaneas
    if (isInitializing || isInitialized || timeoutTriggeredRef.current) {
      return;
    }
    
    // Esperar a que auth este listo
    if (!authLoaded) {
      return;
    }
    
    // Si profile sigue cargando, esperar un poco mas
    if (profileLoading) {
      return;
    }

    setIsInitializing(true);

    try {
      actions.setLoading(true);
      actions.setError(null);
      
      logger.info('Cargando configuracion inicial...');
      
      // Si no hay perfil, intentar cargar config directamente con token
      if (!profile) {
        logger.warn('Perfil no disponible, cargando config con token...');
        
        try {
          const token = await getToken();
          if (token) {
            const fallbackConfig = await dynamicConfigService.getCurrentConfig(getToken);
            if (fallbackConfig) {
              actions.setConfig(fallbackConfig);
              DOMConfigService.applyConfigToDOM(fallbackConfig);
              setIsInitialized(true);
              logger.info('Configuracion cargada sin perfil');
              return;
            }
          }
        } catch (e) {
          logger.warn('Error cargando config sin perfil:', e);
        }
        
        // Usar config de emergencia si todo falla
        const emergencyConfig = dynamicConfigService.getEmergencyConfig();
        actions.setConfig(emergencyConfig);
        DOMConfigService.applyConfigToDOM(emergencyConfig);
        setIsInitialized(true);
        logger.warn('Usando configuracion de emergencia');
        return;
      }
      
      const user = adaptUserProfileToUser(profile);
      if (!user) {
        throw new Error('Usuario no valido');
      }
      
      // Asegurar que tenemos un token valido antes de proceder
      const token = await getToken();
      if (!token) {
        throw new Error('No se pudo obtener token de autenticacion');
      }
      
      const configResponse = await interfaceConfigService.getConfigForUser(user.clerk_id, getToken);
      
      if (configResponse) {
        logger.info(`Configuracion cargada desde: ${configResponse.source}`);
        
        // Actualizar estado contextual
        actions.setContextualData({
          isGlobalAdmin: configResponse.isGlobalAdmin,
          configSource: configResponse.source,
          contextualData: null
        });
        
        // Configurar la configuracion (esto establece tanto config como savedConfig)
        actions.setConfig(configResponse.config);
        
        // Cargar presets en paralelo
        dynamicConfigService.getPresets(getToken).then(presets => {
          actions.setPresets(presets);
          logger.info(`Presets cargados: ${presets.length}`);
        }).catch(error => {
          logger.error('Error cargando presets:', error);
          actions.setPresets([]);
        });
        
        // Aplicar al DOM inmediatamente
        DOMConfigService.applyConfigToDOM(configResponse.config);
        
        // Marcar como inicializado exitosamente
        setIsInitialized(true);
        
      } else {
        throw new Error('No se pudo obtener configuracion');
      }
      
    } catch (error) {
      logger.error('Error cargando configuracion inicial:', error);
      actions.setError('Error cargando configuracion');
      
      // Fallback: intentar cargar desde dynamicConfigService nuevamente
      try {
        const fallbackConfig = await dynamicConfigService.getCurrentConfig(getToken);
        actions.setConfig(fallbackConfig);
        DOMConfigService.applyConfigToDOM(fallbackConfig);
        setIsInitialized(true);
        logger.info('Configuracion cargada despues de reintentar');
      } catch (fallbackError) {
        // Ultimo recurso: configuracion de emergencia
        const emergencyConfig = dynamicConfigService.getEmergencyConfig();
        actions.setConfig(emergencyConfig);
        DOMConfigService.applyConfigToDOM(emergencyConfig);
        setIsInitialized(true);
        logger.warn('Usando configuracion de emergencia');
      }
      
    } finally {
      actions.setLoading(false);
      setIsInitializing(false);
    }
  }, [authLoaded, profileLoading, profile, getToken, actions]);

  /**
   * Funcion inteligente para actualizar configuracion
   */
  const setConfig = useCallback((updates: Partial<InterfaceConfig> | InterfaceConfig) => {
    // Si es una configuracion completa (preset), reemplazar todo
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
      
      logger.info('Guardando configuracion...');
      
      const user = adaptUserProfileToUser(profile);
      if (!user) {
        throw new Error('Usuario no valido');
      }
      
      // Asegurar que tenemos un token valido antes de proceder
      const token = await getToken();
      if (!token) {
        throw new Error('No se pudo obtener token de autenticacion');
      }
      
      const savedConfig = await interfaceConfigService.saveConfigForUser(
        user.clerk_id, 
        state.config, 
        getToken
      );
      
      // Actualizar la configuracion guardada
      actions.setSavedConfig(savedConfig);
      
      logger.info('Configuracion guardada exitosamente');
      
    } catch (error) {
      logger.error('Error guardando configuracion:', error);
      actions.setError('Error guardando configuracion');
      throw error;
    } finally {
      actions.setSaving(false);
    }
  }, [profile, state.config, getToken, actions]);

  /**
   * Aplicar configuracion al DOM con debounce
   */
  useEffect(() => {
    if (!state.config) return;

    const timeoutId = setTimeout(() => {
      DOMConfigService.applyConfigToDOM(state.config);
    }, 150); // Debounce de 150ms

    return () => clearTimeout(timeoutId);
  }, [state.config]);

  /**
   * Forzar aplicacion al DOM (sin debounce)
   */
  const forceApplyToDOM = useCallback(() => {
    if (state.config) {
      DOMConfigService.applyConfigToDOM(state.config);
      DOMConfigService.forceStyleRefresh();
    }
  }, [state.config]);

  /**
   * Cargar configuracion inicial al montar
   */
  useEffect(() => {
    if (!isInitialized && !timeoutTriggeredRef.current) {
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
