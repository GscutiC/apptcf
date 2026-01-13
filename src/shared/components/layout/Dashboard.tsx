/**
 * Dashboard principal con configuración dinámica
 * OPTIMIZADO: Usa useAuthContext para evitar múltiples llamadas a /auth/me
 * OPTIMIZADO: Memoización de valores derivados para evitar re-renders
 */

import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import { useProtectedRoute } from '../../../hooks/useProtectedRoute';
import { adaptUserProfileToUser } from '../../utils/userAdapter';
import { useInterfaceConfigContext } from '../../../modules/interface-config/context/InterfaceConfigContext';
import { useModuleAccess } from '../../../modules/techo-propio';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthContext();
  const { isAdmin } = useProtectedRoute();
  const hasTechoPropioAccess = useModuleAccess();
  const { config } = useInterfaceConfigContext();

  // OPTIMIZADO: Memoizar la conversión del usuario para evitar recálculos
  const currentUser = useMemo(() => 
    adaptUserProfileToUser(userProfile), 
    [userProfile]
  );

  // OPTIMIZADO: Memoizar valores derivados de la configuración
  const dashboardConfig = useMemo(() => ({
    appName: config?.branding?.appName || 'ScutiTec',
    appDescription: config?.branding?.appDescription || 'Panel de control',
    welcomeMessage: config?.branding?.welcomeMessage || `¡Bienvenido, ${currentUser?.first_name || 'Usuario'}!`,
    tagline: config?.branding?.tagline || 'Tu panel de control está listo.',
    primaryColor: config?.theme?.colors?.primary?.['500'] || '#10b981',
    borderRadius: config?.theme?.layout?.borderRadius?.lg || '0.5rem',
    borderRadiusFull: config?.theme?.layout?.borderRadius?.full || '9999px',
  }), [config?.branding, config?.theme, currentUser?.first_name]);

  // OPTIMIZADO: Memoizar información del rol del usuario
  const userRoleInfo = useMemo(() => ({
    displayName: currentUser?.role?.display_name || 'Usuario',
    permissionsCount: currentUser?.role?.permissions.length || 0,
  }), [currentUser?.role]);

  // OPTIMIZADO: Memoizar handler de navegación
  const handleNavigateToTechoPropio = useCallback(() => {
    navigate('/techo-propio');
  }, [navigate]);

  return (
    <div className="p-6 space-y-6">
      {/* Bienvenida Principal - Configuración Dinámica */}
      <div 
        className="rounded-lg shadow-lg text-white p-8"
        style={{
          background: `linear-gradient(135deg, ${dashboardConfig.primaryColor} 0%, ${dashboardConfig.primaryColor}CC 100%)`,
          borderRadius: dashboardConfig.borderRadius
        }}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {dashboardConfig.welcomeMessage}
            </h1>
            <p className="text-white/90 text-lg">
              {dashboardConfig.tagline}
            </p>
            <p className="text-white/75 text-sm mt-2">
              {dashboardConfig.appDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Información del Usuario - Configuración Dinámica */}
      <div 
        className="bg-white shadow-md p-6"
        style={{
          borderRadius: dashboardConfig.borderRadius
        }}
      >
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
              {userRoleInfo.displayName}
            </div>
            <div 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2"
              style={{
                backgroundColor: `${dashboardConfig.primaryColor}20`,
                color: dashboardConfig.primaryColor,
                borderRadius: dashboardConfig.borderRadiusFull
              }}
            >
              {userRoleInfo.permissionsCount} permisos
            </div>
          </div>
        </div>
      </div>

      {/* Módulos Disponibles */}
      {hasTechoPropioAccess && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulos Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjeta Techo Propio */}
            <button
              onClick={handleNavigateToTechoPropio}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group transform hover:-translate-y-1"
              style={{
                borderRadius: dashboardConfig.borderRadius
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-3xl shadow-lg">
                  🏠
                </div>
                <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                  NUEVO
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                Techo Propio
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Gestión completa de solicitudes del programa de vivienda del gobierno
              </p>
              <div className="flex items-center text-green-600 font-semibold text-sm">
                <span>Acceder al módulo</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de navegación - Configuración Dinámica */}
      <div
        className="bg-gray-50 p-6 text-center"
        style={{
          borderRadius: dashboardConfig.borderRadius
        }}
      >
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Todo listo para comenzar!
          </h3>
          <p className="text-gray-600 mb-4">
            Utiliza el menú lateral para navegar entre los diferentes módulos de {dashboardConfig.appName}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;