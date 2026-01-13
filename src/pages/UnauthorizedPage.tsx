/**
 * Página de Acceso Denegado
 * Se muestra cuando el usuario no tiene permisos para acceder a una ruta
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { adaptUserProfileToUser } from '../shared/utils/userAdapter';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthContext();
  const currentUser = adaptUserProfileToUser(userProfile);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Icono y título */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página
          </p>
        </div>

        {/* Información del usuario */}
        {currentUser && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Información de tu cuenta:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Usuario:</span>
                <span className="text-gray-900 font-medium">
                  {currentUser.first_name} {currentUser.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rol:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {currentUser.role?.display_name || 'Usuario'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Permisos:</span>
                <span className="text-gray-900">
                  {currentUser.role?.permissions.length || 0} activos
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sugerencias */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 ¿Qué puedes hacer?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Contacta al administrador del sistema</li>
            <li>• Verifica que tengas el rol correcto</li>
            <li>• Regresa a la página anterior</li>
            <li>• Ve al dashboard principal</li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            ← Regresar
          </button>
          <button
            onClick={handleGoHome}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            🏠 Ir al Dashboard
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Si crees que esto es un error, contacta al equipo de soporte
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;