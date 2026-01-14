/**
 * Hook principal simplificado para la gestion de configuracion de interfaz
 * Usa los servicios especializados para una arquitectura mas limpia
 *
 * OPTIMIZADO: Usa useAuthContext en lugar de useAuthProfile para evitar múltiples llamadas
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
 * Hook principal para gestion de configuracion de interfaz
 */
export function useInterfaceConfig(): UseInterfaceConfigReturn {
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { userProfile: profile, loading: profileLoading } = useAuthContext();
  
  // Estado principal usando el servicio especializado
  const [state, dispatch] = useReducer(
    ConfigStateService.reducer,
    ConfigStateService.createInitialState()
  );
  
  // Control de inicializacion para evitar llamadas multiples
  // CRÍTICO: Usar refs en lugar de state para evitar re-renders que causen loops
  const isInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const timeoutTriggeredRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const profileLoadingRef = useRef(profileLoading);
  const profileRef = useRef(profile);
  
  // CRÍTICO: Guardar getToken en ref para evitar re-renders por cambio de referencia
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // Acciones del servicio (memoizadas para mantener referencia estable)
  const actions = useMemo(() =>
    ConfigStateService.createActions(dispatch),
    [dispatch]
  );

  // Ref para actions para evitar dependencias cambiantes en useCallback
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  const selectors = ConfigStateService.createSelectors(state);

  // Actualizar refs sin causar re-renders
  useEffect(() => {
    profileLoadingRef.current = profileLoading;
    profileRef.current = profile;
  }, [profileLoading, profile]);

  /**
   * Invalidar caché si cambia el usuario
   */
  useEffect(() => {
    const currentUserId = profile?.clerk_id || null;

    if (lastUserIdRef.current && currentUserId && lastUserIdRef.current !== currentUserId) {
      logger.info('👤 Usuario cambió, invalidando caché...');
      ConfigCacheService.clearCache();
      isInitializedRef.current = false;
      timeoutTriggeredRef.current = false;
    }

    lastUserIdRef.current = currentUserId;
  }, [profile?.clerk_id]);

  /**
   * Cargar configuracion con timeout de emergencia
   * Si profile no llega en 3 segundos, carga config de emergencia
   */
  useEffect(() => {
    if (isInitializedRef.current || !authLoaded) return;

    const timeout = setTimeout(() => {
      if (!isInitializedRef.current && !timeoutTriggeredRef.current) {
        timeoutTriggeredRef.current = true;
        logger.warn('Timeout: cargando config de emergencia...');

        const emergencyConfig = dynamicConfigService.getEmergencyConfig();
        actionsRef.current.setConfig(emergencyConfig);
        DOMConfigService.applyConfigToDOM(emergencyConfig);
        actionsRef.current.setLoading(false);
        isInitializedRef.current = true;
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [authLoaded]); // CRÍTICO: NO incluir actions - causa loops infinitos

  /**
   * Cargar configuracion inicial (solo una vez)
   * OPTIMIZADO: Usa caché para evitar llamadas innecesarias al backend
   * CRÍTICO: Usa actionsRef.current en lugar de actions para evitar dependencias
   */
  const loadInitialConfig = useCallback(async () => {
    // Evitar multiples llamadas simultaneas
    if (isInitializingRef.current || isInitializedRef.current || timeoutTriggeredRef.current) {
      return;
    }

    // Esperar a que auth este listo
    if (!authLoaded) {
      return;
    }

    isInitializingRef.current = true;

    try {
      actionsRef.current.setLoading(true);
      actionsRef.current.setError(null);

      logger.info('Cargando configuracion inicial...');

      // ============================================
      // PASO 1: Intentar obtener desde preload (index.html)
      // ============================================
      const preloadedConfig = ConfigCacheService.getPreloadedConfig();
      if (preloadedConfig) {
        logger.info('⚡ Usando config desde preload de index.html');
        actionsRef.current.setConfig(preloadedConfig);
        DOMConfigService.applyConfigToDOM(preloadedConfig);
        // Guardar en cache para futuras recargas
        ConfigCacheService.setCache(preloadedConfig);
        isInitializedRef.current = true;
        actionsRef.current.setLoading(false);
        isInitializingRef.current = false;
        return;
      }

      // ============================================
      // PASO 2: Intentar obtener desde caché localStorage
      // ============================================
      // NO ESPERAR profileLoading - el caché es independiente del usuario
      const cachedConfig = ConfigCacheService.getCache();
      if (cachedConfig) {
        logger.info('⚡ Usando config desde cache localStorage');
        actionsRef.current.setConfig(cachedConfig);
        DOMConfigService.applyConfigToDOM(cachedConfig);
        isInitializedRef.current = true;
        actionsRef.current.setLoading(false);
        isInitializingRef.current = false;

        // Refrescar caché en background (sin bloquear UI)
        // SOLO si profile ya está disponible
        if (!profileLoadingRef.current) {
          setTimeout(async () => {
            try {
              const token = await getTokenRef.current();
              if (token) {
                const freshConfig = await dynamicConfigService.getCurrentConfig(getTokenRef.current);
                if (freshConfig) {
                  ConfigCacheService.setCache(freshConfig);
                  // Solo actualizar si hay diferencias significativas
                  const hasChanges = JSON.stringify(freshConfig) !== JSON.stringify(cachedConfig);
                  if (hasChanges) {
                    logger.info('🔄 Config actualizada en background');
                    actionsRef.current.setConfig(freshConfig);
                    DOMConfigService.applyConfigToDOM(freshConfig);
                  }
                }
              }
            } catch (e) {
              logger.warn('Error refrescando config en background:', e);
            }
          }, 100);
        }

        return;
      }

      // ============================================
      // PASO 3: Cargar desde backend (sin caché)
      // ============================================
      // AQUÍ SÍ esperar a que profile esté listo
      if (profileLoadingRef.current) {
        // Esperar a que profile termine de cargar antes de hacer request al backend
        actionsRef.current.setLoading(false);
        isInitializingRef.current = false;
        return;
      }

      // Si no hay perfil, intentar cargar config directamente con token
      if (!profileRef.current) {
        logger.warn('Perfil no disponible, cargando config con token...');

        try {
          const token = await getTokenRef.current();
          if (token) {
            const fallbackConfig = await dynamicConfigService.getCurrentConfig(getTokenRef.current);
            if (fallbackConfig) {
              actionsRef.current.setConfig(fallbackConfig);
              DOMConfigService.applyConfigToDOM(fallbackConfig);
              ConfigCacheService.setCache(fallbackConfig);
              isInitializedRef.current = true;
              logger.info('Configuracion cargada sin perfil');
              return;
            }
          }
        } catch (e) {
          logger.warn('Error cargando config sin perfil:', e);
        }

        // Usar config de emergencia si todo falla
        const emergencyConfig = dynamicConfigService.getEmergencyConfig();
        actionsRef.current.setConfig(emergencyConfig);
        DOMConfigService.applyConfigToDOM(emergencyConfig);
        isInitializedRef.current = true;
        logger.warn('Usando configuracion de emergencia');
        return;
      }

      const user = adaptUserProfileToUser(profileRef.current);
      if (!user) {
        throw new Error('Usuario no valido');
      }

      // Asegurar que tenemos un token valido antes de proceder
      const token = await getTokenRef.current();
      if (!token) {
        throw new Error('No se pudo obtener token de autenticacion');
      }

      const configResponse = await interfaceConfigService.getConfigForUser(user.clerk_id, getTokenRef.current);
      
      if (configResponse) {
        logger.info(`Configuracion cargada desde: ${configResponse.source}`);

        // Actualizar estado contextual
        actionsRef.current.setContextualData({
          isGlobalAdmin: configResponse.isGlobalAdmin,
          configSource: configResponse.source,
          contextualData: null
        });

        // Configurar la configuracion (esto establece tanto config como savedConfig)
        actionsRef.current.setConfig(configResponse.config);

        // Cargar presets en paralelo
        dynamicConfigService.getPresets(getTokenRef.current).then(presets => {
          actionsRef.current.setPresets(presets);
          logger.info(`Presets cargados: ${presets.length}`);
        }).catch(error => {
          logger.error('Error cargando presets:', error);
          actionsRef.current.setPresets([]);
        });
        
        // Aplicar al DOM inmediatamente
        DOMConfigService.applyConfigToDOM(configResponse.config);
        
        // Guardar en caché para futuras recargas
        ConfigCacheService.setCache(configResponse.config);
        logger.info('💾 Config guardada en caché');

        // Marcar como inicializado exitosamente
        isInitializedRef.current = true;

      } else {
        throw new Error('No se pudo obtener configuracion');
      }

    } catch (error) {
      logger.error('Error cargando configuracion inicial:', error);
      actionsRef.current.setError('Error cargando configuracion');

      // Fallback: intentar cargar desde dynamicConfigService nuevamente
      try {
        const fallbackConfig = await dynamicConfigService.getCurrentConfig(getTokenRef.current);
        actionsRef.current.setConfig(fallbackConfig);
        DOMConfigService.applyConfigToDOM(fallbackConfig);
        isInitializedRef.current = true;
        logger.info('Configuracion cargada despues de reintentar');
      } catch (fallbackError) {
        // Ultimo recurso: configuracion de emergencia
        const emergencyConfig = dynamicConfigService.getEmergencyConfig();
        actionsRef.current.setConfig(emergencyConfig);
        DOMConfigService.applyConfigToDOM(emergencyConfig);
        isInitializedRef.current = true;
        logger.warn('Usando configuracion de emergencia');
      }

    } finally {
      actionsRef.current.setLoading(false);
      isInitializingRef.current = false;
    }
  }, [authLoaded]); // OPTIMIZADO: Removido getToken - usamos getTokenRef.current

  /**
   * Funcion inteligente para actualizar configuracion
   */
  const setConfig = useCallback((updates: Partial<InterfaceConfig> | InterfaceConfig) => {
    // Si es una configuracion completa (preset), reemplazar todo
    if ('theme' in updates && 'logos' in updates && 'branding' in updates) {
      actionsRef.current.replaceConfig(updates as InterfaceConfig);
    } else {
      // Si son actualizaciones parciales, hacer merge
      actionsRef.current.updateConfig(updates);
    }
  }, []); // Sin dependencias - usa actionsRef.current

  /**
   * Guardar cambios
   */
  const saveChanges = useCallback(async () => {
    if (!profile) {
      throw new Error('Usuario no autenticado');
    }

    try {
      actionsRef.current.setSaving(true);
      actionsRef.current.setError(null);

      logger.info('Guardando configuracion...');

      const user = adaptUserProfileToUser(profile);
      if (!user) {
        throw new Error('Usuario no valido');
      }

      // Asegurar que tenemos un token valido antes de proceder
      const token = await getTokenRef.current();
      if (!token) {
        throw new Error('No se pudo obtener token de autenticacion');
      }

      const savedConfig = await interfaceConfigService.saveConfigForUser(
        user.clerk_id,
        state.config,
        getTokenRef.current
      );

      // Actualizar la configuracion guardada
      actionsRef.current.setSavedConfig(savedConfig);

      // Actualizar caché con la nueva configuración
      ConfigCacheService.setCache(savedConfig);

      logger.info('Configuracion guardada exitosamente');

    } catch (error) {
      logger.error('Error guardando configuracion:', error);
      actionsRef.current.setError('Error guardando configuracion');
      throw error;
    } finally {
      actionsRef.current.setSaving(false);
    }
  }, [profile, state.config]); // OPTIMIZADO: Removido getToken - usamos getTokenRef.current

  /**
   * Aplicar configuracion al DOM con debounce
   * OPTIMIZADO: Usar ref para comparar y evitar aplicaciones duplicadas
   */
  const lastAppliedConfigRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!state.config) return;

    // Crear hash simple del config para comparar
    const configHash = state.config.id || JSON.stringify(state.config.theme?.colors?.primary?.['500'] || '');
    
    // Si ya aplicamos esta configuración, no volver a aplicar
    if (lastAppliedConfigRef.current === configHash) {
      return;
    }

    const timeoutId = setTimeout(() => {
      DOMConfigService.applyConfigToDOM(state.config);
      lastAppliedConfigRef.current = configHash;
    }, 150); // Debounce de 150ms

    return () => clearTimeout(timeoutId);
  }, [state.config?.id, state.config?.theme?.colors?.primary?.['500']]); 
  // OPTIMIZADO: Solo dependencias específicas, no todo el objeto config

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
   * CRÍTICO: NO incluir loadInitialConfig en dependencias - causa loops infinitos
   * Usamos authLoaded directamente ya que es la única condición real de cambio
   */
  useEffect(() => {
    if (!isInitializedRef.current && !timeoutTriggeredRef.current && authLoaded) {
      loadInitialConfig();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded]); // CORREGIDO: Solo depender de authLoaded, no de loadInitialConfig

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
