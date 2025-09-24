/**
 * Índice principal del módulo de gestión de usuarios
 * Exporta todos los componentes, hooks, servicios y tipos principales
 */

// Páginas principales
export { UsersPage } from './pages/UsersPage';

// Componentes
export { UserList } from './components/UserList';
export { UserForm } from './components/UserForm';

// Context y Providers
export { UserProvider, useUserContext } from './context/UserContext';
export { RoleProvider, useRoleContext } from './context/RoleContext';

// Servicios
export { userService } from './services/userService';
export { roleService } from './services/roleService';

// Types
export type {
  User,
  UserRole,
  Permission,
  RoleName,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  UserListFilters,
  UserFormData,
  RoleFormData,
  PaginationInfo,
  UsersResponse,
  UserContextState,
  RoleContextState
} from './types/user.types';

// Utilidades
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  getRoleDisplayName,
  getRoleColor,
  getPermissionDescription,
  canManageUser,
  formatDate,
  formatLastLogin,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_GROUPS
} from './utils/permissions.utils';

export {
  validateUserForm,
  validateRoleForm,
  sanitizeUserData,
  sanitizeRoleData,
  getFieldError,
  hasErrors
} from './utils/validation.utils';