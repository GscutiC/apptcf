/**
 * Servicio especializado para gestión de estado de configuraciones
 * Responsabilidad: Manejar el estado local, reducer y acciones
 */

import { InterfaceConfig, PresetConfig } from '../types';
import { ConfigComparisonService } from './configComparisonService';
import { getDefaultConfig } from '../utils/defaultConfigs';
import { logger } from '../../../shared/utils/logger';

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
   */
  static createInitialState(): ConfigState {
    const defaultConfig = getDefaultConfig();
    
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
          config: action.payload,
          isDirty: false,
          isSaving: false,
          error: null
        };

      case 'SET_PRESETS':
        return { ...state, presets: action.payload };

      case 'UPDATE_CONFIG': {
        const newConfig = { ...state.config, ...action.payload };
        const comparison = ConfigComparisonService.compare(newConfig, state.savedConfig);
        
        logger.debug('🔄 UPDATE_CONFIG:', {
          payload: action.payload,
          hasChanges: !comparison.areEqual,
          differences: comparison.differences,
          summary: comparison.summary
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
        const defaultConfig = getDefaultConfig();
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