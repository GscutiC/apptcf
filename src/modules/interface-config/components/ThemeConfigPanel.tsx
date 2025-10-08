/**
 * Panel para configuración de temas y colores - VERSIÓN MEJORADA
 * Características:
 * - Guardado manual con indicadores claros
 * - Contador de cambios pendientes
 * - Barra sticky con acciones
 * - Mejor feedback visual
 * - Optimizado para UX
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  hasChanged?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange, hasChanged = false }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
          {hasChanged && <span className="ml-2 text-xs text-blue-600 font-semibold">●</span>}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded border border-neutral-300 cursor-pointer hover:border-primary-500 transition-colors"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
      </div>
    </div>
  );
};

export const ThemeConfigPanel: React.FC<ThemeConfigPanelProps> = ({ config, onChange }) => {
  const [activeColorSet, setActiveColorSet] = useState<keyof ColorConfig>('primary');
  const [changeCount, setChangeCount] = useState(0);
  
  // Hook para acceder a las funciones de guardado
  const { 
    savedConfig, 
    saveChanges, 
    discardChanges, 
    isDirty, 
    isSaving,
    hasUnsavedChanges,
    changesSummary 
  } = useInterfaceConfig();

  // Detectar cambios en el tema
  useEffect(() => {
    if (!savedConfig || !config) return;
    
    let count = 0;
    
    // Contar cambios en colores
    Object.keys(config.theme.colors).forEach((colorSet) => {
      const currentColors = config.theme.colors[colorSet as keyof ColorConfig];
      const savedColors = savedConfig.theme.colors[colorSet as keyof ColorConfig];
      
      Object.keys(currentColors).forEach((shade) => {
        if (currentColors[shade] !== savedColors[shade]) {
          count++;
        }
      });
    });
    
    // Cambios en modo o nombre
    if (config.theme.mode !== savedConfig.theme.mode) count++;
    if (config.theme.name !== savedConfig.theme.name) count++;
    
    setChangeCount(count);
  }, [config, savedConfig]);

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

  const handleSaveClick = async () => {
    try {
      await saveChanges();
    } catch (error) {
      console.error('Error guardando cambios:', error);
      // Aquí podrías mostrar un toast o notificación de error
    }
  };

  const handleDiscardClick = () => {
    if (window.confirm(`¿Descartar ${changeCount} ${changeCount === 1 ? 'cambio' : 'cambios'}?`)) {
      discardChanges();
    }
  };

  const colorSets: Array<{ key: keyof ColorConfig; label: string; description: string; icon: string }> = [
    { key: 'primary', label: 'Primario', description: 'Color principal de la aplicación', icon: '🎨' },
    { key: 'secondary', label: 'Secundario', description: 'Color secundario para elementos de apoyo', icon: '🎭' },
    { key: 'accent', label: 'Acento', description: 'Color de acento para destacar elementos', icon: '✨' },
    { key: 'neutral', label: 'Neutral', description: 'Colores neutros para textos y fondos', icon: '⚪' },
  ];

  const colorShades = [
    { key: '50', label: '50 - Muy claro', description: 'Fondos muy claros' },
    { key: '100', label: '100 - Claro', description: 'Fondos claros' },
    { key: '200', label: '200 - Claro medio', description: 'Bordes claros' },
    { key: '300', label: '300 - Medio claro', description: 'Bordes' },
    { key: '400', label: '400 - Medio', description: 'Elementos deshabilitados' },
    { key: '500', label: '500 - Base', description: 'Color base principal' },
    { key: '600', label: '600 - Medio oscuro', description: 'Hover states' },
    { key: '700', label: '700 - Oscuro medio', description: 'Estados activos' },
    { key: '800', label: '800 - Oscuro', description: 'Texto sobre fondos claros' },
    { key: '900', label: '900 - Muy oscuro', description: 'Texto principal' },
  ];

  // Calcular si hay cambios en el colorSet activo
  const hasChangesInActiveSet = useMemo(() => {
    if (!savedConfig) return false;
    
    const currentColors = config.theme.colors[activeColorSet];
    const savedColors = savedConfig.theme.colors[activeColorSet];
    
    return Object.keys(currentColors).some(shade => 
      currentColors[shade] !== savedColors[shade]
    );
  }, [config, savedConfig, activeColorSet]);

  return (
    <div className="space-y-6">
      {/* BARRA STICKY DE ESTADO */}
      {isDirty && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 shadow-md">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Icono animado */}
                <div className="relative">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                    {changeCount}
                  </div>
                </div>
                
                {/* Información */}
                <div>
                  <h3 className="text-lg font-bold text-yellow-900">
                    {changeCount} {changeCount === 1 ? 'Cambio' : 'Cambios'} sin guardar
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Los cambios solo se aplicarán cuando hagas clic en <strong>"Guardar Cambios"</strong>
                  </p>
                  {changesSummary && (
                    <p className="text-xs text-yellow-600 mt-1">
                      📝 {changesSummary}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex space-x-3">
                <button
                  onClick={handleDiscardClick}
                  disabled={isSaving}
                  className="px-6 py-3 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  ↶ Descartar
                </button>
                <button
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
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
        </div>
      )}

      {/* Configuración general del tema */}
      <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">⚙️</span>
          Configuración General
        </h3>
        
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
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="Ej: Mi Tema Personalizado"
            />
          </div>

          {/* Modo del tema */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Modo del Tema
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-neutral-50"
                style={{
                  borderColor: config.theme.mode === 'light' ? 'var(--config-primary-500, #3b82f6)' : '#d1d5db',
                  backgroundColor: config.theme.mode === 'light' ? 'var(--config-primary-50, #eff6ff)' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="theme-mode"
                  value="light"
                  checked={config.theme.mode === 'light'}
                  onChange={(e) => handleModeChange(e.target.value as 'light' | 'dark')}
                  className="mr-3"
                />
                <span className="text-xl mr-2">☀️</span>
                <span className="text-sm font-medium">Claro</span>
              </label>
              <label className="flex items-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-neutral-50"
                style={{
                  borderColor: config.theme.mode === 'dark' ? 'var(--config-primary-500, #3b82f6)' : '#d1d5db',
                  backgroundColor: config.theme.mode === 'dark' ? 'var(--config-primary-50, #eff6ff)' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="theme-mode"
                  value="dark"
                  checked={config.theme.mode === 'dark'}
                  onChange={(e) => handleModeChange(e.target.value as 'light' | 'dark')}
                  className="mr-3"
                />
                <span className="text-xl mr-2">🌙</span>
                <span className="text-sm font-medium">Oscuro</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de colores */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🎨</span>
          Paleta de Colores
        </h3>
        
        {/* Selector de conjunto de colores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {colorSets.map((colorSet) => {
                const hasChangesInSet = savedConfig && Object.keys(config.theme.colors[colorSet.key]).some(shade =>
                  config.theme.colors[colorSet.key][shade] !== savedConfig.theme.colors[colorSet.key][shade]
                );
                
                return (
                  <button
                    key={colorSet.key}
                    onClick={() => setActiveColorSet(colorSet.key)}
                    className={`relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeColorSet === colorSet.key
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105 ring-4 ring-primary-200'
                        : 'bg-white text-neutral-700 hover:bg-neutral-50 border-2 border-neutral-200 hover:border-primary-300'
                    }`}
                    title={colorSet.description}
                  >
                    <span className="mr-2">{colorSet.icon}</span>
                    {colorSet.label}
                    {hasChangesInSet && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Información sobre el conjunto activo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">{colorSets.find(cs => cs.key === activeColorSet)?.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  Editando: {colorSets.find(cs => cs.key === activeColorSet)?.label}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {colorSets.find(cs => cs.key === activeColorSet)?.description}
                </p>
                {hasChangesInActiveSet && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    ● Este conjunto tiene cambios sin guardar
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editor de colores para el conjunto activo */}
        <div className="bg-white border-2 border-neutral-200 rounded-xl p-6 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-md font-semibold text-neutral-800">
              Tonos de Color - {colorSets.find(cs => cs.key === activeColorSet)?.label}
            </h4>
            {/* Muestra de colores */}
            <div className="flex items-center space-x-1">
              {Object.entries(config.theme.colors[activeColorSet]).map(([shade, color]) => (
                <div
                  key={shade}
                  className="w-8 h-8 rounded-lg border-2 border-neutral-300 shadow-sm hover:scale-110 transition-transform cursor-pointer"
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
              const savedColorValue = savedConfig?.theme.colors[activeColorSet]?.[shade.key];
              const hasChanged = savedColorValue !== undefined && colorValue !== savedColorValue;
              
              return (
                <div
                  key={shade.key}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    hasChanged 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-neutral-200 bg-neutral-50'
                  }`}
                >
                  <ColorPicker
                    label={shade.label}
                    color={colorValue}
                    onChange={(color) => handleColorChange(activeColorSet, shade.key, color)}
                    hasChanged={hasChanged}
                  />
                  <p className="text-xs text-neutral-500 mt-2">{shade.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vista previa de colores */}
      <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">👁️</span>
          Vista Previa de Paleta
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {colorSets.map((colorSet) => (
            <div key={colorSet.key} className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-700 flex items-center">
                <span className="mr-2">{colorSet.icon}</span>
                {colorSet.label}
              </h4>
              <div className="space-y-1">
                {Object.entries(config.theme.colors[colorSet.key]).map(([shade, color]) => (
                  <div key={shade} className="flex items-center space-x-2">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-neutral-300 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <span className="text-xs font-medium text-neutral-600">{shade}</span>
                      <p className="text-xs text-neutral-500 font-mono">{color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mensaje informativo si no hay cambios */}
      {!isDirty && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-900">
                No hay cambios pendientes
              </p>
              <p className="text-xs text-green-700 mt-1">
                Todos los cambios están guardados. Puedes editar los colores arriba.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
