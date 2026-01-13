/**
 * ModuleAccessGuard - Guard para acceso al módulo Techo Propio
 *
 * Control de acceso integrado con el sistema de roles y permisos de ScutiTec.
 * Verifica que el usuario tenga el permiso 'modules.techo_propio'.
 */

import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Button } from './Button';
import { useAuthContext } from '../../../../context/AuthContext';
import { adaptUserProfileToUser } from '../../../../shared/utils/userAdapter';
import { hasPermission } from '../../../user-management/utils/permissions.utils';

interface ModuleAccessGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Verifica si el usuario tiene acceso al módulo Techo Propio
 *
 * Lógica de acceso integrada con el sistema de roles:
 * 1. El usuario debe estar autenticado
 * 2. El usuario debe tener el permiso 'modules.techo_propio' en su rol
 * 3. Super administradores tienen acceso automático a todos los módulos
 *
 * Para configurar el acceso:
 * - Ve a /roles en el sistema
 * - Edita el rol del usuario
 * - Asigna el permiso "Acceso al módulo Techo Propio"
 */
export const ModuleAccessGuard: React.FC<ModuleAccessGuardProps> = ({
  children,
  fallback
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { userProfile, loading: profileLoading } = useAuthContext();
  const currentUser = adaptUserProfileToUser(userProfile);
  const navigate = useNavigate();

  // Mostrar loading mientras carga la autenticación
  if (!isLoaded || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Usuario no autenticado - redirigir a login
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Autenticación Requerida
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            Debe iniciar sesión para acceder al módulo Techo Propio.
          </p>
          <Button onClick={() => navigate('/sign-in')} className="w-full">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  // Verificar si el usuario tiene acceso al módulo
  const hasAccess = currentUser && hasPermission(currentUser, 'modules.techo_propio');

  if (!hasAccess) {
    // Usuario autenticado pero sin acceso al módulo
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white border border-red-200 rounded-lg p-8 max-w-md shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Acceso Denegado
          </h3>
          <p className="text-gray-600 mb-2 text-center">
            No tiene permisos para acceder al módulo <strong>Techo Propio</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Contacte al administrador del sistema para solicitar acceso.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/')} className="w-full">
              Volver al Inicio
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              className="w-full"
            >
              Volver Atrás
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado y con acceso al módulo
  return <>{children}</>;
};



/**
 * HOC para envolver componentes que requieren acceso al módulo
 */
export function withModuleAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WithModuleAccess = (props: P) => {
    return (
      <ModuleAccessGuard fallback={fallback}>
        <WrappedComponent {...props} />
      </ModuleAccessGuard>
    );
  };

  WithModuleAccess.displayName = `withModuleAccess(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithModuleAccess;
}

/**
 * Hook para verificar acceso al módulo en componentes
 * OPTIMIZADO: Usa useAuthContext para evitar múltiples llamadas a /auth/me
 */
export const useModuleAccess = (): boolean => {
  const { isSignedIn, isLoaded } = useAuth();
  const { userProfile, loading: profileLoading } = useAuthContext();
  const currentUser = adaptUserProfileToUser(userProfile);

  if (!isLoaded || profileLoading || !isSignedIn || !currentUser) {
    return false;
  }

  return hasPermission(currentUser, 'modules.techo_propio');
};

export default ModuleAccessGuard;
