/**
 * Servicio para la configuración de interfaz
 * Implementa autenticación con Clerk siguiendo el patrón del módulo user-management
 */

import { InterfaceConfig, PresetConfig } from '../types';
import { SYSTEM_PRESETS, DEFAULT_INTERFACE_CONFIG } from '../utils/defaultConfigs';
import { createAuthenticatedHttpService } from './httpService';
import { logger } from '../../../shared/utils/logger';

// Tipos para el sistema contextual
export interface ContextualConfigResponse {
  config: InterfaceConfig;
  context: {
    source: 'user' | 'role' | 'organization' | 'global';
    source_id: string;
    has_user_preferences: boolean;
    effective_permissions: string[];
  };
  metadata: {
    user_id: string;
    resolved_at: string;
    cache_key: string;
  };
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

      if (response.data) {
        return response.data;
      }

      // Si no hay data, usar presets del sistema
      return SYSTEM_PRESETS;
    } catch (error) {
      logger.warn('Error obteniendo presets del servidor, usando presets del sistema:', error);
      return SYSTEM_PRESETS;
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
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      logger.error('Error leyendo configuración de localStorage:', error);
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
        primary_color: preferences.theme?.colors?.primary?.['500'], // Color principal
        font_size: 'base' as 'sm' | 'base' | 'lg', // Por defecto base
        compact_mode: false // Por defecto false
      };
      
      logger.debug('📤 Enviando preferencias al backend:', userPreferences);
      
      const response = await httpService.post<any>(`/api/contextual-config/preferences`, userPreferences);
      
      // El backend devuelve la configuración completa, necesitamos adaptarla
      return preferences as InterfaceConfig; // Por ahora devolver lo que enviamos
    } catch (error) {
      logger.error('Error guardando preferencias de usuario:', error);
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
   * Método inteligente que decide qué configuración usar según el contexto del usuario
   * @param userId - ID del usuario actual
   * @param getToken - Función para obtener token JWT
   */
  async getConfigForUser(userId: string, getToken: () => Promise<string | null>): Promise<{
    config: InterfaceConfig;
    isGlobalAdmin: boolean;
    source: 'user' | 'role' | 'organization' | 'global' | 'legacy' | 'localStorage';
  }> {
    logger.debug('🔄 Obteniendo configuración para usuario...');
    
    try {
      // ESTRATEGIA 1: Sistema contextual
      logger.debug('📡 Probando sistema contextual...');
      
      const canModifyGlobal = await this.canModifyGlobalConfig(getToken);
      
      if (canModifyGlobal) {
        // Es admin global, intentar obtener configuración efectiva primero
        logger.debug('👑 Admin detectado - obteniendo configuración efectiva...');
        try {
          const effectiveConfigResponse = await this.getEffectiveConfig(userId, getToken);
          if (effectiveConfigResponse) {
            logger.info(`✅ Configuración cargada desde: ${effectiveConfigResponse.context.source}`);
            return {
              config: effectiveConfigResponse.config,
              isGlobalAdmin: true,
              source: effectiveConfigResponse.context.source
            };
          }
        } catch (effectiveError) {
          logger.debug('⚠️ No se pudo obtener configuración efectiva para admin, usando default');
        }
        
        // Fallback para admin: usar configuración por defecto
        return {
          config: DEFAULT_INTERFACE_CONFIG,
          isGlobalAdmin: true,
          source: 'global'
        };
      } else {
        // Usuario normal, obtener configuración efectiva
        logger.debug('👤 Obteniendo configuración efectiva (usuario)...');
        try {
          const effectiveConfigResponse = await this.getEffectiveConfig(userId, getToken);
          if (effectiveConfigResponse) {
            logger.info(`✅ Configuración cargada desde: ${effectiveConfigResponse.context.source}`);
            return {
              config: effectiveConfigResponse.config,
              isGlobalAdmin: false,
              source: effectiveConfigResponse.context.source
            };
          }
        } catch (effectiveError: any) {
          // Si es 404, es normal - el usuario no tiene configuración personalizada
          if (effectiveError?.message?.includes('404') || effectiveError?.message?.includes('no encontrado')) {
            logger.debug('📝 Usuario sin configuración personalizada, usando configuración global');
          } else {
            logger.debug('⚠️ Error obteniendo configuración efectiva:', effectiveError);
          }
        }
      }
      
    } catch (contextualError) {
      logger.warn('⚠️ Sistema contextual falló, usando localStorage:', contextualError);
      
      // ESTRATEGIA 2: localStorage como fallback seguro
      logger.debug('🔄 Intentando localStorage...');
      const localConfig = this.getFromLocalStorage();
      if (localConfig) {
        logger.info('✅ Configuración recuperada desde localStorage');
        return {
          config: localConfig,
          isGlobalAdmin: false,
          source: 'localStorage'
        };
      }
    }
    
    // ESTRATEGIA 3: Configuración por defecto como último recurso
    logger.warn('🆘 Usando configuración por defecto como último recurso');
    return {
      config: DEFAULT_INTERFACE_CONFIG,
      isGlobalAdmin: false,
      source: 'localStorage'
    };
  }

  /**
   * Método inteligente para guardar configuración con fallback
   * @param userId - ID del usuario actual
   * @param config - Configuración a guardar
   * @param getToken - Función para obtener token JWT
   */
  async saveConfigForUser(userId: string, config: InterfaceConfig, getToken: () => Promise<string | null>): Promise<InterfaceConfig> {
    logger.info('🔄 Intentando guardar configuración contextual...');
    
    try {
      // ESTRATEGIA 1: Intentar sistema contextual
      logger.info('📡 Probando sistema contextual...');
      
      const canModifyGlobal = await this.canModifyGlobalConfig(getToken);
      logger.info(`🔑 Permisos globales: ${canModifyGlobal}`);
      
      if (canModifyGlobal) {
        // Es admin global, intentar guardar preferencias personales contextuales
        logger.info('👑 Admin detectado - guardando preferencias personales (contextual)');
        try {
          const result = await this.saveUserPreferences(userId, config, getToken);
          return result;
        } catch (adminError) {
          logger.warn('⚠️ Error guardando preferencias de admin:', adminError);
          // Fallback: guardar en localStorage
          this.saveToLocalStorage(config);
          return config;
        }
      } else {
        // Usuario normal, guardar como preferencias de usuario
        logger.info('👤 Usuario normal - guardando preferencias personales');
        const result = await this.saveUserPreferences(userId, config, getToken);
        return result;
      }
      
    } catch (contextualError) {
      logger.warn('⚠️ Sistema contextual falló, guardando en localStorage:', contextualError);
      
      // ESTRATEGIA 2: Guardar en localStorage como fallback seguro
      logger.info('💾 Guardando configuración en localStorage como fallback');
      this.saveToLocalStorage(config);
      return config;
    }
  }
}

// Exportar instancia singleton
export const interfaceConfigService = new InterfaceConfigService();