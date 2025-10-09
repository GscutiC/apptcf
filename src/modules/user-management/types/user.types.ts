/**
 * Tipos para el sistema de gestión de usuarios
 * Basado en la implementación del backend
 */

// Permisos del sistema (basados en backend/permissions.py)
export type Permission = 
  // Users permissions
  | 'users.create'
  | 'users.read' 
  | 'users.update'
  | 'users.delete'
  | 'users.list'
  // Roles permissions  
  | 'roles.create'
  | 'roles.read'
  | 'roles.update' 
  | 'roles.delete'
  | 'roles.list'
  | 'roles.assign'
  // Messages permissions
  | 'messages.create'
  | 'messages.read'
  | 'messages.update'
  | 'messages.delete'
  | 'messages.list'
  // AI permissions
  | 'ai.process'
  // Admin permissions
  | 'admin.manage_settings'
  // Audit permissions
  | 'audit.view_logs'
  // Modules permissions
  | 'modules.techo_propio';

export type RoleName = 'user' | 'moderator' | 'admin' | 'super_admin';

export interface UserRole {
  id: string;
  name: string; // Cambiado de RoleName a string para permitir roles dinámicos
  display_name: string;
  description?: string;
  permissions: Permission[];
  is_active: boolean;
  is_system_role?: boolean; // Campo opcional del backend
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  image_url?: string;
  phone_number?: string;
  role?: UserRole;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  image_url?: string;
  phone_number?: string;
  role_name?: string; // Cambiado de RoleName a string
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  image_url?: string;
  phone_number?: string;
  role_name?: string; // Cambiado de RoleName a string
  is_active?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  display_name: string;
  description?: string;
  permissions: Permission[];
}

export interface UpdateRoleRequest {
  display_name?: string;
  description?: string;
  permissions?: Permission[];
  is_active?: boolean;
}

// Tipos para componentes
export interface UserListFilters {
  search?: string;
  role?: string | 'all'; // Cambiado de RoleName a string
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'name' | 'email' | 'created_at' | 'last_login';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

// Estados de operaciones
export interface OperationState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UserOperation extends OperationState {
  data?: User;
}

export interface UsersOperation extends OperationState {
  data?: UsersResponse;
}

export interface RolesOperation extends OperationState {
  data?: UserRole[];
}

// Tipos para formularios
export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role_name: string; // Cambiado de RoleName a string para roles dinámicos
  is_active: boolean;
}

export interface RoleFormData {
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
  is_active: boolean;
}

// Tipos para contexto
export interface UserContextState {
  users: User[];
  selectedUser: User | null;
  filters: UserListFilters;
  pagination: PaginationInfo;
  operations: {
    list: OperationState;
    create: OperationState;
    update: OperationState;
    delete: OperationState;
  };
}

export interface RoleContextState {
  roles: UserRole[];
  selectedRole: UserRole | null;
  operations: {
    list: OperationState;
    create: OperationState;
    update: OperationState;
    delete: OperationState;
  };
}

// Tipos para utilidades
export interface PermissionGroup {
  category: string;
  permissions: {
    permission: Permission;
    description: string;
  }[];
}

export interface RolePermissionMatrix {
  [role: string]: Permission[];
}