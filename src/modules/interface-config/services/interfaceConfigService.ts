/**
 * Servicio para la configuración de interfaz
 */

import { InterfaceConfig, PresetConfig } from '../types';
import { SYSTEM_PRESETS, DEFAULT_INTERFACE_CONFIG } from '../utils/defaultConfigs';
import { httpService } from './httpService';

class InterfaceConfigService {
  private readonly STORAGE_KEY = 'interface-config';
  private readonly API_BASE = '/api/interface-config';

  /**
   * Obtener la configuración actual (mejorada con mejor sincronización)
   */
  async getCurrentConfig(): Promise<InterfaceConfig | null> {
    try {
      console.log('📡 Intentando obtener configuración del servidor...');
      
      // Primero intentar obtener del servidor
      const response = await httpService.get<InterfaceConfig>(`${this.API_BASE}/current`);
      if (response.data) {
        console.log('✅ Configuración cargada desde el servidor:', response.data.theme?.name);
        
        // Guardar en localStorage como respaldo y sincronización
        this.saveToLocalStorage(response.data);
        return response.data;
      }
    } catch (error) {
      console.warn('⚠️ Error obteniendo configuración del servidor, usando localStorage como fallback:', error);
    }
    
    // Si falla el servidor, usar localStorage
    console.log('📂 Intentando cargar desde localStorage...');
    const savedConfig = this.getFromLocalStorage();
    
    if (savedConfig) {
      console.log('✅ Configuración cargada desde localStorage:', savedConfig.theme?.name);
      // Intentar sincronizar en segundo plano (sin bloquear)
      this.syncInBackground(savedConfig);
      return savedConfig;
    }
    
    console.log('ℹ️ No hay configuración guardada, retornando null');
    return null;
  }
  
  /**
   * Sincronización en segundo plano (no bloquea la UI)
   */
  private async syncInBackground(config: InterfaceConfig): Promise<void> {
    try {
      console.log('🔄 Sincronizando configuración en segundo plano...');
      await httpService.post<InterfaceConfig>(`${this.API_BASE}`, config);
      console.log('✅ Sincronización completada en segundo plano');
    } catch (error) {
      console.warn('⚠️ Sincronización en segundo plano falló (no crítico):', error);
      // No lanzar error, es solo sincronización en background
    }
  }

  /**
   * Guardar configuración (mejorado con mejor manejo de errores)
   */
  async saveConfig(config: InterfaceConfig): Promise<InterfaceConfig> {
    const configWithTimestamp = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    
    try {
      console.log('💾 Guardando configuración:', configWithTimestamp.theme?.name);
      
      // PASO 1: Guardar en localStorage PRIMERO (respuesta inmediata)
      this.saveToLocalStorage(configWithTimestamp);
      console.log('✅ Configuración guardada en localStorage');
      
      // PASO 2: Intentar guardar en el servidor
      try {
        const response = await httpService.post<InterfaceConfig>(`${this.API_BASE}`, configWithTimestamp);
        
        if (response.data) {
          // Actualizar localStorage con respuesta del servidor (puede tener más datos)
          this.saveToLocalStorage(response.data);
          console.log('✅ Configuración guardada en servidor y sincronizada');
          return response.data;
        }
      } catch (serverError) {
        // Si falla el servidor, NO es crítico - ya tenemos localStorage
        console.warn('⚠️ Guardado en servidor falló, pero localStorage está actualizado:', serverError);
        // Retornar la configuración con timestamp que sí guardamos localmente
      }
      
      // Retornar configuración guardada (aunque sea solo en localStorage)
      return configWithTimestamp;
      
    } catch (error) {
      console.error('❌ Error crítico guardando configuración:', error);
      
      // Intentar recuperar de localStorage como fallback
      const recoveredConfig = this.getFromLocalStorage();
      if (recoveredConfig) {
        console.log('🔄 Usando configuración recuperada de localStorage');
        return recoveredConfig;
      }
      
      throw new Error('Error guardando configuración y no se pudo recuperar');
    }
  }

  /**
   * Obtener presets disponibles
   */
  async getPresets(): Promise<PresetConfig[]> {
    try {
      // Intentar obtener presets del servidor
      const response = await httpService.get<PresetConfig[]>(`${this.API_BASE}/presets`);
      
      if (response.data) {
        console.log('✅ Presets cargados desde el servidor:', response.data);
        return response.data;
      }
      
      // Si no hay data, usar presets del sistema
      console.log('⚠️ Sin presets del servidor, usando presets del sistema');
      return SYSTEM_PRESETS;
    } catch (error) {
      console.warn('❌ Error obteniendo presets del servidor, usando presets del sistema:', error);
      return SYSTEM_PRESETS;
    }
  }

  /**
   * Crear preset personalizado
   */
  async createPreset(name: string, description: string, config: InterfaceConfig): Promise<PresetConfig> {
    try {
      const presetData = {
        name,
        description,
        config,
        isDefault: false,
        isSystem: false,
      };
      
      const response = await httpService.post<PresetConfig>(`${this.API_BASE}/presets`, presetData);
      return response.data;
    } catch (error) {
      console.error('Error creando preset:', error);
      throw new Error('No se pudo crear el preset personalizado');
    }
  }

  /**
   * Eliminar preset personalizado
   */
  async deletePreset(presetId: string): Promise<void> {
    try {
      await httpService.delete(`${this.API_BASE}/presets/${presetId}`);
    } catch (error) {
      console.error('Error eliminando preset:', error);
      throw new Error('No se pudo eliminar el preset');
    }
  }

  /**
   * Aplicar preset
   */
  async applyPreset(presetId: string): Promise<InterfaceConfig> {
    try {
      // Intentar usar el endpoint específico para aplicar preset
      const response = await httpService.post<any>(`${this.API_BASE}/presets/${presetId}/apply`);
      
      if (response.data && response.data.config) {
        // También guardar en localStorage como backup
        this.saveToLocalStorage(response.data.config);
        console.log('✅ Preset aplicado exitosamente:', response.data.message);
        return response.data.config;
      }
    } catch (error) {
      console.warn('❌ Error aplicando preset en servidor, usando método local:', error);
    }
    
    // Fallback: método local
    const presets = await this.getPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
      throw new Error('Preset no encontrado');
    }
    
    console.log('🔄 Aplicando preset localmente:', preset.name);
    return this.saveConfig(preset.config);
  }

  /**
   * Resetear a configuración por defecto
   */
  async resetToDefault(): Promise<InterfaceConfig> {
    return this.saveConfig(DEFAULT_INTERFACE_CONFIG);
  }

  /**
   * Exportar configuración actual
   */
  async exportConfig(): Promise<string> {
    const config = await this.getCurrentConfig();
    return JSON.stringify(config || DEFAULT_INTERFACE_CONFIG, null, 2);
  }

  /**
   * Importar configuración desde JSON
   */
  async importConfig(configJson: string): Promise<InterfaceConfig> {
    try {
      const config = JSON.parse(configJson) as InterfaceConfig;
      
      // Validar estructura básica
      if (!config.theme || !config.branding || !config.logos) {
        throw new Error('Formato de configuración inválido');
      }
      
      return this.saveConfig(config);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('JSON inválido');
      }
      throw error;
    }
  }

  /**
   * Obtener historial de cambios (si está disponible en el servidor)
   */
  async getConfigHistory(limit: number = 10): Promise<InterfaceConfig[]> {
    try {
      const response = await httpService.get<InterfaceConfig[]>(`${this.API_BASE}/history?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.warn('Historial no disponible:', error);
      return [];
    }
  }

  // Métodos privados para localStorage

  private getFromLocalStorage(): InterfaceConfig | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error leyendo configuración de localStorage:', error);
      return null;
    }
  }

  private saveToLocalStorage(config: InterfaceConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error guardando configuración en localStorage:', error);
    }
  }

  /**
   * Limpiar configuración local
   */
  clearLocalStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Verificar si hay cambios pendientes de sincronizar
   */
  async hasUnsyncedChanges(): Promise<boolean> {
    try {
      const localConfig = this.getFromLocalStorage();
      const serverConfig = await httpService.get<InterfaceConfig>(`${this.API_BASE}/current`).then(r => r.data);
      
      if (!localConfig || !serverConfig) return false;
      
      return JSON.stringify(localConfig) !== JSON.stringify(serverConfig);
    } catch (error) {
      return false;
    }
  }

  /**
   * Sincronizar configuración local con el servidor
   */
  async syncWithServer(): Promise<InterfaceConfig | null> {
    try {
      const localConfig = this.getFromLocalStorage();
      if (!localConfig) return null;
      
      const response = await httpService.post<InterfaceConfig>(`${this.API_BASE}`, localConfig);
      return response.data;
    } catch (error) {
      console.error('Error sincronizando con servidor:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const interfaceConfigService = new InterfaceConfigService();