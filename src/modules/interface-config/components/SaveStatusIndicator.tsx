/**
 * Componente para mostrar el estado de guardado de la configuración
 */

import React from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';

export const SaveStatusIndicator: React.FC = () => {
  const { loading, error, isDirty, isSaving } = useInterfaceConfig();

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span>❌ Error: {error}</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <span>💾 Guardando cambios...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <span>🔄 Cargando configuración...</span>
      </div>
    );
  }

  if (isDirty) {
    return (
      <div className="flex items-center space-x-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>⚠️ Cambios pendientes - No guardados</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <span>✅ Configuración guardada</span>
    </div>
  );
};