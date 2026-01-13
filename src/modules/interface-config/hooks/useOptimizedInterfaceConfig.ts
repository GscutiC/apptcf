/**
 * Hook optimizado para cargar configuraci\u00f3n usando precarga y cach\u00e9
 * Versi\u00f3n simplificada que prioriza velocidad y reduce parpadeos
 */

import { useReducer, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { InterfaceConfig, PresetConfig } from '../types';
import { ConfigStateService, ConfigState } from '../services/configStateService';
import { DOMConfigService } from '../services/domConfigService';
import { interfaceConfigService } from '../services/interfaceConfigService';
import { dynamicConfigService } from '../services/dynamicConfigService';
import { ConfigCacheService } from '../services/configCacheService';
import { useAuthContext } from '../../../context/AuthContext';
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
 * Hook principal optimizado con precarga y cach\u00e9
 */
export function useOptimizedInterfaceConfig(): UseInterfaceConfigReturn {
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { userProfile: profile, loading: profileLoading } = useAuthContext();
  
  // Estado principal
  const [state, dispatch] = useReducer(
    ConfigStateService.reducer,
    ConfigStateService.createInitialState()
  );
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  const actions = useMemo(() => 
    ConfigStateService.createActions(dispatch), 
    [dispatch]
  );

  /**
   * Carga inicial optimizada - UN SOLO INTENTO
   */
  useEffect(() => {
    if (isInitialized || !authLoaded) return;

    const loadConfig = async () => {
      try {
        actions.setLoading(true);
        
        // \u2705 PASO 1: Intentar config precargada (m\u00e1s r\u00e1pido)
        const preloaded = ConfigCacheService.getPreloadedConfig();
        if (preloaded) {
          logger.info('\u26a1 Config precargada usada');
          actions.setConfig(preloaded);
          setIsInitialized(true);
          actions.setLoading(false);
          return;
        }
        
        // \u2705 PASO 2: Intentar cache local
        const cached = ConfigCacheService.getCache();
        if (cached) {
          logger.info('\ud83d\udcbe Config desde cache');
          actions.setConfig(cached);
          DOMConfigService.applyConfigToDOM(cached);
          setIsInitialized(true);
          actions.setLoading(false);
          return;
        }
        
        // \u2705 PASO 3: Cargar desde backend (si no hay precarga ni cache)
        const configResponse = await dynamicConfigService.getCurrentConfig(getToken);
        if (configResponse) {
          actions.setConfig(configResponse);
          DOMConfigService.applyConfigToDOM(configResponse);
          ConfigCacheService.setCache(configResponse);
          logger.info('\ud83c\udf10 Config cargada desde backend');
        } else {
          throw new Error('No config available');
        }
        
        setIsInitialized(true);
        
      } catch (error) {
        logger.error('Error cargando config:', error);
        
        // Fallback de emergencia
        const emergency = dynamicConfigService.getEmergencyConfig();
        actions.setConfig(emergency);
        DOMConfigService.applyConfigToDOM(emergency);
        setIsInitialized(true);
        
      } finally {
        actions.setLoading(false);
      }
    };

    loadConfig();
  }, [authLoaded, isInitialized, getToken, actions]);

  /**
   * Wrapper para setConfig que acepta Partial o InterfaceConfig completo
   * Compatible con la interfaz UseInterfaceConfigReturn
   */
  const setConfig = useCallback((updates: Partial<InterfaceConfig> | InterfaceConfig) => {
    // Si tiene 'id', asumimos que es un config completo
    if ('id' in updates && updates.id) {
      actions.setConfig(updates as InterfaceConfig);
    } else {
      // Es parcial, usar updateConfig
      actions.updateConfig(updates);
    }
  }, [actions]);
  
  return {
    config: state.config,
    savedConfig: state.savedConfig,
    presets: state.presets,
    loading: state.loading,
    error: state.error,
    isDirty: false,
    isSaving: false,
    isGlobalAdmin: state.isGlobalAdmin,
    configSource: state.configSource,
    
    setConfig,
    saveChanges: async () => {},
    discardChanges: () => {},
    resetToDefault: () => {},
    forceApplyToDOM: () => DOMConfigService.applyConfigToDOM(state.config),
    
    hasUnsavedChanges: false,
    changesSummary: '',
    canModifyConfig: state.isGlobalAdmin,
    isReady: isInitialized && !state.loading
  };
}
