/**
 * Guard para proteger componentes basado en roles específicos
 */

import React, { ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { User, RoleName } from '../../../modules/user-management/types/user.types';
import { hasRole, hasAnyRole, getRoleDisplayName } from '../../../modules/user-management/utils/permissions.utils';

interface RoleGuardProps {
  children: ReactNode;
  user: User | null;
  
  // Requiere un rol específico
  role?: RoleName;
  
  // Requiere al menos uno de estos roles
  anyRole?: RoleName[];
  
  // Componente a mostrar cuando no tiene el rol
  fallback?: ReactNode;
  
  // Mostrar solo loading mientras verifica
  loading?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  user,
  role,
  anyRole,
  fallback = null,
  loading = false
}) => {
  const { isLoaded } = useAuth();

  // Mostrar loading mientras carga la autenticación
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Verificando rol...</span>
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

  // Verificar roles
  let hasRequiredRole = true;

  if (role) {
    hasRequiredRole = hasRole(user, role);
  } else if (anyRole && anyRole.length > 0) {
    hasRequiredRole = hasAnyRole(user, anyRole);
  }

  // Si no tiene el rol requerido, mostrar fallback
  if (!hasRequiredRole) {
    const requiredRoles = role ? [role] : (anyRole || []);
    const requiredRolesDisplay = requiredRoles.map(getRoleDisplayName).join(' o ');
    
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="text-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            <span className="font-medium">Acceso denegado:</span> Se requiere el rol de {requiredRolesDisplay}.
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

  // Tiene el rol requerido, mostrar contenido
  return <>{children}</>;
};

// Componente wrapper para administradores únicamente
interface AdminOnlyProps {
  children: ReactNode;
  user: User | null;
  fallbackMessage?: string;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({
  children,
  user,
  fallbackMessage = 'Solo los administradores pueden acceder a esta función'
}) => {
  return (
    <RoleGuard
      user={user}
      anyRole={['admin', 'super_admin']}
      fallback={
        <div className="text-center p-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800">
              <span className="font-medium">Acceso de administrador requerido:</span> {fallbackMessage}
            </p>
          </div>
        </div>
      }
    >
      {children}
    </RoleGuard>
  );
};

// Componente wrapper para super administradores únicamente
interface SuperAdminOnlyProps {
  children: ReactNode;
  user: User | null;
  fallbackMessage?: string;
}

export const SuperAdminOnly: React.FC<SuperAdminOnlyProps> = ({
  children,
  user,
  fallbackMessage = 'Solo los super administradores pueden acceder a esta función'
}) => {
  return (
    <RoleGuard
      user={user}
      role="super_admin"
      fallback={
        <div className="text-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <span className="font-medium">Acceso de super administrador requerido:</span> {fallbackMessage}
            </p>
          </div>
        </div>
      }
    >
      {children}
    </RoleGuard>
  );
};

// HOC para componentes que requieren roles específicos
export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  role: RoleName,
  fallback?: ReactNode
) {
  const WithRoleGuard = (props: P & { user: User | null }) => {
    const { user, ...otherProps } = props;
    
    return (
      <RoleGuard user={user} role={role} fallback={fallback}>
        <WrappedComponent {...(otherProps as P)} />
      </RoleGuard>
    );
  };

  WithRoleGuard.displayName = `withRoleGuard(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithRoleGuard;
}

// Hook para verificar roles
export const useRoleCheck = (user: User | null) => {
  return {
    hasRole: (role: RoleName) => hasRole(user, role),
    hasAnyRole: (roles: RoleName[]) => hasAnyRole(user, roles),
    isUser: () => hasRole(user, 'user'),
    isModerator: () => hasRole(user, 'moderator'),
    isAdmin: () => hasAnyRole(user, ['admin', 'super_admin']),
    isSuperAdmin: () => hasRole(user, 'super_admin'),
    getCurrentRole: () => user?.role?.name || null,
    getCurrentRoleDisplay: () => user?.role?.display_name || 'Sin rol'
  };
};