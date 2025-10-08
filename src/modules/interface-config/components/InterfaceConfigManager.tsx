/**
 * Gestor principal de configuración de interfaz
 * Implementa nueva arquitectura modular con servicios especializados
 * REFACTORIZADO: Con skeleton UI y mejor manejo de estados de carga
 */

import React, { useState } from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';
import { InterfaceConfig, PresetConfig } from '../types';
import { DOMConfigService } from '../services/domConfigService';
import { logger } from '../../../shared/utils/logger';

// Importar los componentes existentes
import { ThemeConfigPanel } from './ThemeConfigPanel';
import { LogoConfigPanel } from './LogoConfigPanel';
import { BrandingConfigPanel } from './BrandingConfigPanel';
import { PresetsPanel } from './PresetsPanel';
import { PreviewPanel } from './PreviewPanel';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { ConfigLoadingSkeleton, ConfigLoadErrorUI } from './ConfigLoadingSkeleton';

type ConfigTab = 'theme' | 'logos' | 'branding' | 'presets' | 'preview';

interface InterfaceConfigManagerProps {
  className?: string;
}

/**
 * Gestor principal de configuración de interfaz
 */
export const InterfaceConfigManager: React.FC<InterfaceConfigManagerProps> = ({ className }) => {
  // Estado usando la nueva arquitectura modular
  const { 
    config, 
    presets, 
    loading, 
    error, 
    isDirty, 
    isSaving, 
    isGlobalAdmin, 
    configSource,
    setConfig, 
    saveChanges, 
    discardChanges, 
    forceApplyToDOM,
    hasUnsavedChanges,
    changesSummary 
  } = useInterfaceConfig();
  
  const [activeTab, setActiveTab] = useState<ConfigTab>('theme');
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  // Log para debugging
  React.useEffect(() => {
    logger.debug('🟢 InterfaceConfigManager render:', { 
      isDirty, 
      isSaving, 
      configSource, 
      hasUnsavedChanges,
      changesSummary 
    });
  }, [isDirty, isSaving, configSource, hasUnsavedChanges, changesSummary]);

  // Manejar cambios de configuración
  const handleConfigChange = (updates: Partial<InterfaceConfig>) => {
    logger.debug('🔄 InterfaceConfigManager: handleConfigChange:', updates);
    setConfig(updates);
  };

  // Manejar aplicación de presets
  const handleApplyPreset = async (preset: PresetConfig) => {
    if (isApplyingPreset) {
      logger.warn('⚠️ Ya se está aplicando un preset, ignorando...');
      return;
    }
    
    try {
      setIsApplyingPreset(true);
      logger.info('🎨 Aplicando preset:', preset.name);
      
      // Aplicar configuración del preset
      const presetConfig: InterfaceConfig = {
        ...preset.config,
        id: config.id || 'global-config',
        updatedAt: new Date().toISOString(),
        isActive: true
      };
      
      logger.debug('📝 Preset config a aplicar:', {
        name: presetConfig.theme?.name,
        id: presetConfig.id,
        primaryColor: presetConfig.theme?.colors?.primary?.[500]
      });
      
      // Actualizar configuración (esto usará REPLACE_CONFIG)
      setConfig(presetConfig);
      
      // Esperar para que React procese el cambio
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Forzar aplicación al DOM
      forceApplyToDOM();
      
      // Guardar inmediatamente
      await saveChanges();
      
      // Aplicar DOM nuevamente después de guardar
      setTimeout(() => {
        forceApplyToDOM();
        logger.info('✅ Preset aplicado y guardado:', preset.name);
      }, 100);
      
    } catch (error) {
      logger.error('Error aplicando preset:', error);
    } finally {
      setIsApplyingPreset(false);
    }
  };

  // Manejar guardado
  const handleSave = async () => {
    try {
      await saveChanges();
      // Mostrar feedback visual o notificación aquí si es necesario
    } catch (error) {
      logger.error('Error guardando:', error);
      // Mostrar error al usuario aquí si es necesario
    }
  };

  // Manejar descarte de cambios
  const handleDiscard = () => {
    logger.info('↩️ Descartando cambios...');
    discardChanges();
    // Re-aplicar configuración guardada al DOM
    setTimeout(() => forceApplyToDOM(), 50);
  };

  // Manejar retry de carga
  const handleRetry = () => {
    window.location.reload();
  };

  // Estado de carga con skeleton UI mejorado
  if (loading) {
    return (
      <ConfigLoadingSkeleton 
        variant="full"
        message="Cargando configuración desde el servidor..."
      />
    );
  }

  // Estado de error con opciones de recuperación
  if (error) {
    return (
      <ConfigLoadErrorUI
        error={error}
        onRetry={handleRetry}
        onUseOffline={() => {
          logger.info('Modo offline activado');
          // Implementar lógica de modo offline si es necesario
        }}
      />
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-8 ${className || ''}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-500 text-lg mr-3">⚠️</span>
            <div>
              <h3 className="text-red-800 font-semibold">Error de Configuración</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'theme' as ConfigTab, label: 'Temas y Colores', icon: '🎨' },
    { id: 'logos' as ConfigTab, label: 'Logos', icon: '🖼️' },
    { id: 'branding' as ConfigTab, label: 'Marca', icon: '🏷️' },
    { id: 'presets' as ConfigTab, label: 'Presets', icon: '💾' },
    { id: 'preview' as ConfigTab, label: 'Vista Previa', icon: '👁️' },
    // Tab de migración DESHABILITADO - sistema contextual activo
    // ...(isGlobalAdmin ? [{ id: 'migration' as ConfigTab, label: 'Migración', icon: '🔧' }] : []),
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className || ''}`}>
      {/* Header con estado mejorado */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración de Interfaz</h2>
          <div className="flex items-center space-x-4 mt-2">
            {/* Indicador de tipo de usuario */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isGlobalAdmin 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isGlobalAdmin ? '👑 Admin Global' : '👤 Usuario'}
            </div>
            
            {/* Indicador del sistema de configuración activo */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              configSource === 'user' ? 'bg-green-100 text-green-800' :
              configSource === 'role' ? 'bg-yellow-100 text-yellow-800' :
              configSource === 'organization' ? 'bg-orange-100 text-orange-800' :
              configSource === 'global' ? 'bg-gray-100 text-gray-800' :
              configSource === 'legacy' ? 'bg-amber-100 text-amber-800' :
              configSource === 'localStorage' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              📊 Fuente: {
                configSource === 'user' ? 'Preferencias Personales' :
                configSource === 'role' ? 'Configuración de Rol' :
                configSource === 'organization' ? 'Configuración Organizacional' :
                configSource === 'global' ? 'Configuración Global' :
                configSource === 'legacy' ? '⚠️ Sistema Legacy' :
                configSource === 'localStorage' ? '💾 Solo Local (Sin conexión)' :
                'Configuración Global'
              }
            </div>
            
            {/* Indicador de cambios (nuevo) */}
            {hasUnsavedChanges && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚠️ {changesSummary}
              </div>
            )}
          </div>
        </div>
        <SaveStatusIndicator />
        

      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de los tabs */}
      <div className="p-6">
        {activeTab === 'theme' && (
          <ThemeConfigPanel config={config} onChange={handleConfigChange} />
        )}
        
        {activeTab === 'logos' && (
          <LogoConfigPanel config={config} onChange={handleConfigChange} />
        )}
        
        {activeTab === 'branding' && (
          <BrandingConfigPanel config={config} onChange={handleConfigChange} />
        )}
        
        {activeTab === 'presets' && (
          <PresetsPanel 
            presets={presets} 
            currentConfig={config} 
            onApplyPreset={handleApplyPreset}
            onChange={handleConfigChange}
            isApplyingPreset={isApplyingPreset}
          />
        )}
        
        {activeTab === 'preview' && (
          <PreviewPanel config={config} originalConfig={config} />
        )}
      </div>

      {/* Controles de guardado mejorados (solo si hay cambios) */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <div>
                <span className="text-yellow-800 font-medium">Tienes cambios sin guardar</span>
                <p className="text-yellow-600 text-sm">{changesSummary}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDiscard}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Descartar Cambios
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};