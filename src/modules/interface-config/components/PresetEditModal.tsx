/**
 * Modal para editar presets de configuración
 * Permite modificar nombre, descripción y colores de plantillas
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { PresetConfig, ColorConfig, ColorShades } from '../types';
import { presetEditService } from '../services/presetEditService';
import { logger } from '../../../shared/utils/logger';

interface PresetEditModalProps {
  preset: PresetConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPreset: PresetConfig) => void;
}

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  shade: string;
}

/**
 * Componente para picker de color individual
 */
const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange, shade }) => {
  const [localColor, setLocalColor] = useState(color);

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  const handleChange = (newColor: string) => {
    setLocalColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-16 text-sm font-medium text-neutral-600">
        {label}
      </div>
      <input
        type="color"
        value={localColor}
        onChange={(e) => handleChange(e.target.value)}
        className="w-12 h-12 rounded border border-neutral-300 cursor-pointer hover:border-primary-500 transition-colors"
        title={`Seleccionar color para ${label}`}
      />
      <input
        type="text"
        value={localColor}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        placeholder="#000000"
        pattern="^#[0-9A-Fa-f]{6}$"
      />
      <div 
        className="w-12 h-12 rounded border border-neutral-300"
        style={{ backgroundColor: localColor }}
        title="Vista previa"
      />
    </div>
  );
};

/**
 * Modal principal para editar presets
 */
export const PresetEditModal: React.FC<PresetEditModalProps> = ({
  preset,
  isOpen,
  onClose,
  onSave
}) => {
  const { getToken } = useAuth();
  
  // Estado del formulario
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    colors: ColorConfig;
  }>({
    name: '',
    description: '',
    colors: {
      primary: {} as ColorShades,
      secondary: {} as ColorShades,
      accent: {} as ColorShades,
      neutral: {} as ColorShades
    }
  });

  // Estado de UI
  const [activeColorSet, setActiveColorSet] = useState<keyof ColorConfig>('primary');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (preset && isOpen) {
      setFormData({
        name: preset.name,
        description: preset.description,
        colors: { ...preset.config.theme.colors }
      });
      setHasChanges(false);
      setErrors({});
    }
  }, [preset, isOpen]);

  // Detectar cambios
  useEffect(() => {
    if (!preset) return;
    
    const changed = 
      formData.name !== preset.name ||
      formData.description !== preset.description ||
      JSON.stringify(formData.colors) !== JSON.stringify(preset.config.theme.colors);
    
    setHasChanges(changed);
  }, [formData, preset]);

  const handleColorChange = (
    colorSet: keyof ColorConfig,
    shade: string,
    newColor: string
  ) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorSet]: {
          ...prev.colors[colorSet],
          [shade]: newColor
        }
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    // Validar que todos los colores sean hexadecimales válidos
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    Object.entries(formData.colors).forEach(([colorSet, shades]) => {
      Object.entries(shades).forEach(([shade, color]) => {
        if (!hexColorRegex.test(color)) {
          newErrors[`color_${colorSet}_${shade}`] = `Color inválido en ${colorSet} ${shade}`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preset || !validateForm()) return;

    setLoading(true);
    try {
      logger.info('💾 Guardando cambios del preset...');

      // Actualizar preset
      const updatedPreset = await presetEditService.updatePreset(
        getToken,
        preset.id,
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          config: {
            ...preset.config,
            theme: {
              ...preset.config.theme,
              colors: formData.colors
            }
          },
          isDefault: preset.isDefault
        }
      );

      logger.info('✅ Preset actualizado exitosamente');
      onSave(updatedPreset);
      onClose();
    } catch (error) {
      logger.error('❌ Error guardando preset:', error);
      setErrors({ submit: 'Error al guardar. Verifica los permisos e intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('¿Descartar cambios sin guardar?');
      if (!confirmed) return;
    }
    onClose();
  };

  if (!isOpen || !preset) return null;

  // Verificar si se puede editar
  const canEdit = presetEditService.canEditPreset(preset);

  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                ✏️ Editar Plantilla: {preset.name}
              </h2>
              {preset.isSystem && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Este es un preset del sistema y no puede ser editado
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                ⚙️ Información Básica
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nombre de la Plantilla
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: Mi Tema Corporativo"
                    disabled={!canEdit || loading}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe esta plantilla..."
                    rows={3}
                    disabled={!canEdit || loading}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Paleta de Colores */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                🎨 Paleta de Colores
              </h3>

              {/* Tabs para conjuntos de colores */}
              <div className="flex space-x-2 mb-6 border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => setActiveColorSet('primary')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeColorSet === 'primary'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                  disabled={!canEdit || loading}
                >
                  🔵 Primario
                </button>
                <button
                  type="button"
                  onClick={() => setActiveColorSet('secondary')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeColorSet === 'secondary'
                      ? 'text-secondary-600 border-b-2 border-secondary-600'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                  disabled={!canEdit || loading}
                >
                  🟣 Secundario
                </button>
                <button
                  type="button"
                  onClick={() => setActiveColorSet('accent')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeColorSet === 'accent'
                      ? 'text-accent-600 border-b-2 border-accent-600'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                  disabled={!canEdit || loading}
                >
                  🟢 Acento
                </button>
                <button
                  type="button"
                  onClick={() => setActiveColorSet('neutral')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeColorSet === 'neutral'
                      ? 'text-neutral-600 border-b-2 border-neutral-600'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                  disabled={!canEdit || loading}
                >
                  ⚪ Neutral
                </button>
              </div>

              {/* Color pickers para el conjunto activo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {shades.map((shade) => (
                  <ColorPicker
                    key={`${activeColorSet}-${shade}`}
                    label={shade}
                    shade={shade}
                    color={formData.colors[activeColorSet][shade] || '#000000'}
                    onChange={(newColor) => handleColorChange(activeColorSet, shade, newColor)}
                  />
                ))}
              </div>
            </div>

            {/* Error general */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            {hasChanges && (
              <span className="text-sm text-amber-600 font-medium">
                ● Cambios sin guardar
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
              disabled={loading}
            >
              ❌ Cancelar
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!hasChanges || loading}
              >
                {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
