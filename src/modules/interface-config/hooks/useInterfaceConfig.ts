/**
 * Hook principal simplificado para la gestión de configuración de interfaz
 * Usa los servicios especializados para una arquitectura más limpia
 * 
 * REFACTORIZADO: Usa dynamicConfigService en lugar de configuraciones hardcodeadas
 */

import { useReducer, useEffect, useCallback, useState, useMemo } from 'react';
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
  
  // Acciones del servicio (memoizadas para mantener referencia estable)
  const actions = useMemo(() => 
    ConfigStateService.createActions(dispatch), 
    [dispatch]
  );
  
  const selectors = ConfigStateService.createSelectors(state);

  /**
   * Cargar configuración inicial (solo una vez)
   */
  const loadInitialConfig = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (isInitializing || isInitialized) {
      console.log('🔄 [DEBUG] loadInitialConfig: Ya inicializando o inicializado', { isInitializing, isInitialized });
      return;
    }
    
    if (!authLoaded || profileLoading || !profile) {
      console.log('🔄 [DEBUG] loadInitialConfig: Esperando auth/profile', { authLoaded, profileLoading, hasProfile: !!profile });
      return;
    }

    console.log('🚀 [DEBUG] INICIANDO CARGA DE CONFIGURACIÓN');
    setIsInitializing(true);

    try {
      actions.setLoading(true);
      actions.setError(null);
      
      // 🆕 VERIFICACIÓN AGRESIVA DE CACHE OBSOLETO
      const localStorageConfig = localStorage.getItem('interface-config');
      console.log('🔍 [DEBUG] localStorage check:', localStorageConfig ? 'EXISTE' : 'VACÍO');
      
      if (localStorageConfig) {
        try {
          const parsed = JSON.parse(localStorageConfig);
          const appName = parsed.branding?.appName;
          console.log('📝 [DEBUG] appName en localStorage:', appName);
          
          // 🚨 DETECCIÓN AGRESIVA DE CONFIGURACIÓN OBSOLETA
          const obsoleteNames = ['WorkTecApp', 'Aplicación', 'Sistema', 'App'];
          const isObsolete = !appName || obsoleteNames.some(name => appName.includes(name));
          
          if (isObsolete) {
            console.log('🗑️ [DEBUG] CONFIGURACIÓN OBSOLETA DETECTADA, LIMPIANDO...');
            localStorage.removeItem('interface-config');
            localStorage.removeItem('interface-config-timestamp');
            localStorage.removeItem('config-cache');
            
            // Forzar recarga para aplicar configuración limpia
            setTimeout(() => {
              logger.warn('🔄 Recargando por configuración obsoleta detectada');
              window.location.reload();
            }, 100);
            return;
          }
        } catch (e) {
          console.log('❌ [DEBUG] Cache corrupto, limpiando:', e);
          localStorage.removeItem('interface-config');
        }
      }
      
      logger.info('�🔄 Cargando configuración inicial...');
      
      const user = adaptUserProfileToUser(profile);
      if (!user) {
        throw new Error('Usuario no válido');
      }
      
      console.log('👤 [DEBUG] Usuario:', user.clerk_id);
      
      // Asegurar que tenemos un token válido antes de proceder
      const token = await getToken();
      if (!token) {
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 [DEBUG] Token obtenido, llamando getConfigForUser...');
      const configResponse = await interfaceConfigService.getConfigForUser(user.clerk_id, getToken);
      
      if (configResponse) {
        console.log('✅ [DEBUG] Configuración recibida:', {
          source: configResponse.source,
          appName: configResponse.config.branding?.appName,
          isGlobalAdmin: configResponse.isGlobalAdmin
        });
        logger.info(`✅ Configuración cargada desde: ${configResponse.source}`);
        logger.info(`📝 appName cargado: ${configResponse.config.branding?.appName}`);
        
        // Actualizar estado contextual
        actions.setContextualData({
          isGlobalAdmin: configResponse.isGlobalAdmin,
          configSource: configResponse.source,
          contextualData: null
        });
        
        // Configurar la configuración (esto establece tanto config como savedConfig)
        actions.setConfig(configResponse.config);
        
        // 🆕 Cargar presets en paralelo
        dynamicConfigService.getPresets(getToken).then(presets => {
          actions.setPresets(presets);
          logger.info(`✅ Presets cargados: ${presets.length}`);
        }).catch(error => {
          logger.error('Error cargando presets:', error);
          actions.setPresets([]);
        });
        
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
      
      // Fallback: intentar cargar desde dynamicConfigService nuevamente
      try {
        const fallbackConfig = await dynamicConfigService.getCurrentConfig(getToken);
        actions.setConfig(fallbackConfig);
        DOMConfigService.applyConfigToDOM(fallbackConfig);
        logger.info('✅ Configuración cargada después de reintentar');
      } catch (fallbackError) {
        // Último recurso: configuración de emergencia
        const emergencyConfig = dynamicConfigService.getEmergencyConfig();
        actions.setConfig(emergencyConfig);
        DOMConfigService.applyConfigToDOM(emergencyConfig);
        logger.warn('⚠️ Usando configuración de emergencia');
      }
      
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