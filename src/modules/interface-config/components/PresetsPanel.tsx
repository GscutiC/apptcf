/**
 * Panel de manejo de presets/plantillas de configuración
 */

import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { InterfaceConfig, PresetConfig } from '../types';
import { interfaceConfigService } from '../services/interfaceConfigService';
import { PresetEditModal } from './PresetEditModal';

interface PresetsPanelProps {
  currentConfig: InterfaceConfig;
  presets: PresetConfig[];
  onApplyPreset: (preset: PresetConfig) => void;
  onPresetCreated?: () => void; // Callback para recargar presets
  isApplyingPreset?: boolean;
  onChange?: (updates: Partial<InterfaceConfig>) => void;
}

interface PresetCardProps {
  preset: PresetConfig;
  isActive?: boolean;
  onApply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isApplyingPreset?: boolean;
}

const PresetCard: React.FC<PresetCardProps> = ({ preset, isActive, onApply, onEdit, onDelete, isApplyingPreset = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isActive 
        ? 'border-primary-500 bg-primary-50' 
        : 'border-neutral-200 bg-white hover:border-neutral-300'
    }`}>
      {/* Header del preset */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-neutral-800 flex items-center">
            {preset.name}
            {preset.isSystem && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                Sistema
              </span>
            )}
            {preset.isDefault && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                Por defecto
              </span>
            )}
            {isActive && (
              <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                Actual
              </span>
            )}
          </h4>
          <p className="text-sm text-neutral-600 mt-1">{preset.description}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="text-neutral-500 hover:text-neutral-700 p-1"
            title="Ver detalles"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
          
          {!preset.isSystem && onEdit && (
            <button
              onClick={onEdit}
              className="text-blue-500 hover:text-blue-700 p-1"
              title="Editar preset"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
          
          {!preset.isSystem && onDelete && (
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 p-1"
              title="Eliminar preset"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Vista previa de colores */}
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-xs text-neutral-500">Colores:</span>
        <div className="flex space-x-1">
          <div 
            className="w-4 h-4 rounded border border-neutral-300"
            style={{ backgroundColor: preset.config.theme.colors.primary['500'] }}
            title="Primario"
          />
          <div 
            className="w-4 h-4 rounded border border-neutral-300"
            style={{ backgroundColor: preset.config.theme.colors.secondary['500'] }}
            title="Secundario"
          />
          <div 
            className="w-4 h-4 rounded border border-neutral-300"
            style={{ backgroundColor: preset.config.theme.colors.accent['500'] }}
            title="Acento"
          />
        </div>
        <span className="text-xs text-neutral-500 ml-2">
          {preset.config.theme.mode === 'dark' ? '🌙' : '☀️'} {preset.config.theme.name}
        </span>
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-neutral-200 space-y-2 text-sm">
          <div>
            <span className="font-medium text-neutral-700">App: </span>
            <span className="text-neutral-600">{preset.config.branding.appName}</span>
          </div>
          <div>
            <span className="font-medium text-neutral-700">Logo: </span>
            <span className="text-neutral-600">{preset.config.logos.mainLogo.text}</span>
          </div>
          {preset.config.branding.tagline && (
            <div>
              <span className="font-medium text-neutral-700">Eslogan: </span>
              <span className="text-neutral-600 italic">"{preset.config.branding.tagline}"</span>
            </div>
          )}
          <div className="text-xs text-neutral-500">
            Creado: {new Date(preset.config.createdAt || '').toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Botón de aplicar */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isActive && !isApplyingPreset) {
            onApply();
          }
        }}
        disabled={isActive || isApplyingPreset}
        className={`w-full mt-3 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          (isActive || isApplyingPreset)
            ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        {isApplyingPreset ? 'Aplicando...' : isActive ? 'Configuración Actual' : 'Aplicar Preset'}
      </button>
    </div>
  );
};

export const PresetsPanel: React.FC<PresetsPanelProps> = ({ 
  currentConfig, 
  presets, 
  onApplyPreset,
  onPresetCreated,
  isApplyingPreset = false,
  onChange
}) => {
  const { getToken } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Estado para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<PresetConfig | null>(null);

  // Función simplificada que delega al padre (InterfaceConfigManager)
  // El padre se encarga de setConfig + saveChanges + aplicar DOM
  const handleApplyPresetWithSave = (preset: PresetConfig) => {
    onApplyPreset(preset);
  };

  // Determinar qué preset está activo actualmente
  const getCurrentPresetId = (): string | null => {
    // Comparar configuraciones para encontrar coincidencias
    const currentConfigString = JSON.stringify({
      theme: currentConfig.theme,
      logos: currentConfig.logos,
      branding: currentConfig.branding
    });

    for (const preset of presets) {
      const presetConfigString = JSON.stringify({
        theme: preset.config.theme,
        logos: preset.config.logos,
        branding: preset.config.branding
      });
      
      if (currentConfigString === presetConfigString) {
        return preset.id;
      }
    }
    
    return null;
  };

  const activePresetId = getCurrentPresetId();

  const handleCreatePreset = async () => {
    if (!newPresetName.trim() || !newPresetDescription.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsCreating(true);
    try {
      
      // Crear preset con la configuración actual
      const newPreset = await interfaceConfigService.createPreset(
        getToken,
        newPresetName.trim(),
        newPresetDescription.trim(),
        currentConfig
      );

      
      // Limpiar formulario
      setNewPresetName('');
      setNewPresetDescription('');
      setShowCreateForm(false);
      
      // Recargar lista de presets si existe el callback
      if (onPresetCreated) {
        await onPresetCreated();
      }
      
      alert(`Preset "${newPreset.name}" creado exitosamente`);
    } catch (error) {
      alert('Error creando el preset. Verifica los permisos y que todos los campos estén completos.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este preset?')) {
      return;
    }

    try {
      
      // Eliminar preset usando el servicio
      await interfaceConfigService.deletePreset(getToken, presetId);
      
      
      // Recargar lista de presets si existe el callback
      if (onPresetCreated) {
        await onPresetCreated();
      }
      
      alert('Preset eliminado exitosamente');
    } catch (error) {
      alert('Error eliminando el preset. Verifica que tengas los permisos necesarios.');
    }
  };

  const handleEditPreset = (preset: PresetConfig) => {
    setPresetToEdit(preset);
    setShowEditModal(true);
  };

  const handleSaveEditedPreset = async (updatedPreset: PresetConfig) => {
    
    // Recargar lista de presets
    if (onPresetCreated) {
      await onPresetCreated();
    }
    
    alert(`Preset "${updatedPreset.name}" actualizado exitosamente`);
  };

  // Separar presets del sistema y personalizados
  const systemPresets = presets.filter(p => p.isSystem);
  const customPresets = presets.filter(p => !p.isSystem);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Plantillas de Configuración</h3>
          <p className="text-sm text-neutral-600">
            Aplica configuraciones predefinidas o crea tus propias plantillas personalizadas
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {showCreateForm ? 'Cancelar' : 'Crear Plantilla'}
        </button>
      </div>

      {/* Formulario para crear preset */}
      {showCreateForm && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-neutral-800 mb-4">Crear Nueva Plantilla</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nombre de la Plantilla
              </label>
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Mi Tema Personalizado"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Descripción
              </label>
              <textarea
                value={newPresetDescription}
                onChange={(e) => setNewPresetDescription(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"
                placeholder="Describe las características de esta plantilla..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCreatePreset}
                disabled={isCreating}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creando...' : 'Crear Plantilla'}
              </button>
              
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-neutral-600 border border-neutral-300 rounded-md hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Presets del sistema */}
      <div>
        <h4 className="text-md font-medium text-neutral-800 mb-4">Plantillas del Sistema</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isActive={activePresetId === preset.id}
              onApply={() => handleApplyPresetWithSave(preset)}
              onEdit={() => handleEditPreset(preset)}
              isApplyingPreset={isApplyingPreset}
            />
          ))}
        </div>
      </div>

      {/* Presets personalizados */}
      {customPresets.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-neutral-800 mb-4">Mis Plantillas Personalizadas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onApply={() => handleApplyPresetWithSave(preset)}
                onEdit={() => handleEditPreset(preset)}
                onDelete={() => handleDeletePreset(preset.id)}
                isApplyingPreset={isApplyingPreset}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío para presets personalizados */}
      {customPresets.length === 0 && (
        <div className="text-center py-8 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300">
          <div className="text-neutral-400 mb-2">
            <svg className="mx-auto h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-neutral-600 mb-1">No tienes plantillas personalizadas</h3>
          <p className="text-sm text-neutral-500">
            Crea una plantilla para guardar tu configuración actual y reutilizarla más tarde
          </p>
        </div>
      )}

      {/* Modal de edición de preset */}
      <PresetEditModal
        preset={presetToEdit}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEditedPreset}
      />
    </div>
  );
};
