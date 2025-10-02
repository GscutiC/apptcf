/**
 * Componente principal para configuración de interfaz - Versión simplificada
 */

import React, { useState } from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';
import { InterfaceConfig, PresetConfig } from '../types';
import { ThemeConfigPanel } from './ThemeConfigPanel';
import { LogoConfigPanel } from './LogoConfigPanel';
import { BrandingConfigPanel } from './BrandingConfigPanel';
import { PreviewPanel } from './PreviewPanel';
import { PresetsPanel } from './PresetsPanel';
import { SaveStatusIndicator } from './SaveStatusIndicator';

type ConfigTab = 'theme' | 'logos' | 'branding' | 'presets' | 'preview';

interface InterfaceConfigManagerProps {
  className?: string;
}

export const InterfaceConfigManager: React.FC<InterfaceConfigManagerProps> = ({ className }) => {
  const { config, setConfig, saveChanges, discardChanges, presets, loading, error, isDirty, isSaving } = useInterfaceConfig();
  const [activeTab, setActiveTab] = useState<ConfigTab>('theme');
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  // Manejar cambios de configuración directamente en el contexto
  const handleConfigChange = (updates: Partial<InterfaceConfig>) => {
    setConfig(updates);
  };

  // Manejar aplicación de presets con protección contra re-renders múltiples
  const handleApplyPreset = async (preset: PresetConfig) => {
    // Evitar aplicaciones múltiples simultáneas
    if (isApplyingPreset) {
      console.log('⚠️ Ya se está aplicando un preset, ignorando...');
      return;
    }
    
    try {
      setIsApplyingPreset(true);
      console.log('🎨 Aplicando preset:', preset.name);
      
      // Aplicar configuración del preset completamente (reemplazar todo, no merge)
      const presetConfig = {
        ...preset.config,
        id: config.id || 'global-config', // Mantener ID si existe
        updatedAt: new Date().toISOString(),
        isActive: true
      };
      
      // Actualizar configuración en el contexto
      setConfig(presetConfig);
      
      // Guardar inmediatamente
      await saveChanges();
      console.log('✅ Preset aplicado y guardado exitosamente');
      
    } catch (error) {
      console.error('❌ Error aplicando preset:', error);
      // Revertir si falla el guardado
      try {
        discardChanges();
      } catch (revertError) {
        console.error('❌ Error revirtiendo cambios:', revertError);
      }
    } finally {
      // Liberar el lock después de un breve delay
      setTimeout(() => {
        setIsApplyingPreset(false);
        console.log('🔓 Preset application lock released');
      }, 1000);
    }
  };

  const handleSave = async () => {
    try {
      await saveChanges();
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  };

  const handleDiscard = () => {
    discardChanges();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error de configuración</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  const tabs = [
    { id: 'theme' as ConfigTab, label: 'Temas y Colores', icon: '🎨' },
    { id: 'logos' as ConfigTab, label: 'Logos', icon: '🖼️' },
    { id: 'branding' as ConfigTab, label: 'Marca', icon: '🏢' },
    { id: 'presets' as ConfigTab, label: 'Presets', icon: '💾' },
    { id: 'preview' as ConfigTab, label: 'Vista Previa', icon: '👁️' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className || ''}`}>
      {/* Header con estado */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Configuración de Interfaz</h2>
        <SaveStatusIndicator />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
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

      {/* Contenido */}
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
            isApplyingPreset={isApplyingPreset}
          />
        )}
        
        {activeTab === 'preview' && (
          <PreviewPanel config={config} originalConfig={config} />
        )}
      </div>

      {/* Controles de guardado (solo si hay cambios) */}
      {isDirty && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-800 font-medium">Tienes cambios sin guardar</span>
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
                    <span>Guardar Todos los Cambios</span>
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