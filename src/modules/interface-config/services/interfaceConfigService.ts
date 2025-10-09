/**
 * Servicio para la configuración de interfaz
 * Implementa autenticación con Clerk siguiendo el patrón del módulo user-management
 */

import { InterfaceConfig, PresetConfig } from '../types';
import { DEFAULT_INTERFACE_CONFIG } from '../utils/defaultConfigs';
import { createAuthenticatedHttpService } from './httpService';
import { logger } from '../../../shared/utils/logger';

// Tipos para el sistema contextual (actualizados para coincidir con backend)
export interface ContextualConfigResponse {
  config: InterfaceConfig;
  resolved_from: {
    context_type: 'user' | 'role' | 'org' | 'global';
    context_id: string | null;
  };
  resolution_chain: Array<{
    context_type: 'user' | 'role' | 'org' | 'global';
    context_id: string | null;
  }>;
}

export interface UserPreferences {
  user_id: string;
  preferences: Partial<InterfaceConfig>;
  context?: {
    role_id?: string;
    organization_id?: string;
  };
}

class InterfaceConfigService {
  private readonly STORAGE_KEY = 'interface-config';
  private readonly API_BASE = '/api/interface-config';
  
  // Sistema de caché en memoria para evitar llamadas duplicadas
  private permissionsCache: { can_modify: boolean; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 30000; // 30 segundos de caché
  
  // 🆕 Control de limpieza automática
  private hasRunCacheCleanup = false;
  
  constructor() {
    // 🆕 LIMPIEZA AUTOMÁTICA AGRESIVA
    this.performAutomaticCacheCleanup();
  }

  /**
   * Obtener la configuración actual (con autenticación) - versión segura
   * FASE 2.1: MongoDB como fuente única de verdad con fallback
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async getCurrentConfig(getToken: () => Promise<string | null>): Promise<InterfaceConfig | null> {
    try {
      // Crear servicio HTTP autenticado
      const httpService = createAuthenticatedHttpService(getToken);

      // MongoDB con endpoint seguro y fallback
      const response = await httpService.get<InterfaceConfig>(`${this.API_BASE}/current/safe`);
      if (response.data) {
        // Guardar en localStorage SOLO como caché para offline
        this.saveToLocalStorage(response.data);
        logger.debug('Configuración obtenida desde MongoDB (seguro) y cacheada localmente');
        return response.data;
      }
    } catch (error) {
      logger.warn('Servidor no disponible, usando caché local:', error);

      // Solo usar localStorage si el servidor está completamente caído
      const cachedConfig = this.getFromLocalStorage();
      if (cachedConfig) {
        logger.info('Usando configuración cacheada (modo offline)');
        return cachedConfig;
      }
    }

    // Si no hay config en servidor ni caché, retornar null
    logger.warn('No hay configuración disponible (ni en servidor ni en caché)');
    return null;
  }
  
  /**
   * Guardar configuración (con autenticación)
   * FASE 2.1: MongoDB como fuente única - guardar directamente allí
   * @param getToken - Función para obtener token JWT de Clerk
   * @param config - Configuración a guardar
   */
  async saveConfig(getToken: () => Promise<string | null>, config: InterfaceConfig): Promise<InterfaceConfig> {
    try {
      const httpService = createAuthenticatedHttpService(getToken);

      // Usar endpoint PATCH /partial para actualizaciones
      const response = await httpService.patch<InterfaceConfig>(`${this.API_BASE}/partial`, config);

      if (response.data) {
        // Actualizar caché local después de guardar en MongoDB
        this.saveToLocalStorage(response.data);
        logger.info('Configuración guardada en MongoDB y actualizada en caché');
        return response.data;
      }

      throw new Error('No se recibió respuesta del servidor');
    } catch (error) {
      logger.error('Error guardando configuración en servidor:', error);

      // En modo offline, guardar en localStorage y marcar como pendiente de sincronizar
      const configWithTimestamp = {
        ...config,
        updatedAt: new Date().toISOString(),
        _pendingSync: true // Marca para saber que necesita sincronizar
      };

      this.saveToLocalStorage(configWithTimestamp);
      logger.warn('Configuración guardada en caché local - se sincronizará cuando el servidor esté disponible');

      throw new Error('No se pudo guardar en el servidor. Los cambios se guardarán cuando vuelva la conexión.');
    }
  }

  /**
   * Obtener presets disponibles (con autenticación)
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async getPresets(getToken: () => Promise<string | null>): Promise<PresetConfig[]> {
    try {
      // Intentar obtener presets del servidor
      const httpService = createAuthenticatedHttpService(getToken);
      const response = await httpService.get<PresetConfig[]>(`${this.API_BASE}/presets`);

      if (response.data && Array.isArray(response.data)) {
        logger.info(`✅ Presets cargados desde backend: ${response.data.length}`);
        return response.data;
      }

      // Si no hay data del servidor, retornar vacío
      logger.warn('⚠️ No se pudieron cargar presets del servidor - respuesta vacía');
      return [];
    } catch (error) {
      logger.error('❌ Error obteniendo presets del servidor:', error);
      // En caso de error de red, retornar vacío (no usar datos hardcodeados)
      return [];
    }
  }

  /**
   * Crear preset personalizado (con autenticación)
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async createPreset(getToken: () => Promise<string | null>, name: string, description: string, config: InterfaceConfig): Promise<PresetConfig> {
    try {
      const presetData = {
        name,
        description,
        config,
        isDefault: false,
        isSystem: false,
      };

      const httpService = createAuthenticatedHttpService(getToken);
      const response = await httpService.post<PresetConfig>(`${this.API_BASE}/presets`, presetData);
      return response.data;
    } catch (error) {
      logger.error('Error creando preset:', error);
      throw new Error('No se pudo crear el preset personalizado');
    }
  }

  /**
   * Eliminar preset personalizado (con autenticación)
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async deletePreset(getToken: () => Promise<string | null>, presetId: string): Promise<void> {
    try {
      const httpService = createAuthenticatedHttpService(getToken);
      await httpService.delete(`${this.API_BASE}/presets/${presetId}`);
    } catch (error) {
      logger.error('Error eliminando preset:', error);
      throw new Error('No se pudo eliminar el preset');
    }
  }

  /**
   * Aplicar preset (con autenticación)
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async applyPreset(getToken: () => Promise<string | null>, presetId: string): Promise<InterfaceConfig> {
    try {
      // Intentar usar el endpoint específico para aplicar preset
      const httpService = createAuthenticatedHttpService(getToken);
      const response = await httpService.post<any>(`${this.API_BASE}/presets/${presetId}/apply`);

      if (response.data && response.data.config) {
        // También guardar en localStorage como backup
        this.saveToLocalStorage(response.data.config);
        return response.data.config;
      }
    } catch (error) {
      logger.warn('Error aplicando preset en servidor, usando método local:', error);
    }

    // Fallback: método local
    const presets = await this.getPresets(getToken);
    const preset = presets.find(p => p.id === presetId);

    if (!preset) {
      throw new Error('Preset no encontrado');
    }

    return this.saveConfig(getToken, preset.config);
  }

  /**
   * Resetear a configuración por defecto (con autenticación)
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async resetToDefault(getToken: () => Promise<string | null>): Promise<InterfaceConfig> {
    return this.saveConfig(getToken, DEFAULT_INTERFACE_CONFIG);
  }

  /**
   * Exportar configuración actual
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async exportConfig(getToken: () => Promise<string | null>): Promise<string> {
    const config = await this.getCurrentConfig(getToken);
    return JSON.stringify(config || DEFAULT_INTERFACE_CONFIG, null, 2);
  }

  /**
   * Importar configuración desde JSON (con autenticación)
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async importConfig(getToken: () => Promise<string | null>, configJson: string): Promise<InterfaceConfig> {
    try {
      const config = JSON.parse(configJson) as InterfaceConfig;

      // Validar estructura básica
      if (!config.theme || !config.branding || !config.logos) {
        throw new Error('Formato de configuración inválido');
      }

      return this.saveConfig(getToken, config);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('JSON inválido');
      }
      throw error;
    }
  }

  /**
   * Obtener historial de cambios (con autenticación)
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async getConfigHistory(getToken: () => Promise<string | null>, limit: number = 10): Promise<InterfaceConfig[]> {
    try {
      const httpService = createAuthenticatedHttpService(getToken);
      const response = await httpService.get<InterfaceConfig[]>(`${this.API_BASE}/history?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      logger.warn('Historial no disponible:', error);
      return [];
    }
  }

  // Métodos privados para localStorage

  private getFromLocalStorage(): InterfaceConfig | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      
      // 🆕 VALIDACIÓN DE FRESCURA: Si la config es muy antigua, ignorarla
      const configAge = Date.now() - new Date(parsed.updatedAt || 0).getTime();
      const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 horas
      
      if (configAge > MAX_CACHE_AGE) {
        logger.warn('⏰ Configuración en localStorage es muy antigua, ignorando cache');
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }
      
      // 🆕 VALIDACIÓN DE CONTENIDO: Si tiene appName obsoleto, es inválida
      const appName = parsed.branding?.appName;
      if (!appName || appName === 'WorkTecApp' || appName === 'Aplicación' || appName.includes('Sistema')) {
        logger.warn('🗑️ Configuración obsoleta detectada en localStorage, limpiando');
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }
      
      logger.debug('📦 Configuración válida recuperada desde localStorage');
      return parsed;
      
    } catch (error) {
      logger.error('Error leyendo configuración de localStorage:', error);
      localStorage.removeItem(this.STORAGE_KEY); // Limpiar cache corrupto
      return null;
    }
  }

  private saveToLocalStorage(config: InterfaceConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      logger.error('Error guardando configuración en localStorage:', error);
    }
  }

  /**
   * Limpiar configuración local
   */
  clearLocalStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Verificar si hay cambios pendientes de sincronizar (con autenticación)
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async hasUnsyncedChanges(getToken: () => Promise<string | null>): Promise<boolean> {
    try {
      const localConfig = this.getFromLocalStorage();
      const httpService = createAuthenticatedHttpService(getToken);
      const serverConfig = await httpService.get<InterfaceConfig>(`${this.API_BASE}/current/safe`).then(r => r.data);

      if (!localConfig || !serverConfig) return false;

      return JSON.stringify(localConfig) !== JSON.stringify(serverConfig);
    } catch (error) {
      return false;
    }
  }

  /**
   * Sincronizar configuración local con el servidor (con autenticación)
   * @param getToken - Función para obtener token JWT de Clerk
   */
  async syncWithServer(getToken: () => Promise<string | null>): Promise<InterfaceConfig | null> {
    try {
      const localConfig = this.getFromLocalStorage();
      if (!localConfig) return null;

      const httpService = createAuthenticatedHttpService(getToken);
      const response = await httpService.post<InterfaceConfig>(`${this.API_BASE}`, localConfig);
      return response.data;
    } catch (error) {
      logger.error('Error sincronizando con servidor:', error);
      throw error;
    }
  }

  // ========================================
  // SISTEMA CONTEXTUAL - NUEVAS FUNCIONES
  // ========================================

  /**
   * Obtener configuración efectiva para un usuario específico
   * Utiliza jerarquía: user -> role -> org -> global
   * @param userId - ID del usuario
   * @param getToken - Función para obtener token JWT
   */
  async getEffectiveConfig(userId: string, getToken: () => Promise<string | null>): Promise<ContextualConfigResponse | null> {
    try {
      const httpService = createAuthenticatedHttpService(getToken);
      const response = await httpService.get<ContextualConfigResponse>(`/api/contextual-config/effective/${userId}`);
      
      return response.data;
    } catch (error: any) {
      // Si es 404, significa que no hay configuración contextual, usar la global
      if (error?.message?.includes('404') || error?.message?.includes('no encontrado')) {
        logger.debug('No hay configuración contextual para el usuario, usando configuración global');
        return null;
      }
      logger.error('Error obteniendo configuración efectiva:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración específica de un usuario (solo sus preferencias)
   * @param userId - ID del usuario
   * @param getToken - Función para obtener token JWT
   */
  async getUserConfig(userId: string, getToken: () => Promise<string | null>): Promise<InterfaceConfig | null> {
    try {
      const httpService = createAuthenticatedHttpService(getToken);
      const response = await httpService.get<InterfaceConfig>(`/api/contextual-config/user/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('Error obteniendo configuración de usuario:', error);
      return null; // No fallar si el usuario no tiene configuración propia
    }
  }

  /**
   * Guardar preferencias de usuario
   * @param userId - ID del usuario
   * @param preferences - Configuraciones parciales del usuario
   * @param getToken - Función para obtener token JWT
   */
  async saveUserPreferences(userId: string, preferences: Partial<InterfaceConfig>, getToken: () => Promise<string | null>): Promise<InterfaceConfig> {
    try {
      const httpService = createAuthenticatedHttpService(getToken);
      
      // Convertir InterfaceConfig a UserPreferencesDTO que espera el backend
      const userPreferences = {
        user_id: userId,
        theme_mode: preferences.theme?.mode as 'light' | 'dark' | undefined,
        primary_color: preferences.theme?.colors?.primary?.['500'],
        font_size: 'base' as 'sm' | 'base' | 'lg',
        compact_mode: false
      };
      
      await httpService.post<any>(`/api/contextual-config/preferences`, userPreferences);
      logger.info('✅ Preferencias de usuario guardadas');
      
      return preferences as InterfaceConfig;
    } catch (error) {
      logger.error('❌ Error guardando preferencias:', error);
      throw error;
    }
  }

  /**
   * Determinar si un usuario puede modificar configuraciones globales
   * Implementa caché para evitar llamadas redundantes
   * @param getToken - Función para obtener token JWT
   */
  async canModifyGlobalConfig(getToken: () => Promise<string | null>): Promise<boolean> {
    try {
      // Verificar si tenemos un valor cacheado válido
      if (this.permissionsCache) {
        const now = Date.now();
        const cacheAge = now - this.permissionsCache.timestamp;
        
        if (cacheAge < this.CACHE_DURATION) {
          logger.debug(`🎯 Usando permisos desde caché (edad: ${Math.round(cacheAge / 1000)}s)`);
          return this.permissionsCache.can_modify;
        } else {
          logger.debug('⏰ Caché de permisos expirado, recargando...');
        }
      }
      
      // Si no hay caché o expiró, hacer la llamada
      const httpService = createAuthenticatedHttpService(getToken);
      const response = await httpService.get<{ can_modify: boolean }>(`/api/contextual-config/permissions/global`);
      
      // Guardar en caché
      this.permissionsCache = {
        can_modify: response.data.can_modify,
        timestamp: Date.now()
      };
      
      logger.debug(`✅ Permisos globales obtenidos y cacheados: ${response.data.can_modify}`);
      return response.data.can_modify;
    } catch (error) {
      logger.error('Error verificando permisos globales:', error);
      
      // Si falla y tenemos caché, usarlo aunque esté expirado
      if (this.permissionsCache) {
        logger.warn('⚠️ Usando caché de permisos expirado como fallback');
        return this.permissionsCache.can_modify;
      }
      
      return false;
    }
  }
  
  /**
   * Limpiar caché de permisos (útil al cerrar sesión o cambiar contexto)
   */
  clearPermissionsCache(): void {
    this.permissionsCache = null;
    logger.debug('🗑️ Caché de permisos limpiado');
  }

  /**
   * 🆕 LIMPIEZA AUTOMÁTICA AGRESIVA DE CACHE OBSOLETO
   * Se ejecuta automáticamente al instanciar el servicio
   */
  private performAutomaticCacheCleanup(): void {
    if (this.hasRunCacheCleanup) return; // Solo ejecutar una vez
    
    try {
      logger.info('🧹 Iniciando limpieza automática de cache obsoleto...');
      
      // Lista de claves que pueden contener configuración obsoleta
      const obsoleteKeys = [
        'interface-config',
        'interface-config-timestamp',
        'config-cache',
        'user-preferences',
        'permissions-cache-timestamp',
        'user-permissions',
        'theme-config',
        'app-config'
      ];
      
      let itemsRemoved = 0;
      
      // Verificar cada clave y eliminar si contiene datos obsoletos
      obsoleteKeys.forEach(key => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            // Intentar parsear y verificar si es configuración obsoleta
            const parsed = JSON.parse(stored);
            
            // Detectar configuraciones obsoletas por contenido
            const isObsolete = this.isConfigurationObsolete(parsed);
            
            if (isObsolete) {
              localStorage.removeItem(key);
              itemsRemoved++;
              logger.warn(`🗑️ Eliminada configuración obsoleta: ${key}`);
            }
          } catch (e) {
            // Si no se puede parsear, también eliminar
            localStorage.removeItem(key);
            itemsRemoved++;
            logger.warn(`🗑️ Eliminado cache corrupto: ${key}`);
          }
        }
      });
      
      // Limpieza adicional: eliminar cualquier clave que contenga nombres obsoletos
      this.cleanupObsoleteLocalStorageKeys();
      
      if (itemsRemoved > 0) {
        logger.info(`✅ Limpieza completada: ${itemsRemoved} elementos obsoletos eliminados`);
        
        // 🆕 FORZAR RECARGA SI SE ELIMINÓ CACHE CRÍTICO
        const wasUsingObsoleteConfig = itemsRemoved > 0;
        if (wasUsingObsoleteConfig) {
          logger.info('🔄 Configuración obsoleta detectada, preparando recarga...');
          
          // Pequeño delay para que se vean los logs
          setTimeout(() => {
            logger.info('🔄 Recargando para aplicar configuración actualizada...');
            window.location.reload();
          }, 1000);
        }
      } else {
        logger.debug('✅ No se encontró cache obsoleto');
      }
      
      this.hasRunCacheCleanup = true;
      
    } catch (error) {
      logger.error('❌ Error durante limpieza automática:', error);
    }
  }

  /**
   * 🆕 DETECTAR SI UNA CONFIGURACIÓN ES OBSOLETA
   */
  private isConfigurationObsolete(config: any): boolean {
    if (!config || typeof config !== 'object') return true;
    
    // Detectar por nombre de app obsoleto
    const appName = config.branding?.appName || config.appName;
    const obsoleteNames = [
      'WorkTecApp',
      'Aplicación',
      'Sistema en Mantenimiento',
      'Sistema',
      'App',
      'WorkTec Solutions'
    ];
    
    if (appName && obsoleteNames.some(name => appName.includes(name))) {
      logger.warn(`🚨 Configuración obsoleta detectada por appName: "${appName}"`);
      return true;
    }
    
    // Detectar por tema obsoleto
    const themeName = config.theme?.name;
    const obsoleteThemes = [
      'Tema Corporativo',
      'Tema por Defecto',
      'Configuración por Defecto',
      'Configuración de Emergencia'
    ];
    
    if (themeName && obsoleteThemes.some(theme => themeName.includes(theme))) {
      logger.warn(`🚨 Configuración obsoleta detectada por tema: "${themeName}"`);
      return true;
    }
    
    // Detectar por edad (más de 24 horas)
    if (config.updatedAt) {
      const configAge = Date.now() - new Date(config.updatedAt).getTime();
      const MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas
      
      if (configAge > MAX_AGE) {
        logger.warn(`🚨 Configuración obsoleta por edad: ${Math.round(configAge / (60 * 60 * 1000))} horas`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * 🆕 LIMPIAR CLAVES OBSOLETAS DE LOCALSTORAGE
   */
  private cleanupObsoleteLocalStorageKeys(): void {
    try {
      const keysToCheck = Object.keys(localStorage);
      const obsoletePatterns = [
        /worktec/i,
        /work-tec/i,
        /aplicacion/i,
        /app-config/i,
        /old-config/i,
        /backup-config/i
      ];
      
      keysToCheck.forEach(key => {
        const isObsolete = obsoletePatterns.some(pattern => pattern.test(key));
        if (isObsolete) {
          localStorage.removeItem(key);
          logger.warn(`🗑️ Eliminada clave obsoleta: ${key}`);
        }
      });
    } catch (error) {
      logger.error('Error limpiando claves obsoletas:', error);
    }
  }

  /**
   * Método inteligente que decide qué configuración usar según el contexto del usuario
   * @param userId - ID del usuario actual
   * @param getToken - Función para obtener token JWT
   */
  async getConfigForUser(userId: string, getToken: () => Promise<string | null>): Promise<{
    config: InterfaceConfig;
    isGlobalAdmin: boolean;
    source: 'user' | 'role' | 'organization' | 'global' | 'legacy' | 'localStorage';
  }> {
    try {
      const canModifyGlobal = await this.canModifyGlobalConfig(getToken);
      
      if (canModifyGlobal) {
        // 🔧 CORREGIDO: Admin global debe usar MongoDB directamente (/current), no contextual
        logger.info('🔑 Super Admin detectado - usando configuración completa de MongoDB');
        
        try {
          // Usar endpoint /current que da acceso completo a la configuración
          const httpService = createAuthenticatedHttpService(getToken);
          const response = await httpService.get<InterfaceConfig>(`${this.API_BASE}/current`);
          
          if (response.data) {
            logger.info(`✅ Super Admin - Config cargada desde MongoDB: ${response.data.branding?.appName}`);
            this.saveToLocalStorage(response.data); // Cache para offline
            return {
              config: response.data,
              isGlobalAdmin: true,
              source: 'global'
            };
          }
        } catch (mongoError) {
          logger.warn('⚠️ Error accediendo a MongoDB con privilegios admin:', mongoError);
        }
        
        // Fallback: intentar sistema contextual como último recurso
        try {
          const effectiveConfigResponse = await this.getEffectiveConfig(userId, getToken);
          if (effectiveConfigResponse) {
            const sourceType = effectiveConfigResponse.resolved_from.context_type === 'org' ? 'organization' : effectiveConfigResponse.resolved_from.context_type;
            logger.info(`✅ Admin - Config desde contextual: ${sourceType}`);
            return {
              config: effectiveConfigResponse.config,
              isGlobalAdmin: true,
              source: sourceType as 'user' | 'role' | 'organization' | 'global' | 'legacy' | 'localStorage'
            };
          }
        } catch (effectiveError) {
          logger.warn('⚠️ Sistema contextual tampoco disponible para admin');
        }
        
        // Último fallback: localStorage → default
        const localConfig = this.getFromLocalStorage();
        if (localConfig) {
          logger.info('✅ Admin usando config desde localStorage');
          return { config: localConfig, isGlobalAdmin: true, source: 'localStorage' };
        }
        
        logger.warn('⚠️ Admin usando configuración por defecto (último recurso)');
        return { config: DEFAULT_INTERFACE_CONFIG, isGlobalAdmin: true, source: 'global' };
        
      } else {
        // Usuario normal: intentar sistema contextual → configuración segura → localStorage → default
        logger.info('👤 Usuario normal detectado - usando jerarquía contextual');
        
        try {
          const effectiveConfigResponse = await this.getEffectiveConfig(userId, getToken);
          if (effectiveConfigResponse) {
            const sourceType = effectiveConfigResponse.resolved_from.context_type === 'org' ? 'organization' : effectiveConfigResponse.resolved_from.context_type;
            logger.info(`✅ Usuario - Config desde contextual: ${sourceType}`);
            return {
              config: effectiveConfigResponse.config,
              isGlobalAdmin: false,
              source: sourceType as 'user' | 'role' | 'organization' | 'global' | 'legacy' | 'localStorage'
            };
          }
        } catch (effectiveError: any) {
          if (!effectiveError?.message?.includes('404')) {
            logger.warn('⚠️ Error obteniendo configuración efectiva:', effectiveError);
          }
        }
        
        // Fallback: usar configuración global segura (/current/safe)
        try {
          const safeConfig = await this.getCurrentConfig(getToken); // Ya usa /current/safe
          if (safeConfig) {
            logger.info(`✅ Usuario normal - Config segura desde MongoDB: ${safeConfig.branding?.appName}`);
            return {
              config: safeConfig,
              isGlobalAdmin: false,
              source: 'global'
            };
          }
        } catch (globalError) {
          logger.warn('⚠️ No se pudo obtener configuración global segura:', globalError);
        }
      }
      
    } catch (contextualError) {
      logger.warn('⚠️ Error en sistema contextual:', contextualError);
    }
      
    // Fallback final: localStorage → default
    const localConfig = this.getFromLocalStorage();
    if (localConfig) {
      logger.info('✅ Config recuperada desde localStorage');
      return { config: localConfig, isGlobalAdmin: false, source: 'localStorage' };
    }
    
    logger.warn('⚠️ Usando configuración por defecto como último recurso');
    return { config: DEFAULT_INTERFACE_CONFIG, isGlobalAdmin: false, source: 'global' };
  }

  /**
   * Método inteligente para guardar configuración con fallback
   * @param userId - ID del usuario actual
   * @param config - Configuración a guardar
   * @param getToken - Función para obtener token JWT
   */
  async saveConfigForUser(userId: string, config: InterfaceConfig, getToken: () => Promise<string | null>): Promise<InterfaceConfig> {
    try {
      const canModifyGlobal = await this.canModifyGlobalConfig(getToken);
      
      if (canModifyGlobal) {
        // Admin global: guardar en MongoDB usando PATCH /partial
        try {
          const result = await this.saveConfig(getToken, config);
          logger.info('✅ Config global guardada en MongoDB');
          return result;
        } catch (adminError) {
          logger.warn('⚠️ Error guardando en MongoDB, usando localStorage:', adminError);
          this.saveToLocalStorage(config);
          return config;
        }
      } else {
        // Usuario normal: guardar preferencias personales
        const result = await this.saveUserPreferences(userId, config, getToken);
        return result;
      }
      
    } catch (error) {
      logger.warn('⚠️ Error al guardar, usando localStorage como fallback:', error);
      this.saveToLocalStorage(config);
      return config;
    }
  }
}

// Exportar instancia singleton
export const interfaceConfigService = new InterfaceConfigService();