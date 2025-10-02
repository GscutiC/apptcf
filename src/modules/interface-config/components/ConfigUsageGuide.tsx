/**
 * Guía de uso del módulo de configuración de interfaz
 */

import React, { useState } from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';

export const ConfigUsageGuide: React.FC = () => {
  const { config, setConfig, isDirty, saveChanges } = useInterfaceConfig();
  const [isExpanded, setIsExpanded] = useState(false);

  const demonstrateColorChange = () => {
    // Ejemplo: cambiar el color secundario (solo localmente, no guarda)
    const newSecondaryColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    
    // Usar setConfig que NO guarda automáticamente
    setConfig({
      theme: {
        ...config.theme,
        colors: {
          ...config.theme.colors,
          secondary: {
            ...config.theme.colors.secondary,
            500: newSecondaryColor
          }
        }
      }
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📚 Guardado Manual de Configuración
          </h3>
          <p className="text-blue-700 mb-4">
            Ahora tienes control total sobre cuándo guardar tus cambios:
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 p-2"
        >
          {isExpanded ? '🔼' : '🔽'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Explicación del flujo */}
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">✅ Nuevo Flujo (Guardado Manual)</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Seleccionas "Secundario" → cambia la paleta activa</li>
                <li>Modificas cualquier color → cambio temporal (no guardado)</li>
                <li>Ves los cambios en vivo pero NO se persisten</li>
                <li>Haces clic en "Guardar" → se persiste en localStorage y backend</li>
                <li>O haces clic en "Descartar" → se revierten los cambios</li>
              </ol>
            </div>

            {/* Estado actual */}
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h4 className="font-semibold text-green-800 mb-2">🎨 Estado Actual</h4>
              <div className="text-sm space-y-2">
                <div>
                  <strong>Primario:</strong> 
                  <span 
                    className="ml-2 inline-block w-4 h-4 rounded border"
                    style={{backgroundColor: config.theme.colors.primary[500]}}
                  ></span>
                  <code className="ml-1 text-xs">{config.theme.colors.primary[500]}</code>
                </div>
                <div>
                  <strong>Secundario:</strong> 
                  <span 
                    className="ml-2 inline-block w-4 h-4 rounded border"
                    style={{backgroundColor: config.theme.colors.secondary[500]}}
                  ></span>
                  <code className="ml-1 text-xs">{config.theme.colors.secondary[500]}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Demostración */}
          <div className="bg-white rounded-lg p-4 border border-yellow-100">
            <h4 className="font-semibold text-yellow-800 mb-2">🧪 Prueba el Sistema</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Haz clic para hacer un cambio temporal (no se guarda automáticamente):
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={demonstrateColorChange}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cambiar Color Aleatoriamente
              </button>
              {isDirty && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-yellow-700">¡Tienes cambios sin guardar!</span>
                  <button
                    onClick={saveChanges}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Explicación técnica */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">⚙️ Detalles Técnicos (Guardado Manual)</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Cambios temporales:</strong> Se aplican inmediatamente al DOM para previsualización</p>
              <p><strong>Persistencia:</strong> Solo al hacer clic en "Guardar" → localStorage + Backend</p>
              <p><strong>Descartar:</strong> Revierte a la última configuración guardada</p>
              <p><strong>Estado:</strong> Indicadores claros de cambios pendientes vs guardados</p>
              <p><strong>Seguridad:</strong> No se puede perder configuración por cambios accidentales</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};