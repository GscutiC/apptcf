/**
 * Panel para configuración de temas y colores
 */

import React, { useState } from 'react';
import { InterfaceConfig, ColorConfig, ColorShades } from '../types';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';

interface ThemeConfigPanelProps {
  config: InterfaceConfig;
  onChange: (updates: Partial<InterfaceConfig>) => void;
}

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded border border-neutral-300 cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-sm font-mono"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
};

export const ThemeConfigPanel: React.FC<ThemeConfigPanelProps> = ({ config, onChange }) => {
  const [activeColorSet, setActiveColorSet] = useState<keyof ColorConfig>('primary');
  const [isChanging, setIsChanging] = useState(false);
  const [lastChanged, setLastChanged] = useState<string>('');
  
  // Hook para acceder a las funciones de guardado
  const { saveChanges, discardChanges, isDirty, isSaving } = useInterfaceConfig();

  const handleColorChange = (
    colorSet: keyof ColorConfig,
    shade: string,
    newColor: string
  ) => {
    setIsChanging(true);
    
    const updatedColors = {
      ...config.theme.colors,
      [colorSet]: {
        ...config.theme.colors[colorSet],
        [shade]: newColor
      }
    };

    onChange({
      theme: {
        ...config.theme,
        colors: updatedColors
      }
    });

    // Feedback visual
    setLastChanged(`${colorSet} ${shade}`);
    setTimeout(() => {
      setIsChanging(false);
    }, 500);
  };

  const handleThemeNameChange = (name: string) => {
    onChange({
      theme: {
        ...config.theme,
        name
      }
    });
  };

  const handleModeChange = (mode: 'light' | 'dark') => {
    onChange({
      theme: {
        ...config.theme,
        mode
      }
    });
  };

  const colorSets: Array<{ key: keyof ColorConfig; label: string; description: string }> = [
    { key: 'primary', label: 'Primario', description: 'Color principal de la aplicación' },
    { key: 'secondary', label: 'Secundario', description: 'Color secundario para elementos de apoyo' },
    { key: 'accent', label: 'Acento', description: 'Color de acento para destacar elementos' },
    { key: 'neutral', label: 'Neutral', description: 'Colores neutros para textos y fondos' },
  ];

  const colorShades = [
    { key: '50', label: 'Muy claro' },
    { key: '100', label: 'Claro' },
    { key: '200', label: 'Claro medio' },
    { key: '300', label: 'Medio claro' },
    { key: '400', label: 'Medio' },
    { key: '500', label: 'Base' },
    { key: '600', label: 'Medio oscuro' },
    { key: '700', label: 'Oscuro medio' },
    { key: '800', label: 'Oscuro' },
    { key: '900', label: 'Muy oscuro' },
  ];

  return (
    <div className="space-y-8">
      {/* Configuración general del tema */}
      <div className="bg-neutral-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Configuración General</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre del tema */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Nombre del Tema
            </label>
            <input
              type="text"
              value={config.theme.name}
              onChange={(e) => handleThemeNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Mi Tema Personalizado"
            />
          </div>

          {/* Modo del tema */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Modo del Tema
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme-mode"
                  value="light"
                  checked={config.theme.mode === 'light'}
                  onChange={(e) => handleModeChange(e.target.value as 'light' | 'dark')}
                  className="mr-2"
                />
                <span className="text-sm">Claro</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme-mode"
                  value="dark"
                  checked={config.theme.mode === 'dark'}
                  onChange={(e) => handleModeChange(e.target.value as 'light' | 'dark')}
                  className="mr-2"
                />
                <span className="text-sm">Oscuro</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de colores */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Paleta de Colores</h3>
        
        {/* Selector de conjunto de colores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {colorSets.map((colorSet) => (
                <button
                  key={colorSet.key}
                  onClick={() => setActiveColorSet(colorSet.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeColorSet === colorSet.key
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  title={colorSet.description}
                >
                  {colorSet.label}
                  {isChanging && lastChanged.includes(String(colorSet.key)) && (
                    <span className="ml-2 inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Indicador de estado */}
            <div className="flex items-center space-x-2 text-sm">
              {isChanging ? (
                <div className="flex items-center text-blue-600">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                  Aplicando cambios...
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Cambios guardados automáticamente
                </div>
              )}
            </div>
          </div>
          
          {/* Información sobre el conjunto activo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Editando paleta:</strong> {colorSets.find(cs => cs.key === activeColorSet)?.label} - 
              {colorSets.find(cs => cs.key === activeColorSet)?.description}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Los cambios se guardan automáticamente y se aplican inmediatamente en toda la aplicación.
            </p>
          </div>
        </div>

        {/* Editor de colores para el conjunto activo */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h4 className="text-md font-medium text-neutral-800">
              Colores {colorSets.find(cs => cs.key === activeColorSet)?.label}
            </h4>
            <div className="ml-auto flex items-center space-x-2">
              {/* Muestra de colores */}
              {Object.entries(config.theme.colors[activeColorSet]).map(([shade, color]) => (
                <div
                  key={shade}
                  className="w-6 h-6 rounded border border-neutral-300"
                  style={{ backgroundColor: color }}
                  title={`${shade}: ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Grid de selectores de color */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorShades.map((shade) => {
              const colorValue = config.theme.colors[activeColorSet]?.[shade.key] || '#000000';
              return (
                <ColorPicker
                  key={shade.key}
                  label={`${shade.key} - ${shade.label}`}
                  color={colorValue}
                  onChange={(color) => handleColorChange(activeColorSet, shade.key, color)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Vista previa de colores */}
      <div className="bg-neutral-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Vista Previa</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {colorSets.map((colorSet) => (
            <div key={colorSet.key} className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-700">{colorSet.label}</h4>
              <div className="space-y-1">
                {Object.entries(config.theme.colors[colorSet.key]).slice(0, 5).map(([shade, color]) => (
                  <div key={shade} className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded border border-neutral-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-neutral-600">{shade}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de guardado */}
      {isDirty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-800 font-medium">
                Tienes cambios sin guardar
              </span>
              <span className="text-yellow-600 text-sm">
                Los cambios solo se aplicarán cuando hagas clic en "Guardar"
              </span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={discardChanges}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Descartar
              </button>
              <button
                onClick={saveChanges}
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