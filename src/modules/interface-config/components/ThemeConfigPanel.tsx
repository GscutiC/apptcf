/**
 * Panel para configuración de temas y colores
 */

import React, { useState } from 'react';
import { InterfaceConfig, ColorConfig, ColorShades } from '../types';

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

  const handleColorChange = (
    colorSet: keyof ColorConfig,
    shade: string,
    newColor: string
  ) => {
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
        <div className="flex flex-wrap gap-2 mb-6">
          {colorSets.map((colorSet) => (
            <button
              key={colorSet.key}
              onClick={() => setActiveColorSet(colorSet.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeColorSet === colorSet.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
              title={colorSet.description}
            >
              {colorSet.label}
            </button>
          ))}
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
    </div>
  );
};