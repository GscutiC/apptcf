/**
 * Componente principal para configuración de interfaz
 */

import React, { useState, useEffect } from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';
import { InterfaceConfig, PresetConfig } from '../types';
import { ThemeConfigPanel } from './ThemeConfigPanel';
import { LogoConfigPanel } from './LogoConfigPanel';
import { BrandingConfigPanel } from './BrandingConfigPanel';
import { PreviewPanel } from './PreviewPanel';
import { PresetsPanel } from './PresetsPanel';

type ConfigTab = 'theme' | 'logos' | 'branding' | 'presets' | 'preview';

interface InterfaceConfigManagerProps {
  className?: string;
}

export const InterfaceConfigManager: React.FC<InterfaceConfigManagerProps> = ({ className }) => {
  const { config, setConfig, applyConfig, updatePartialConfig, presets, loading, error } = useInterfaceConfig();
  const [activeTab, setActiveTab] = useState<ConfigTab>('theme');
  const [localConfig, setLocalConfig] = useState<InterfaceConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar configuración local con el contexto
  useEffect(() => {
    setLocalConfig(config);
    setHasChanges(false);
  }, [config]);

  // Detectar cambios en la configuración local
  useEffect(() => {
    const configsAreEqual = JSON.stringify(localConfig) === JSON.stringify(config);
    setHasChanges(!configsAreEqual);
  }, [localConfig, config]);

  const handleConfigChange = (updates: Partial<InterfaceConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    // Aplicar cambios inmediatamente para vista previa en tiempo real
    setConfig(newConfig);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Obtener solo los cambios del módulo actual
      const moduleChanges = getModuleSpecificChanges(activeTab, config, localConfig);
      
      if (Object.keys(moduleChanges).length > 0) {
        try {
          // Usar actualización parcial para preservar otros módulos
          await updatePartialConfig(moduleChanges);
        } catch (partialError) {
          // Fallback: usar guardado completo
          await applyConfig(localConfig);
        }
      } else {
        // Si no hay cambios de módulo específico, guardar toda la configuración
        // (para casos edge donde la detección modular falle)
        await applyConfig(localConfig);
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error guardando los cambios. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Función para obtener solo los cambios del módulo específico
  const getModuleSpecificChanges = (
    tab: ConfigTab, 
    original: InterfaceConfig, 
    updated: InterfaceConfig
  ): Partial<InterfaceConfig> => {
    const changes: Partial<InterfaceConfig> = {};
    
    switch (tab) {
      case 'theme':
        if (JSON.stringify(original.theme) !== JSON.stringify(updated.theme)) {
          changes.theme = updated.theme;
        }
        break;
        
      case 'logos':
        if (JSON.stringify(original.logos) !== JSON.stringify(updated.logos)) {
          changes.logos = updated.logos;
        }
        break;
        
      case 'branding':
        if (JSON.stringify(original.branding) !== JSON.stringify(updated.branding)) {
          changes.branding = updated.branding;
        }
        break;
        
      case 'presets':
        // Los presets no guardan cambios directamente, aplican configuraciones
        break;
        
      case 'preview':
        // La vista previa no guarda cambios
        break;
        
      default:
        break;
    }
    
    return changes;
  };

  // Función auxiliar para obtener el nombre legible del módulo
  const getModuleName = (tab: ConfigTab): string => {
    const names = {
      'theme': 'Temas y Colores',
      'logos': 'Logos',
      'branding': 'Branding',
      'presets': 'Plantillas',
      'preview': 'Vista Previa'
    };
    return names[tab] || tab;
  };

  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
    // Aplicar la configuración original inmediatamente
    setConfig(config);
  };

  const handlePreviewChanges = () => {
    // Los cambios ya se aplican automáticamente en tiempo real
    // Esta función ya no es necesaria pero se mantiene por compatibilidad
    setConfig(localConfig);
  };

  const tabs = [
    { id: 'theme' as ConfigTab, label: 'Temas y Colores', icon: '🎨', description: 'Configurar colores y estilos' },
    { id: 'logos' as ConfigTab, label: 'Logos', icon: '🖼️', description: 'Configurar logos y favicon' },
    { id: 'branding' as ConfigTab, label: 'Branding', icon: '🏷️', description: 'Configurar textos y marca' },
    { id: 'presets' as ConfigTab, label: 'Plantillas', icon: '📁', description: 'Plantillas predefinidas' },
    { id: 'preview' as ConfigTab, label: 'Vista Previa', icon: '👁️', description: 'Previsualizar cambios' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-neutral-600">Cargando configuración...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error de Configuración</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Configuración de Interfaz</h1>
            <p className="text-neutral-600">Personaliza el diseño y la apariencia de la aplicación</p>
          </div>
          
          {/* Acciones principales */}
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <>
                <button
                  onClick={handlePreviewChanges}
                  className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Vista Previa
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Descartar
                </button>
              </>
            )}
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                hasChanges && !isSaving
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                `Guardar ${getModuleName(activeTab)}`
              )}
            </button>
          </div>
        </div>

        {/* Indicador de cambios específicos del módulo */}
        {hasChanges && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-amber-600 mr-2">⚠️</span>
              <span className="text-sm text-amber-800">
                Tienes cambios sin guardar en <strong>{getModuleName(activeTab)}</strong>. 
                Haz clic en "Guardar Cambios" para aplicar solo estos cambios.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navegación por pestañas */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
              }`}
              title={tab.description}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="p-6">
        {activeTab === 'theme' && (
          <ThemeConfigPanel
            config={localConfig}
            onChange={handleConfigChange}
          />
        )}
        
        {activeTab === 'logos' && (
          <LogoConfigPanel
            config={localConfig}
            onChange={handleConfigChange}
          />
        )}
        
        {activeTab === 'branding' && (
          <BrandingConfigPanel
            config={localConfig}
            onChange={handleConfigChange}
          />
        )}
        
        {activeTab === 'presets' && (
          <PresetsPanel
            currentConfig={localConfig}
            presets={presets}
            onApplyPreset={(preset: PresetConfig) => {
              // Preservar configuración de logos y branding existente
              const mergedConfig: InterfaceConfig = {
                ...preset.config,
                logos: localConfig.logos, // Mantener logos existentes
                branding: localConfig.branding, // Mantener branding existente
                // Solo aplicar tema del preset
                theme: preset.config.theme
              };
              setLocalConfig(mergedConfig);
            }}
          />
        )}
        
        {activeTab === 'preview' && (
          <PreviewPanel
            config={localConfig}
            originalConfig={config}
          />
        )}
      </div>
    </div>
  );
};