/**
 * Guard para proteger componentes basado en permisos específicos
 */

import React, { ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { User, Permission } from '../../../modules/user-management/types/user.types';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../../modules/user-management/utils/permissions.utils';

interface PermissionGuardProps {
  children: ReactNode;
  user: User | null;
  
  // Requiere un permiso específico
  permission?: Permission;
  
  // Requiere al menos uno de estos permisos  
  anyPermission?: Permission[];
  
  // Requiere todos estos permisos
  allPermissions?: Permission[];
  
  // Componente a mostrar cuando no tiene permisos
  fallback?: ReactNode;
  
  // Mostrar solo loading mientras verifica
  loading?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  user,
  permission,
  anyPermission,
  allPermissions,
  fallback = null,
  loading = false
}) => {
  const { isLoaded } = useAuth();

  // Mostrar loading mientras carga la autenticación
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  // Usuario no autenticado
  if (!user) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="text-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <span className="font-medium">Acceso restringido:</span> Debes iniciar sesión para ver este contenido.
          </p>
        </div>
      </div>
    );
  }

  // Verificar permisos
  let hasRequiredPermissions = true;

  if (permission) {
    hasRequiredPermissions = hasPermission(user, permission);
  } else if (anyPermission && anyPermission.length > 0) {
    hasRequiredPermissions = hasAnyPermission(user, anyPermission);
  } else if (allPermissions && allPermissions.length > 0) {
    hasRequiredPermissions = hasAllPermissions(user, allPermissions);
  }

  // Si no tiene permisos, mostrar fallback
  if (!hasRequiredPermissions) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="text-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            <span className="font-medium">Acceso denegado:</span> No tienes permisos suficientes para ver este contenido.
          </p>
          {user.role && (
            <p className="text-sm text-red-600 mt-1">
              Tu rol actual: <span className="font-medium">{user.role.display_name}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Tiene permisos, mostrar contenido
  return <>{children}</>;
};

// Componente wrapper para uso más simple
interface SimplePermissionGuardProps {
  children: ReactNode;
  user: User | null;
  permission: Permission;
  fallbackMessage?: string;
}

export const SimplePermissionGuard: React.FC<SimplePermissionGuardProps> = ({
  children,
  user,
  permission,
  fallbackMessage = 'No tienes permisos para realizar esta acción'
}) => {
  return (
    <PermissionGuard
      user={user}
      permission={permission}
      fallback={
        <div className="text-sm text-gray-500 italic">
          {fallbackMessage}
        </div>
      }
    >
      {children}
    </PermissionGuard>
  );
};

// HOC para componentes que requieren permisos
export function withPermissionGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: Permission,
  fallback?: ReactNode
) {
  const WithPermissionGuard = (props: P & { user: User | null }) => {
    const { user, ...otherProps } = props;
    
    return (
      <PermissionGuard user={user} permission={permission} fallback={fallback}>
        <WrappedComponent {...(otherProps as P)} />
      </PermissionGuard>
    );
  };

  WithPermissionGuard.displayName = `withPermissionGuard(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithPermissionGuard;
}

// Hook para verificar permisos
export const usePermissionCheck = (user: User | null) => {
  return {
    hasPermission: (permission: Permission) => hasPermission(user, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(user, permissions),
    canManage: (operation: 'create' | 'read' | 'update' | 'delete', resource: 'users' | 'roles') => {
      const permission = `${resource}.${operation}` as Permission;
      return hasPermission(user, permission);
    }
  };
};