/**
 * Dashboard principal simplificado
 */

import React from 'react';
import { useAuthProfile } from '../../../hooks/useAuthProfile';
import { useProtectedRoute } from '../../../hooks/useProtectedRoute';
import { adaptUserProfileToUser } from '../../utils/userAdapter';

export const Dashboard: React.FC = () => {
  const { userProfile, loading } = useAuthProfile();
  const currentUser = adaptUserProfileToUser(userProfile);
  const { isAdmin, isSuperAdmin } = useProtectedRoute();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Bienvenida Principal */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {currentUser?.first_name || 'Usuario'}!
            </h1>
            <p className="text-blue-100 text-lg">
              Tu panel de control está listo. Navega por los módulos del sistema para comenzar.
            </p>
          </div>
        </div>
      </div>

      {/* Información del Usuario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Tu Perfil de Acceso
            </h2>
            <p className="text-gray-600 text-sm">
              {isAdmin 
                ? 'Tienes permisos de administrador. Puedes gestionar usuarios, roles y configuración del sistema.'
                : 'Explora las funcionalidades disponibles según tus permisos.'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Rol actual:</div>
            <div className="text-lg font-semibold text-gray-900">
              {currentUser?.role?.display_name || 'Usuario'}
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
              {currentUser?.role?.permissions.length || 0} permisos
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de navegación */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Todo listo para comenzar!
          </h3>
          <p className="text-gray-600 mb-4">
            Utiliza el menú lateral para navegar entre los diferentes módulos del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;