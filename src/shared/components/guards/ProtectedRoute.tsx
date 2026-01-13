/**
 * Componente ProtectedRoute para proteger rutas completas
 * Combina autenticación, roles y permisos en una sola solución
 * OPTIMIZADO: Usa useAuthContext para evitar múltiples llamadas a /auth/me
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useAuthContext } from '../../../context/AuthContext';
import { adaptUserProfileToUser } from '../../utils/userAdapter';
import { RoleName, Permission } from '../../../modules/user-management/types/user.types';
import { hasRole, hasAnyRole, hasPermission, hasAnyPermission, hasAllPermissions } from '../../../modules/user-management/utils/permissions.utils';

interface ProtectedRouteProps {
  children: ReactNode;
  
  // Configuración de autenticación
  requireAuth?: boolean;
  
  // Configuración de roles
  role?: string;
  anyRole?: string[];
  
  // Configuración de permisos
  permission?: Permission;
  anyPermission?: Permission[];
  allPermissions?: Permission[];
  
  // Rutas de redirección
  redirectTo?: string;
  unauthorizedRedirect?: string;
  
  // Componentes fallback personalizados
  fallback?: ReactNode;
  unauthorizedFallback?: ReactNode;
  
  // Configuración adicional
  loading?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = React.memo(({
  children,
  requireAuth = true,
  role,
  anyRole,
  permission,
  anyPermission,
  allPermissions,
  redirectTo = '/dashboard',
  unauthorizedRedirect = '/dashboard',
  fallback,
  unauthorizedFallback,
  loading = false
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { userProfile, loading: profileLoading } = useAuthContext();
  const currentUser = adaptUserProfileToUser(userProfile);
  const location = useLocation();

  // Mostrar loading mientras carga la autenticación o perfil
  if (!isLoaded || profileLoading || loading) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Verificar autenticación si es requerida
  if (requireAuth && !isSignedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si no requiere autenticación y no está autenticado, mostrar contenido
  if (!requireAuth && !isSignedIn) {
    return <>{children}</>;
  }

  // Si está autenticado pero no hay usuario cargado, mostrar loading
  if (isSignedIn && !currentUser) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil de usuario...</p>
        </div>
      </div>
    );
  }

  // Verificaciones de roles y permisos (solo si hay usuario)
  if (currentUser) {
    // Verificar rol específico
    if (role && !hasRole(currentUser, role)) {
      return unauthorizedFallback ? (
        <>{unauthorizedFallback}</>
      ) : (
        <Navigate to={unauthorizedRedirect} replace />
      );
    }

    // Verificar cualquiera de los roles
    if (anyRole && anyRole.length > 0 && !hasAnyRole(currentUser, anyRole)) {
      return unauthorizedFallback ? (
        <>{unauthorizedFallback}</>
      ) : (
        <Navigate to={unauthorizedRedirect} replace />
      );
    }

    // Verificar permiso específico
    if (permission && !hasPermission(currentUser, permission)) {
      return unauthorizedFallback ? (
        <>{unauthorizedFallback}</>
      ) : (
        <Navigate to={unauthorizedRedirect} replace />
      );
    }

    // Verificar cualquiera de los permisos
    if (anyPermission && anyPermission.length > 0 && !hasAnyPermission(currentUser, anyPermission)) {
      return unauthorizedFallback ? (
        <>{unauthorizedFallback}</>
      ) : (
        <Navigate to={unauthorizedRedirect} replace />
      );
    }

    // Verificar todos los permisos
    if (allPermissions && allPermissions.length > 0 && !hasAllPermissions(currentUser, allPermissions)) {
      return unauthorizedFallback ? (
        <>{unauthorizedFallback}</>
      ) : (
        <Navigate to={unauthorizedRedirect} replace />
      );
    }
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;