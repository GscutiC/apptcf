/**
 * Dashboard principal con configuración dinámica
 */

import React from 'react';
import { useAuthProfile } from '../../../hooks/useAuthProfile';
import { useProtectedRoute } from '../../../hooks/useProtectedRoute';
import { adaptUserProfileToUser } from '../../utils/userAdapter';
import { useInterfaceConfig } from '../../../modules/interface-config/hooks/useInterfaceConfig';

export const Dashboard: React.FC = () => {
  const { userProfile, loading } = useAuthProfile();
  const currentUser = adaptUserProfileToUser(userProfile);
  const { isAdmin, isSuperAdmin } = useProtectedRoute();
  
  // 🆕 Integrar configuración dinámica
  const { config, loading: configLoading, isReady } = useInterfaceConfig();

  if (loading || configLoading || !isReady) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
        </div>
      </div>
    );
  }

  // Obtener datos de configuración
  const appName = config.branding?.appName || 'Mi Aplicación';
  const appDescription = config.branding?.appDescription || 'Panel de control de la aplicación';
  const welcomeMessage = config.branding?.welcomeMessage || `¡Bienvenido, ${currentUser?.first_name || 'Usuario'}!`;
  const tagline = config.branding?.tagline || 'Tu panel de control está listo. Navega por los módulos del sistema para comenzar.';
  const primaryColor = config.theme?.colors?.primary?.['500'] || '#3B82F6';

  return (
    <div className="p-6 space-y-6">
      {/* Bienvenida Principal - Configuración Dinámica */}
      <div 
        className="rounded-lg shadow-lg text-white p-8"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)`,
          borderRadius: config.theme?.layout?.borderRadius?.lg || '0.5rem'
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
              {welcomeMessage}
            </h1>
            <p className="text-white/90 text-lg">
              {tagline}
            </p>
            <p className="text-white/75 text-sm mt-2">
              {appDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Información del Usuario - Configuración Dinámica */}
      <div 
        className="bg-white shadow-md p-6"
        style={{
          borderRadius: config.theme?.layout?.borderRadius?.lg || '0.5rem'
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
              {currentUser?.role?.display_name || 'Usuario'}
            </div>
            <div 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2"
              style={{
                backgroundColor: `${primaryColor}20`,
                color: primaryColor,
                borderRadius: config.theme?.layout?.borderRadius?.full || '9999px'
              }}
            >
              {currentUser?.role?.permissions.length || 0} permisos
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de navegación - Configuración Dinámica */}
      <div 
        className="bg-gray-50 p-6 text-center"
        style={{
          borderRadius: config.theme?.layout?.borderRadius?.lg || '0.5rem'
        }}
      >
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Todo listo para comenzar!
          </h3>
          <p className="text-gray-600 mb-4">
            Utiliza el menú lateral para navegar entre los diferentes módulos de {appName}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;