/**
 * Servicio para edición y gestión avanzada de presets
 * Proporciona funcionalidades de CRUD completo para plantillas
 */

import axios from 'axios';
import { PresetConfig, InterfaceConfig, ColorConfig } from '../types';
import { interfaceConfigService } from './interfaceConfigService';
import { logger } from '../../../shared/utils/logger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Servicio para gestión avanzada de presets
 */
class PresetEditService {
  /**
   * Obtener un preset específico por ID
   */
  async getPreset(
    getToken: () => Promise<string | null>,
    presetId: string
  ): Promise<PresetConfig> {
    try {
      logger.info(`🔍 Obteniendo preset: ${presetId}`);
      
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/api/interface-config/presets/${presetId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      logger.info(`✅ Preset obtenido: ${response.data.name}`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error obteniendo preset ${presetId}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar preset completo (nombre, descripción, configuración)
   * @param getToken - Función para obtener token JWT
   * @param presetId - ID del preset a actualizar
   * @param updates - Objeto con campos a actualizar (puede ser parcial)
   * @returns Preset actualizado
   */
  async updatePreset(
    getToken: () => Promise<string | null>,
    presetId: string,
    updates: {
      name: string;
      description: string;
      config: InterfaceConfig;
      isDefault?: boolean;
    }
  ): Promise<PresetConfig> {
    try {
      logger.info(`✏️ Actualizando preset: ${presetId}`);
      logger.debug('Updates:', { name: updates.name, description: updates.description });
      
      const token = await getToken();
      const response = await axios.put(
        `${API_URL}/api/interface-config/presets/${presetId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`✅ Preset actualizado exitosamente: ${response.data.name}`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Error actualizando preset ${presetId}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar solo colores de un preset (mantiene el resto igual)
   * @param getToken - Función para obtener token JWT
   * @param presetId - ID del preset
   * @param colors - Nueva configuración de colores
   * @returns Preset actualizado
   */
  async updatePresetColors(
    getToken: () => Promise<string | null>,
    presetId: string,
    colors: ColorConfig
  ): Promise<PresetConfig> {
    try {
      logger.info(`🎨 Actualizando colores del preset: ${presetId}`);
      
      // 1. Obtener preset actual
      const currentPreset = await this.getPreset(getToken, presetId);
      
      // 2. Actualizar solo los colores en la configuración
      const updatedConfig: InterfaceConfig = {
        ...currentPreset.config,
        theme: {
          ...currentPreset.config.theme,
          colors: colors,
        },
      };

      // 3. Guardar preset con la nueva configuración
      return this.updatePreset(getToken, presetId, {
        name: currentPreset.name,
        description: currentPreset.description,
        config: updatedConfig,
        isDefault: currentPreset.isDefault,
      });
    } catch (error) {
      logger.error(`❌ Error actualizando colores del preset ${presetId}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar solo información básica (nombre y descripción)
   * @param getToken - Función para obtener token JWT
   * @param presetId - ID del preset
   * @param name - Nuevo nombre
   * @param description - Nueva descripción
   * @returns Preset actualizado
   */
  async updatePresetInfo(
    getToken: () => Promise<string | null>,
    presetId: string,
    name: string,
    description: string
  ): Promise<PresetConfig> {
    try {
      logger.info(`📝 Actualizando info del preset: ${presetId}`);
      
      // Obtener preset actual
      const currentPreset = await this.getPreset(getToken, presetId);
      
      // Actualizar solo nombre y descripción
      return this.updatePreset(getToken, presetId, {
        name,
        description,
        config: currentPreset.config,
        isDefault: currentPreset.isDefault,
      });
    } catch (error) {
      logger.error(`❌ Error actualizando info del preset ${presetId}:`, error);
      throw error;
    }
  }

  /**
   * Clonar preset para crear uno nuevo basado en existente
   * @param getToken - Función para obtener token JWT
   * @param sourcePresetId - ID del preset a clonar
   * @param newName - Nombre para el nuevo preset
   * @param newDescription - Descripción para el nuevo preset (opcional)
   * @returns Nuevo preset creado
   */
  async clonePreset(
    getToken: () => Promise<string | null>,
    sourcePresetId: string,
    newName: string,
    newDescription?: string
  ): Promise<PresetConfig> {
    try {
      logger.info(`📋 Clonando preset: ${sourcePresetId} → ${newName}`);
      
      // 1. Obtener preset original
      const sourcePreset = await this.getPreset(getToken, sourcePresetId);
      
      // 2. Crear nuevo preset con la misma configuración
      const clonedPreset = await interfaceConfigService.createPreset(
        getToken,
        newName,
        newDescription || `Copia de ${sourcePreset.name}`,
        sourcePreset.config
      );

      logger.info(`✅ Preset clonado exitosamente: ${clonedPreset.name}`);
      return clonedPreset;
    } catch (error) {
      logger.error(`❌ Error clonando preset ${sourcePresetId}:`, error);
      throw error;
    }
  }

  /**
   * Marcar/desmarcar preset como predeterminado
   * @param getToken - Función para obtener token JWT
   * @param presetId - ID del preset
   * @param isDefault - true para marcar como default, false para desmarcar
   * @returns Preset actualizado
   */
  async setPresetDefault(
    getToken: () => Promise<string | null>,
    presetId: string,
    isDefault: boolean
  ): Promise<PresetConfig> {
    try {
      logger.info(`${isDefault ? '⭐' : '☆'} Cambiando estado default del preset: ${presetId}`);
      
      // Obtener preset actual
      const currentPreset = await this.getPreset(getToken, presetId);
      
      // Actualizar solo el flag isDefault
      return this.updatePreset(getToken, presetId, {
        name: currentPreset.name,
        description: currentPreset.description,
        config: currentPreset.config,
        isDefault,
      });
    } catch (error) {
      logger.error(`❌ Error cambiando default del preset ${presetId}:`, error);
      throw error;
    }
  }

  /**
   * Validar si un preset puede ser editado
   * Los presets del sistema no pueden ser editados
   * @param preset - Preset a validar
   * @returns true si puede editarse, false si no
   */
  canEditPreset(preset: PresetConfig): boolean {
    return !preset.isSystem;
  }

  /**
   * Validar si un preset puede ser eliminado
   * Los presets del sistema no pueden ser eliminados
   * @param preset - Preset a validar
   * @returns true si puede eliminarse, false si no
   */
  canDeletePreset(preset: PresetConfig): boolean {
    return !preset.isSystem;
  }
}

// Exportar instancia singleton
export const presetEditService = new PresetEditService();

// Exportar funciones helper para uso directo
export const getPreset = (getToken: () => Promise<string | null>, presetId: string) =>
  presetEditService.getPreset(getToken, presetId);

export const updatePreset = (
  getToken: () => Promise<string | null>,
  presetId: string,
  updates: { name: string; description: string; config: InterfaceConfig; isDefault?: boolean }
) => presetEditService.updatePreset(getToken, presetId, updates);

export const updatePresetColors = (
  getToken: () => Promise<string | null>,
  presetId: string,
  colors: ColorConfig
) => presetEditService.updatePresetColors(getToken, presetId, colors);

export const clonePreset = (
  getToken: () => Promise<string | null>,
  sourcePresetId: string,
  newName: string,
  newDescription?: string
) => presetEditService.clonePreset(getToken, sourcePresetId, newName, newDescription);
