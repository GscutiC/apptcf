/**
 * Contexto para la configuración de interfaz
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { InterfaceConfig, PresetConfig, ThemeContextValue, ConfigChangeEvent } from '../types';
import { DEFAULT_INTERFACE_CONFIG, SYSTEM_PRESETS, getDefaultConfig } from '../utils/defaultConfigs';
import { interfaceConfigService } from '../services/interfaceConfigService';

// Estados del reducer
type ConfigState = {
  config: InterfaceConfig;
  savedConfig: InterfaceConfig; // Configuración guardada (referencia)
  presets: PresetConfig[];
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  isSaving: boolean;
};

// Acciones del reducer
type ConfigAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONFIG'; payload: InterfaceConfig }
  | { type: 'SET_SAVED_CONFIG'; payload: InterfaceConfig }
  | { type: 'SET_PRESETS'; payload: PresetConfig[] }
  | { type: 'UPDATE_CONFIG'; payload: Partial<InterfaceConfig> }
  | { type: 'REPLACE_CONFIG'; payload: InterfaceConfig } // Reemplazo completo sin merge
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'RESET_TO_DEFAULT' }
  | { type: 'DISCARD_CHANGES' };

// Función para obtener configuración inicial sincrónicamente
const getInitialConfig = (): InterfaceConfig => {
  try {
    // PRIORIDAD 1: Intentar cargar de localStorage primero (más rápido)
    const saved = localStorage.getItem('interface-config');
    if (saved) {
      const parsedConfig = JSON.parse(saved);
      console.log('✅ Configuración inicial cargada desde localStorage:', parsedConfig.theme?.name || 'Sin nombre');
      // Validar que tenga estructura mínima requerida
      if (parsedConfig.theme && parsedConfig.branding) {
        return parsedConfig;
      } else {
        console.warn('⚠️ Configuración en localStorage incompleta, usando default');
      }
    } else {
      console.log('ℹ️ No hay configuración en localStorage, usando default inicial');
    }
  } catch (error) {
    console.error('❌ Error parseando configuración inicial:', error);
  }
  
  // PRIORIDAD 2: Solo usar default si no hay ninguna configuración válida
  console.log('🔄 Usando configuración por defecto inicial');
  return DEFAULT_INTERFACE_CONFIG;
};

// Estado inicial
const initialState: ConfigState = {
  config: getInitialConfig(),
  savedConfig: getInitialConfig(), // La configuración guardada inicialmente es la misma
  presets: SYSTEM_PRESETS,
  loading: true, // Iniciar en loading para cargar la configuración real
  error: null,
  isDirty: false,
  isSaving: false,
};

// Función helper para comparar configuraciones de manera robusta
const configsAreEqual = (config1: InterfaceConfig, config2: InterfaceConfig): boolean => {
  try {
    // Normalizar y ordenar propiedades antes de comparar
    const normalize = (config: any) => {
      if (!config) return '';
      return JSON.stringify(config, Object.keys(config).sort());
    };
    
    const normalized1 = normalize(config1);
    const normalized2 = normalize(config2);
    
    return normalized1 === normalized2;
  } catch (error) {
    console.warn('Error comparing configs:', error);
    return false;
  }
};

// Reducer
const configReducer = (state: ConfigState, action: ConfigAction): ConfigState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, isSaving: false };
    case 'SET_CONFIG':
      return { 
        ...state, 
        config: action.payload,
        savedConfig: action.payload, // Al cargar, también es la configuración guardada
        loading: false, 
        error: null,
        isDirty: false,
        isSaving: false
      };
    case 'SET_SAVED_CONFIG':
      return {
        ...state,
        savedConfig: action.payload,
        config: action.payload, // Actualizar también la config actual
        isDirty: false,
        isSaving: false,
        error: null
      };
    case 'SET_PRESETS':
      return { ...state, presets: action.payload };
    case 'UPDATE_CONFIG':
      const newConfig = { ...state.config, ...action.payload };
      const hasChanges = !configsAreEqual(newConfig, state.savedConfig);
      console.log('📊 Config updated (merge), isDirty:', hasChanges, newConfig.theme?.name);
      return { 
        ...state, 
        config: newConfig,
        isDirty: hasChanges
      };
    case 'REPLACE_CONFIG':
      // Reemplazo completo sin merge - para presets
      const replacedConfig = action.payload;
      const hasReplacementChanges = !configsAreEqual(replacedConfig, state.savedConfig);
      console.log('🔄 Config replaced completely, isDirty:', hasReplacementChanges, replacedConfig.theme?.name);
      return { 
        ...state, 
        config: replacedConfig,
        isDirty: hasReplacementChanges
      };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'RESET_TO_DEFAULT':
      const defaultConfig = getDefaultConfig();
      const hasDefaultChanges = !configsAreEqual(defaultConfig, state.savedConfig);
      return { 
        ...state, 
        config: defaultConfig,
        isDirty: hasDefaultChanges
      };
    case 'DISCARD_CHANGES':
      return {
        ...state,
        config: state.savedConfig, // Revertir a la configuración guardada
        isDirty: false
      };
    default:
      return state;
  }
};

// Crear el contexto
const InterfaceConfigContext = createContext<ThemeContextValue | undefined>(undefined);

// Props del provider
interface InterfaceConfigProviderProps {
  children: ReactNode;
}

// Provider del contexto
export const InterfaceConfigProvider: React.FC<InterfaceConfigProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(configReducer, initialState);

  // Aplicar configuración inicial inmediatamente (sin esperar carga)
  useEffect(() => {
    console.log('🎨 Aplicando configuración inicial al DOM');
    applyConfigToDOM(state.config);
  }, []); // Solo una vez al montar

  // Auto-save inteligente con debounce mejorado
  useEffect(() => {
    // Solo auto-guardar si:
    // 1. Hay cambios (isDirty)
    // 2. No estamos guardando ya
    // 3. La configuración es válida (tiene theme y branding)
    const isValidConfig = state.config?.theme && state.config?.branding;
    
    if (state.isDirty && !state.isSaving && isValidConfig) {
      console.log('⏰ Auto-save programado para:', state.config.theme?.name, '(en 3s)');
      
      const autoSaveTimeout = setTimeout(async () => {
        try {
          console.log('🤖 Ejecutando auto-save...');
          await saveChanges();
          console.log('✅ Auto-save completado exitosamente');
        } catch (error) {
          console.error('❌ Auto-save falló:', error);
          // No hacer rollback en auto-save, el usuario puede guardar manualmente
          dispatch({ type: 'SET_ERROR', payload: 'Auto-guardado falló. Intente guardar manualmente.' });
        }
      }, 3000); // Auto-guardar después de 3 segundos de inactividad
      
      return () => {
        console.log('⏰ Auto-save cancelado (nuevos cambios detectados)');
        clearTimeout(autoSaveTimeout);
      };
    } else {
      // Log de por qué no se auto-guarda
      if (!state.isDirty) {
        // No hacer log, es normal
      } else if (state.isSaving) {
        console.log('⏸️ Auto-save pausado (guardado en progreso)');
      } else if (!isValidConfig) {
        console.warn('⚠️ Auto-save bloqueado (configuración inválida)');
      }
    }
  }, [state.isDirty, state.config, state.isSaving]);

  // Cargar configuración inicial
  useEffect(() => {
    loadConfigFromStorage();
    
    // Listener para cambios de configuración desde otras pestañas/usuarios
    const handleConfigChange = (event: CustomEvent) => {
      dispatch({ type: 'SET_CONFIG', payload: event.detail });
    };
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'interface-config' && event.newValue) {
        try {
          const newConfig = JSON.parse(event.newValue);
          dispatch({ type: 'SET_CONFIG', payload: newConfig });
        } catch (error) {
          console.error('Error parsing storage config:', error);
        }
      }
    };
    
    // Polling inteligente para verificar cambios del backend
    const configPolling = setInterval(async () => {
      try {
        // 🚫 NO hacer polling si hay cambios pendientes O si se está guardando
        if (state.isDirty || state.isSaving) {
          console.log('🚫 Polling skipped - local changes pending or saving in progress');
          return;
        }
        
        // Verificar si hay cambios en el servidor
        const currentConfig = await interfaceConfigService.getCurrentConfig();
        if (currentConfig) {
          // Usar comparación más robusta
          const localConfigStr = JSON.stringify(state.savedConfig, Object.keys(state.savedConfig || {}).sort());
          const serverConfigStr = JSON.stringify(currentConfig, Object.keys(currentConfig).sort());
          
          if (localConfigStr !== serverConfigStr) {
            console.log('🔄 Remote configuration updated, syncing...', currentConfig.theme?.name);
            dispatch({ type: 'SET_CONFIG', payload: currentConfig });
          } else {
            console.log('✅ Configurations are in sync');
          }
        }
      } catch (error) {
        console.warn('❌ Error polling config:', error);
      }
    }, 60000); // Aumentado a 60 segundos para ser menos agresivo
    
    window.addEventListener('interface-config-changed', handleConfigChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('interface-config-changed', handleConfigChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(configPolling);
    };
  }, []);

  // Aplicar configuración al DOM solo DESPUÉS de guardar exitosamente
  useEffect(() => {
    // Solo aplicar si la configuración está guardada (no hay cambios pendientes)
    if (!state.isDirty && !state.isSaving) {
      const timeoutId = setTimeout(() => {
        console.log('🎨 Applying saved configuration to DOM:', state.config.theme?.name);
        applyConfigToDOM(state.config);
      }, 100); // Pequeño delay para asegurar que el estado esté estable
      
      return () => clearTimeout(timeoutId);
    } else if (state.isDirty) {
      console.log('⏳ Configuration has unsaved changes, not applying to DOM yet');
    }
  }, [state.config, state.isDirty, state.isSaving]);

  // Función para cargar la configuración inicial
  const loadConfigFromStorage = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('📥 Iniciando carga de configuración desde backend/storage...');
      
      // Intentar cargar configuración guardada (backend o localStorage)
      const savedConfig = await interfaceConfigService.getCurrentConfig();
      
      if (savedConfig) {
        // Validar que la configuración del backend sea más reciente o diferente
        const currentConfigString = JSON.stringify(state.config);
        const newConfigString = JSON.stringify(savedConfig);
        
        if (currentConfigString !== newConfigString) {
          console.log('🔄 Nueva configuración detectada, actualizando:', savedConfig.theme?.name);
          dispatch({ type: 'SET_CONFIG', payload: savedConfig });
        } else {
          console.log('✅ Configuración actual ya está sincronizada');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        // Si no hay configuración guardada Y la config actual es la default, mantenerla
        console.log('ℹ️ No hay configuración remota, manteniendo configuración actual:', state.config.theme?.name);
        dispatch({ type: 'SET_LOADING', payload: false });
        
        // NO sobrescribir con default si ya hay una configuración válida cargada
        // Solo usar default si realmente no hay nada
        if (!state.config.theme || !state.config.branding) {
          console.log('⚠️ Configuración actual inválida, usando default');
          dispatch({ type: 'SET_CONFIG', payload: DEFAULT_INTERFACE_CONFIG });
        }
      }
      
      // Cargar presets disponibles
      const presets = await interfaceConfigService.getPresets();
      dispatch({ type: 'SET_PRESETS', payload: presets });
      
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error cargando configuración de interfaz' });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // En caso de error, MANTENER configuración actual en lugar de sobrescribir
      console.log('⚠️ Manteniendo configuración actual debido a error en carga:', state.config.theme?.name);
    }
  };

  // Función para guardar cambios manualmente (mejorada)
  const saveChanges = async (): Promise<void> => {
    try {
      const configToSave = state.config;
      console.log('💾 Iniciando guardado de configuración:', configToSave.theme?.name);
      
      // Validar configuración antes de guardar
      if (!configToSave.theme || !configToSave.branding) {
        throw new Error('Configuración inválida: faltan campos requeridos');
      }
      
      dispatch({ type: 'SET_SAVING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null }); // Limpiar errores anteriores
      
      // Guardar configuración con timestamp actualizado
      const savedConfig = await interfaceConfigService.saveConfig(configToSave);
      
      console.log('✅ Configuración guardada exitosamente en backend/storage');
      
      // Actualizar estado como guardado (sincroniza savedConfig con config)
      dispatch({ type: 'SET_SAVED_CONFIG', payload: savedConfig });
      
      // Aplicar al DOM inmediatamente después de guardar exitosamente
      console.log('🎨 Aplicando configuración al DOM:', savedConfig.theme?.name);
      applyConfigToDOM(savedConfig);
      
      // Emitir evento para otras instancias/componentes
      window.dispatchEvent(new CustomEvent('config-saved', { detail: savedConfig }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error guardando configuración:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: `Error guardando: ${errorMessage}` });
      dispatch({ type: 'SET_SAVING', payload: false });
      throw error;
    }
  };

  // Función para descartar cambios
  const discardChanges = () => {
    dispatch({ type: 'DISCARD_CHANGES' });
    // Aplicar la configuración guardada al DOM
    applyConfigToDOM(state.savedConfig);
  };

  // Función para aplicar configuración completa (solo para carga inicial)
  const loadInitialConfig = async (config: InterfaceConfig) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
    applyConfigToDOM(config);
  };

  // Función para actualizar configuración localmente (sin guardar)
  const setConfig = (updates: Partial<InterfaceConfig> | InterfaceConfig) => {
    // Si es una configuración completa (como un preset), reemplazar todo
    if ('theme' in updates && 'logos' in updates && 'branding' in updates) {
      console.log('🎨 Aplicando configuración completa (REPLACE):', updates.theme?.name);
      dispatch({ type: 'REPLACE_CONFIG', payload: updates as InterfaceConfig });
      // No aplicar al DOM aquí, lo hace el useEffect con debounce
    } else {
      // Si son actualizaciones parciales, hacer merge
      console.log('📝 Aplicando actualización parcial (MERGE)');
      dispatch({ type: 'UPDATE_CONFIG', payload: updates });
      // No aplicar al DOM aquí, lo hace el useEffect con debounce
    }
  };

  // Función para resetear a configuración por defecto
  const resetToDefault = () => {
    dispatch({ type: 'RESET_TO_DEFAULT' });
  };

  // Función para aplicar configuración al DOM
  const applyConfigToDOM = (config: InterfaceConfig) => {
    try {
      const root = document.documentElement;
      
      // Validar que la configuración tenga la estructura esperada
      if (!config || !config.theme) {
        console.warn('Configuración inválida, usando valores por defecto');
        return;
      }
      
      // Aplicar variables CSS personalizadas de forma segura
      const { colors, typography, layout } = config.theme;
    
    // Colores primarios (con validación)
    if (colors?.primary) {
      Object.entries(colors.primary).forEach(([shade, color]) => {
        if (color) {
          root.style.setProperty(`--color-primary-${shade}`, color);
        }
      });
    }
    
    // Colores secundarios (con validación)
    if (colors?.secondary) {
      Object.entries(colors.secondary).forEach(([shade, color]) => {
        if (color) {
          root.style.setProperty(`--color-secondary-${shade}`, color);
        }
      });
    }
    
    // Colores de acento (con validación)
    if (colors?.accent) {
      Object.entries(colors.accent).forEach(([shade, color]) => {
        if (color) {
          root.style.setProperty(`--color-accent-${shade}`, color);
        }
      });
    }
    
    // Colores neutrales (con validación)
    if (colors?.neutral) {
      Object.entries(colors.neutral).forEach(([shade, color]) => {
        if (color) {
          root.style.setProperty(`--color-neutral-${shade}`, color);
        }
      });
    }
    
    // Tipografía (con validación)
    if (typography?.fontFamily) {
      if (typography.fontFamily.primary) {
        root.style.setProperty('--font-family-primary', typography.fontFamily.primary);
      }
      if (typography.fontFamily.secondary) {
        root.style.setProperty('--font-family-secondary', typography.fontFamily.secondary);
      }
      if (typography.fontFamily.mono) {
        root.style.setProperty('--font-family-mono', typography.fontFamily.mono);
      }
    }
    
    // Espaciado y layout (con validación)
    if (layout?.borderRadius) {
      Object.entries(layout.borderRadius).forEach(([size, value]) => {
        if (value) {
          root.style.setProperty(`--border-radius-${size}`, value);
        }
      });
    }
    
    // Actualizar título de la página (con validación)
    if (config.branding?.appName) {
      document.title = config.branding.appName;
    }
    
    // Actualizar meta description (con validación)
    if (config.branding?.appDescription) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', config.branding.appDescription);
      }
    }
    
    // Actualizar favicon (con validación)
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && config.logos?.favicon) {
      if (config.logos.favicon.imageUrl) {
        favicon.href = config.logos.favicon.imageUrl;
      } else if (config.branding?.appName && config.theme?.colors) {
        // Crear favicon dinámico con las iniciales de la aplicación
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fondo con colores del tema (con fallbacks)
          const gradient = ctx.createLinearGradient(0, 0, 32, 32);
          const primaryColor = config.theme.colors.primary?.[500] || '#3b82f6';
          const secondaryColor = config.theme.colors.secondary?.[600] || '#2563eb';
          gradient.addColorStop(0, primaryColor);
          gradient.addColorStop(1, secondaryColor);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 32, 32);
          
          // Texto con iniciales
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const initials = config.branding.appName.substring(0, 2).toUpperCase();
          ctx.fillText(initials, 16, 16);
          
          favicon.href = canvas.toDataURL();
        }
      }
    }
    
    // Aplicar CSS personalizado
    if (config.customCSS) {
      let customStyleElement = document.getElementById('custom-interface-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'custom-interface-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = config.customCSS;
    }
    } catch (error) {
      console.error('Error aplicando configuración al DOM:', error);
    }
  };

  // Función para forzar aplicación al DOM
  const forceApplyToDOM = () => {
    applyConfigToDOM(state.config);
  };

  // Valor del contexto
  const contextValue: ThemeContextValue = {
    config: state.config,
    savedConfig: state.savedConfig,
    setConfig,
    saveChanges,
    discardChanges,
    resetToDefault,
    forceApplyToDOM,
    presets: state.presets,
    loading: state.loading,
    error: state.error,
    isDirty: state.isDirty,
    isSaving: state.isSaving,
  };

  return (
    <InterfaceConfigContext.Provider value={contextValue}>
      {children}
    </InterfaceConfigContext.Provider>
  );
};

// Hook para usar el contexto
export const useInterfaceConfig = (): ThemeContextValue => {
  const context = useContext(InterfaceConfigContext);
  if (context === undefined) {
    throw new Error('useInterfaceConfig debe usarse dentro de InterfaceConfigProvider');
  }
  return context;
};

// Hook para eventos de cambio de configuración
export const useConfigChange = (callback: (event: ConfigChangeEvent) => void) => {
  const { config } = useInterfaceConfig();
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'interface-config' && e.newValue) {
        const newConfig = JSON.parse(e.newValue);
        callback({
          type: 'theme',
          field: 'storage',
          value: newConfig,
          config: newConfig,
        });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [callback]);
  
  return config;
};