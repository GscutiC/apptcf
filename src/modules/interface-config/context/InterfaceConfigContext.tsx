/**
 * Contexto para la configuración de interfaz
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { InterfaceConfig, PresetConfig, ThemeContextValue, ConfigChangeEvent } from '../types';
import { DEFAULT_INTERFACE_CONFIG, SYSTEM_PRESETS, getDefaultConfig } from '../utils/defaultConfigs';

// Servicio mejorado para manejar la configuración global
const configService = {
  getCurrentConfig: async (): Promise<InterfaceConfig | null> => {
    try {
      // 1. Intentar obtener configuración del backend (global)
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/interface-config/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const backendConfig = await response.json();
        // Guardar en localStorage como caché
        localStorage.setItem('interface-config', JSON.stringify(backendConfig));
        return backendConfig;
      }
    } catch (error) {
      console.warn('Backend no disponible, probando localStorage:', error);
    }
    
    // 2. PRIORIZAR localStorage sobre archivo global para respetar cambios del usuario
    try {
      const saved = localStorage.getItem('interface-config');
      if (saved) {
        const localConfig = JSON.parse(saved);
        console.log('✅ Usando configuración guardada del usuario desde localStorage');
        return localConfig;
      }
    } catch (error) {
      console.error('Error loading config from localStorage:', error);
    }
    
    try {
      // 3. Solo usar archivo global como último recurso si no hay configuración local
      const globalConfigResponse = await fetch('/config/global-interface-config.json');
      if (globalConfigResponse.ok) {
        const globalConfig = await globalConfigResponse.json();
        console.log('📁 Usando configuración global por defecto (primera vez)');
        // NO guardar automáticamente en localStorage para permitir personalización
        return globalConfig;
      }
    } catch (error) {
      console.warn('Archivo global no disponible:', error);
    }
    
    // 4. Si todo falla, usar configuración por defecto
    console.log('🔧 Usando configuración por defecto del sistema');
    return null;
  },
  
  saveConfig: async (config: InterfaceConfig): Promise<InterfaceConfig> => {
    const configWithTimestamp = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    
    try {
      // 1. Intentar guardar en el backend (global)
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/interface-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configWithTimestamp)
      });
      
      if (response.ok) {
        const savedConfig = await response.json();
        // También guardar en localStorage como caché
        localStorage.setItem('interface-config', JSON.stringify(savedConfig));
        // Notificar a otras pestañas/ventanas del cambio
        window.dispatchEvent(new CustomEvent('interface-config-changed', { detail: savedConfig }));
        return savedConfig;
      }
    } catch (error) {
      console.warn('Error guardando en backend, usando localStorage:', error);
    }
    
    // 2. Si falla el backend, guardar solo en localStorage
    try {
      localStorage.setItem('interface-config', JSON.stringify(configWithTimestamp));
      // Notificar a otras pestañas del cambio
      window.dispatchEvent(new CustomEvent('interface-config-changed', { detail: configWithTimestamp }));
      return configWithTimestamp;
    } catch (error) {
      console.error('Error saving config to localStorage:', error);
      throw error;
    }
  },
  
  getPresets: async (): Promise<PresetConfig[]> => {
    return SYSTEM_PRESETS;
  },

  updatePartialConfig: async (updates: Partial<InterfaceConfig>): Promise<InterfaceConfig> => {
    const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/interface-config/partial`;
    
    try {
      // 1. Intentar actualizar en el backend usando el endpoint parcial
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedConfig = await response.json();
        // También actualizar localStorage como caché
        localStorage.setItem('interface-config', JSON.stringify(updatedConfig));
        // Notificar a otras pestañas/ventanas del cambio
        window.dispatchEvent(new CustomEvent('interface-config-changed', { detail: updatedConfig }));
        return updatedConfig;
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error) {
      console.warn('Error actualizando en backend, usando saveConfig completo:', error);
    }
    
    // 2. Si falla, usar el método de guardado completo
    const currentConfig = await configService.getCurrentConfig() || DEFAULT_INTERFACE_CONFIG;
    const mergedConfig = { ...currentConfig, ...updates };
    return configService.saveConfig(mergedConfig);
  }
};

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
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'RESET_TO_DEFAULT' }
  | { type: 'DISCARD_CHANGES' };

// Función para obtener configuración inicial sincrónicamente
const getInitialConfig = (): InterfaceConfig => {
  try {
    // Intentar cargar de localStorage primero (más rápido)
    const saved = localStorage.getItem('interface-config');
    if (saved) {
      const parsedConfig = JSON.parse(saved);
      console.log('🔄 Configuración inicial cargada desde localStorage');
      return parsedConfig;
    }
  } catch (error) {
    console.warn('Error cargando configuración inicial:', error);
  }
  
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
      const hasChanges = JSON.stringify(newConfig) !== JSON.stringify(state.savedConfig);
      return { 
        ...state, 
        config: newConfig,
        isDirty: hasChanges
      };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'RESET_TO_DEFAULT':
      const defaultConfig = getDefaultConfig();
      const hasDefaultChanges = JSON.stringify(defaultConfig) !== JSON.stringify(state.savedConfig);
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
    
    // Polling para verificar cambios del backend (menos frecuente y más inteligente)
    const configPolling = setInterval(async () => {
      try {
        // Solo hacer polling si no estamos guardando cambios
        if (!state.isSaving && !state.isDirty) {
          const currentConfig = await configService.getCurrentConfig();
          if (currentConfig && JSON.stringify(currentConfig) !== JSON.stringify(state.savedConfig)) {
            console.log('🔄 Configuración del servidor actualizada, sincronizando...');
            dispatch({ type: 'SET_CONFIG', payload: currentConfig });
          }
        }
      } catch (error) {
        console.warn('Error polling config:', error);
      }
    }, 30000); // Cada 30 segundos, menos agresivo
    
    window.addEventListener('interface-config-changed', handleConfigChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('interface-config-changed', handleConfigChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(configPolling);
    };
  }, []);

  // Aplicar configuración al DOM cuando cambie (con debounce para evitar aplicaciones múltiples)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyConfigToDOM(state.config);
    }, 50); // Pequeño debounce de 50ms
    
    return () => clearTimeout(timeoutId);
  }, [state.config]);

  // Función para cargar la configuración inicial
  const loadConfigFromStorage = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Intentar cargar configuración guardada
      const savedConfig = await configService.getCurrentConfig();
      
      if (savedConfig) {
        // Solo actualizar si hay cambios reales
        const currentConfigString = JSON.stringify(state.config);
        const newConfigString = JSON.stringify(savedConfig);
        
        if (currentConfigString !== newConfigString) {
          console.log('🔄 Nueva configuración detectada, actualizando...');
          dispatch({ type: 'SET_CONFIG', payload: savedConfig });
        } else {
          console.log('✅ Configuración actual ya está sincronizada');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        // Si no hay configuración guardada, usar la por defecto
        console.log('🔄 Usando configuración por defecto');
        dispatch({ type: 'SET_CONFIG', payload: DEFAULT_INTERFACE_CONFIG });
      }
      
      // Cargar presets disponibles
      const presets = await configService.getPresets();
      dispatch({ type: 'SET_PRESETS', payload: presets });
      
    } catch (error) {
      console.error('Error cargando configuración:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error cargando configuración de interfaz' });
      // En caso de error, usar configuración por defecto
      dispatch({ type: 'SET_CONFIG', payload: DEFAULT_INTERFACE_CONFIG });
    }
  };

  // Función para guardar cambios manualmente
  const saveChanges = async () => {
    try {
      console.log('💾 Iniciando guardado de configuración:', state.config.theme?.name);
      dispatch({ type: 'SET_SAVING', payload: true });
      
      // Guardar configuración actual
      const savedConfig = await configService.saveConfig(state.config);
      
      // Actualizar estado como guardado (importante: esto sincroniza savedConfig con config)
      dispatch({ type: 'SET_SAVED_CONFIG', payload: savedConfig });
      
      // No aplicar al DOM aquí, el useEffect se encarga con el debounce
      
      console.log('✅ Configuración guardada exitosamente');
      
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error guardando configuración' });
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
      console.log('🎨 Aplicando configuración completa:', updates.theme?.name);
      dispatch({ type: 'UPDATE_CONFIG', payload: updates });
      // No aplicar al DOM aquí, lo hace el useEffect con debounce
    } else {
      // Si son actualizaciones parciales, hacer merge
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
      
      // Aplicar variables CSS personalizadas
      const { colors, typography, layout } = config.theme;
    
    // Colores primarios
    Object.entries(colors.primary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });
    
    // Colores secundarios
    Object.entries(colors.secondary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-secondary-${shade}`, color);
    });
    
    // Colores de acento
    Object.entries(colors.accent).forEach(([shade, color]) => {
      root.style.setProperty(`--color-accent-${shade}`, color);
    });
    
    // Colores neutrales
    Object.entries(colors.neutral).forEach(([shade, color]) => {
      root.style.setProperty(`--color-neutral-${shade}`, color);
    });
    
    // Tipografía
    root.style.setProperty('--font-family-primary', typography.fontFamily.primary);
    root.style.setProperty('--font-family-secondary', typography.fontFamily.secondary);
    root.style.setProperty('--font-family-mono', typography.fontFamily.mono);
    
    // Espaciado y layout
    Object.entries(layout.borderRadius).forEach(([size, value]) => {
      root.style.setProperty(`--border-radius-${size}`, value);
    });
    
    // Actualizar título de la página
    document.title = config.branding.appName;
    
    // Actualizar meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', config.branding.appDescription);
    }
    
    // Actualizar favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      if (config.logos.favicon.imageUrl) {
        favicon.href = config.logos.favicon.imageUrl;
      } else {
        // Crear favicon dinámico con las iniciales de la aplicación
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fondo con colores del tema
          const gradient = ctx.createLinearGradient(0, 0, 32, 32);
          gradient.addColorStop(0, config.theme.colors.primary[500]);
          gradient.addColorStop(1, config.theme.colors.secondary[600]);
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