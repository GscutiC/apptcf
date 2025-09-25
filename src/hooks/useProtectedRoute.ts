/**
 * Hook personalizado para manejo de rutas protegidas y permisos
 * Simplifica la verificación de acceso en componentes
 */

import { useAuthProfile } from './useAuthProfile';
import { adaptUserProfileToUser } from '../shared/utils/userAdapter';
import { RoleName, Permission } from '../modules/user-management/types/user.types';
import { 
  hasRole, 
  hasAnyRole, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions 
} from '../modules/user-management/utils/permissions.utils';

export interface UseProtectedRouteOptions {
  role?: string;
  anyRole?: string[];
  permission?: Permission;
  anyPermission?: Permission[];
  allPermissions?: Permission[];
}

export interface UseProtectedRouteResult {
  // Estado del usuario
  user: ReturnType<typeof adaptUserProfileToUser>;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Verificaciones de acceso
  hasAccess: boolean;
  canAccess: (options: UseProtectedRouteOptions) => boolean;
  
  // Verificaciones específicas
  checkRole: (role: string) => boolean;
  checkAnyRole: (roles: string[]) => boolean;
  checkPermission: (permission: Permission) => boolean;
  checkAnyPermission: (permissions: Permission[]) => boolean;
  checkAllPermissions: (permissions: Permission[]) => boolean;
  
  // Información de roles y permisos
  userRole: string | undefined;
  userPermissions: Permission[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export const useProtectedRoute = (options: UseProtectedRouteOptions = {}): UseProtectedRouteResult => {
  const { userProfile, loading } = useAuthProfile();
  const user = adaptUserProfileToUser(userProfile);
  
  const isAuthenticated = !!user;
  const isLoading = loading;
  
  // Función principal de verificación de acceso
  const canAccess = (checkOptions: UseProtectedRouteOptions): boolean => {
    if (!user) return false;
    
    // Verificar rol específico
    if (checkOptions.role && !hasRole(user, checkOptions.role)) {
      return false;
    }
    
    // Verificar cualquiera de los roles
    if (checkOptions.anyRole && checkOptions.anyRole.length > 0 && !hasAnyRole(user, checkOptions.anyRole)) {
      return false;
    }
    
    // Verificar permiso específico
    if (checkOptions.permission && !hasPermission(user, checkOptions.permission)) {
      return false;
    }
    
    // Verificar cualquiera de los permisos
    if (checkOptions.anyPermission && checkOptions.anyPermission.length > 0 && !hasAnyPermission(user, checkOptions.anyPermission)) {
      return false;
    }
    
    // Verificar todos los permisos
    if (checkOptions.allPermissions && checkOptions.allPermissions.length > 0 && !hasAllPermissions(user, checkOptions.allPermissions)) {
      return false;
    }
    
    return true;
  };
  
  // Verificar acceso con las opciones proporcionadas
  const hasAccess = canAccess(options);
  
  // Funciones de verificación específicas
  const checkRole = (role: string): boolean => {
    return user ? hasRole(user, role) : false;
  };
  
  const checkAnyRole = (roles: string[]): boolean => {
    return user ? hasAnyRole(user, roles) : false;
  };
  
  const checkPermission = (permission: Permission): boolean => {
    return user ? hasPermission(user, permission) : false;
  };
  
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    return user ? hasAnyPermission(user, permissions) : false;
  };
  
  const checkAllPermissions = (permissions: Permission[]): boolean => {
    return user ? hasAllPermissions(user, permissions) : false;
  };
  
  // Información de roles y permisos
  const userRole = user?.role?.display_name;
  const userPermissions = user?.role?.permissions || [];
  const isAdmin = checkAnyRole(['admin', 'super_admin']);
  const isSuperAdmin = checkRole('super_admin');
  
  return {
    // Estado del usuario
    user,
    isLoading,
    isAuthenticated,
    
    // Verificaciones de acceso
    hasAccess,
    canAccess,
    
    // Verificaciones específicas
    checkRole,
    checkAnyRole,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    
    // Información de roles y permisos
    userRole,
    userPermissions,
    isAdmin,
    isSuperAdmin
  };
};

export default useProtectedRoute;