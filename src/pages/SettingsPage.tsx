/**
 * Página de Configuración del Sistema
 * Ruta: /settings
 * Protegida: Solo administradores
 */

import React from 'react';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { InterfaceConfigProvider, InterfaceConfigManager } from '../modules/interface-config';

export const SettingsPage: React.FC = () => {
  const { user, userRole, userPermissions, isAdmin } = useProtectedRoute();
  return (
    <InterfaceConfigProvider>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header de la página */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Configuración del Sistema
              </h1>
              <p className="text-gray-600">
                Panel de administración y configuración avanzada
              </p>
            </div>
          </div>

          {/* Información de acceso */}
          {user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <div className="text-sm text-green-700">
                  <strong>Acceso autorizado:</strong> {user.first_name} {user.last_name} ({userRole})
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Módulo de configuración de interfaz */}
        <InterfaceConfigManager className="mb-8" />

        {/* Otros módulos de configuración (futuro) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <h3 className="font-semibold text-neutral-800 mb-3 flex items-center">
              <span className="mr-2">📊</span>
              Monitoreo del Sistema
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Supervisa el rendimiento y estado de los servicios
            </p>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Próximamente →
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <h3 className="font-semibold text-neutral-800 mb-3 flex items-center">
              <span className="mr-2">🛡️</span>
              Configuración de Seguridad
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Gestiona políticas de seguridad y autenticación
            </p>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Próximamente →
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-neutral-200">
            <h3 className="font-semibold text-neutral-800 mb-3 flex items-center">
              <span className="mr-2">🔧</span>
              Configuración de API
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Configura endpoints y parámetros de la API
            </p>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Próximamente →
            </button>
          </div>
        </div>
      </div>
    </InterfaceConfigProvider>
  );
};

export default SettingsPage;