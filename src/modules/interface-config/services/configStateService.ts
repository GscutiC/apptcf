/**
 * Servicio especializado para gestión de estado de configuraciones
 * Responsabilidad: Manejar el estado local, reducer y acciones
 * 
 * REFACTORIZADO: Ya no usa configuraciones hardcodeadas
 * Usa dynamicConfigService con lazy loading para evitar problemas circulares
 */

import { InterfaceConfig, PresetConfig } from '../types';
import { ConfigComparisonService } from './configComparisonService';
import { logger } from '../../../shared/utils/logger';
// dynamicConfigService se importa dinámicamente para evitar circular dependencies

export interface ConfigState {
  config: InterfaceConfig;
  savedConfig: InterfaceConfig;
  presets: PresetConfig[];
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  isSaving: boolean;
  // Estado contextual
  isGlobalAdmin: boolean;
  configSource: 'user' | 'role' | 'organization' | 'global' | 'legacy' | 'localStorage';
  contextualData: any | null;
}

export type ConfigAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONFIG'; payload: InterfaceConfig }
  | { type: 'SET_SAVED_CONFIG'; payload: InterfaceConfig }
  | { type: 'SET_PRESETS'; payload: PresetConfig[] }
  | { type: 'UPDATE_CONFIG'; payload: Partial<InterfaceConfig> }
  | { type: 'REPLACE_CONFIG'; payload: InterfaceConfig }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'RESET_TO_DEFAULT' }
  | { type: 'DISCARD_CHANGES' }
  | { type: 'SET_CONTEXTUAL_DATA'; payload: { 
      isGlobalAdmin: boolean; 
      configSource: ConfigState['configSource'];
      contextualData: any | null;
    }};

export class ConfigStateService {
  /**
   * Crea el estado inicial del contexto
   * REFACTORIZADO: Usa configuración de emergencia inline sin circular deps
   */
  static createInitialState(): ConfigState {
    // Usar DEFAULT_INTERFACE_CONFIG que ahora es una constante inline
    const { DEFAULT_INTERFACE_CONFIG } = require('../utils/defaultConfigs');
    const defaultConfig = DEFAULT_INTERFACE_CONFIG;
    
    return {
      config: defaultConfig,
      savedConfig: ConfigComparisonService.deepClone(defaultConfig),
      presets: [],
      loading: true,
      error: null,
      isDirty: false,
      isSaving: false,
      isGlobalAdmin: false,
      configSource: 'global',
      contextualData: null,
    };
  }

  /**
   * Reducer para manejar acciones de estado
   */
  static reducer(state: ConfigState, action: ConfigAction): ConfigState {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, loading: action.payload };

      case 'SET_ERROR':
        return { 
          ...state, 
          error: action.payload, 
          loading: false, 
          isSaving: false 
        };

      case 'SET_CONFIG':
        logger.debug('🔧 SET_CONFIG: Setting new config and saved config');
        return { 
          ...state, 
          config: action.payload,
          savedConfig: ConfigComparisonService.deepClone(action.payload),
          loading: false, 
          error: null,
          isDirty: false,
          isSaving: false
        };

      case 'SET_SAVED_CONFIG':
        logger.debug('💾 SET_SAVED_CONFIG: Updating saved config reference');
        
        return {
          ...state,
          savedConfig: ConfigComparisonService.deepClone(action.payload),
          config: ConfigComparisonService.deepClone(action.payload), // Asegurar deep clone
          isDirty: false,
          isSaving: false,
          error: null
        };

      case 'SET_PRESETS':
        return { ...state, presets: action.payload };

      case 'UPDATE_CONFIG': {
        // Deep merge para evitar referencias compartidas
        const newConfig = {
          ...state.config,
          ...action.payload,
          // Deep merge de propiedades anidadas
          branding: action.payload.branding 
            ? { ...state.config.branding, ...action.payload.branding }
            : state.config.branding,
          logos: action.payload.logos
            ? {
                ...state.config.logos,
                ...action.payload.logos,
                mainLogo: action.payload.logos.mainLogo
                  ? { ...state.config.logos.mainLogo, ...action.payload.logos.mainLogo }
                  : state.config.logos.mainLogo,
                sidebarLogo: action.payload.logos.sidebarLogo
                  ? { ...state.config.logos.sidebarLogo, ...action.payload.logos.sidebarLogo }
                  : state.config.logos.sidebarLogo,
                favicon: action.payload.logos.favicon
                  ? { ...state.config.logos.favicon, ...action.payload.logos.favicon }
                  : state.config.logos.favicon,
              }
            : state.config.logos,
          theme: action.payload.theme
            ? {
                ...state.config.theme,
                ...action.payload.theme,
                colors: action.payload.theme.colors
                  ? { ...state.config.theme.colors, ...action.payload.theme.colors }
                  : state.config.theme.colors,
              }
            : state.config.theme,
        };
        
        // ✅ FORCE DEEP CLONE para evitar referencias compartidas
        const savedConfigCopy = ConfigComparisonService.deepClone(state.savedConfig);
        const comparison = ConfigComparisonService.compare(newConfig, savedConfigCopy);
        

        
        logger.debug('🔄 UPDATE_CONFIG:', {
          payload: action.payload,
          hasChanges: !comparison.areEqual,
          differences: comparison.differences,
        });
        
        return {
          ...state,
          config: newConfig,
          isDirty: !comparison.areEqual
        };
      }

      case 'REPLACE_CONFIG': {
        const replacedConfig = action.payload;
        const comparison = ConfigComparisonService.compare(replacedConfig, state.savedConfig);
        
        logger.debug('🔄 REPLACE_CONFIG:', {
          hasChanges: !comparison.areEqual,
          differences: comparison.differences,
          summary: comparison.summary
        });
        
        return {
          ...state,
          config: replacedConfig,
          isDirty: !comparison.areEqual
        };
      }

      case 'SET_DIRTY':
        return { ...state, isDirty: action.payload };

      case 'SET_SAVING':
        return { ...state, isSaving: action.payload };

      case 'RESET_TO_DEFAULT': {
        // Lazy import para evitar inicialización circular
        const { dynamicConfigService } = require('./dynamicConfigService');
        const defaultConfig = dynamicConfigService.getEmergencyConfig();
        const comparison = ConfigComparisonService.compare(defaultConfig, state.savedConfig);
        
        logger.debug('🔄 RESET_TO_DEFAULT:', {
          hasChanges: !comparison.areEqual,
          summary: comparison.summary
        });
        
        return { 
          ...state, 
          config: defaultConfig,
          isDirty: !comparison.areEqual,
          error: null 
        };
      }

      case 'DISCARD_CHANGES':
        logger.debug('↩️ DISCARD_CHANGES: Reverting to saved config');
        return { 
          ...state, 
          config: ConfigComparisonService.deepClone(state.savedConfig),
          isDirty: false,
          error: null 
        };

      case 'SET_CONTEXTUAL_DATA':
        logger.debug('🏛️ SET_CONTEXTUAL_DATA:', action.payload);
        return {
          ...state,
          isGlobalAdmin: action.payload.isGlobalAdmin,
          configSource: action.payload.configSource,
          contextualData: action.payload.contextualData
        };

      default:
        logger.warn('Unknown action type:', action);
        return state;
    }
  }

  /**
   * Acciones útiles para el contexto
   */
  static createActions(dispatch: React.Dispatch<ConfigAction>) {
    return {
      setLoading: (loading: boolean) => 
        dispatch({ type: 'SET_LOADING', payload: loading }),
      
      setError: (error: string | null) => 
        dispatch({ type: 'SET_ERROR', payload: error }),
      
      setConfig: (config: InterfaceConfig) => 
        dispatch({ type: 'SET_CONFIG', payload: config }),
      
      setSavedConfig: (config: InterfaceConfig) => 
        dispatch({ type: 'SET_SAVED_CONFIG', payload: config }),
      
      setPresets: (presets: PresetConfig[]) => 
        dispatch({ type: 'SET_PRESETS', payload: presets }),
      
      updateConfig: (updates: Partial<InterfaceConfig>) => 
        dispatch({ type: 'UPDATE_CONFIG', payload: updates }),
      
      replaceConfig: (config: InterfaceConfig) => 
        dispatch({ type: 'REPLACE_CONFIG', payload: config }),
      
      setDirty: (isDirty: boolean) => 
        dispatch({ type: 'SET_DIRTY', payload: isDirty }),
      
      setSaving: (isSaving: boolean) => 
        dispatch({ type: 'SET_SAVING', payload: isSaving }),
      
      resetToDefault: () => 
        dispatch({ type: 'RESET_TO_DEFAULT' }),
      
      discardChanges: () => 
        dispatch({ type: 'DISCARD_CHANGES' }),
      
      setContextualData: (data: ConfigState['isGlobalAdmin'] extends boolean ? {
        isGlobalAdmin: boolean;
        configSource: ConfigState['configSource'];
        contextualData: any | null;
      } : never) => 
        dispatch({ type: 'SET_CONTEXTUAL_DATA', payload: data }),
    };
  }

  /**
   * Selectores para obtener datos derivados del estado
   */
  static createSelectors(state: ConfigState) {
    return {
      hasUnsavedChanges: ConfigComparisonService.hasUnsavedChanges(state.config, state.savedConfig),
      changesSummary: ConfigComparisonService.getChangesSummary(state.config, state.savedConfig),
      canModifyConfig: state.isGlobalAdmin || state.configSource === 'user',
      isReady: !state.loading && !!state.config && !!state.savedConfig,
    };
  }
}