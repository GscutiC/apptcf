/**
 * Utilidades para manejo de permisos
 * Basado en el sistema implementado en el backend
 */

import { Permission, UserRole, User, PermissionGroup, RoleName } from '../types/user.types';

// Definición de grupos de permisos con descripciones
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: 'Gestión de Usuarios',
    permissions: [
      { permission: 'users.create', description: 'Crear nuevos usuarios' },
      { permission: 'users.read', description: 'Ver información de usuarios' },
      { permission: 'users.update', description: 'Modificar usuarios existentes' },
      { permission: 'users.delete', description: 'Eliminar usuarios' },
      { permission: 'users.list', description: 'Listar todos los usuarios' },
      // users.assign_role se movió a roles.assign
    ]
  },
  {
    category: 'Gestión de Roles',
    permissions: [
      { permission: 'roles.create', description: 'Crear nuevos roles' },
      { permission: 'roles.read', description: 'Ver información de roles' },
      { permission: 'roles.update', description: 'Modificar roles existentes' },
      { permission: 'roles.delete', description: 'Eliminar roles' },
      { permission: 'roles.list', description: 'Listar todos los roles' },
      { permission: 'roles.assign', description: 'Asignar roles a usuarios' },
    ]
  },
  {
    category: 'Mensajería',
    permissions: [
      { permission: 'messages.create', description: 'Crear mensajes' },
      { permission: 'messages.read', description: 'Leer mensajes' },
      { permission: 'messages.update', description: 'Editar mensajes' },
      { permission: 'messages.delete', description: 'Eliminar mensajes' },
      { permission: 'messages.list', description: 'Listar mensajes' },
    ]
  },
  {
    category: 'Inteligencia Artificial',
    permissions: [
      { permission: 'ai.process', description: 'Procesar mensajes con IA' },
    ]
  },
  {
    category: 'Administración',
    permissions: [
      { permission: 'admin.manage_settings', description: 'Gestionar configuración del sistema' },
    ]
  },
  {
    category: 'Auditoría',
    permissions: [
      { permission: 'audit.view_logs', description: 'Ver registros de auditoría' },
    ]
  }
];

// Permisos por defecto para cada rol
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  user: [
    'messages.create',
    'messages.read', 
    'ai.process'
  ],
  moderator: [
    'messages.create',
    'messages.read',
    'messages.update', 
    'messages.delete',
    'users.read',
    'users.list',
    'ai.process'
  ],
  admin: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete', 
    'users.list',
    'roles.assign',
    'roles.read',
    'roles.list',
    'messages.create',
    'messages.read',
    'messages.update',
    'messages.delete',
    'messages.list',
    'ai.process',
    'audit.view_logs'
  ],
  super_admin: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.list',
    'roles.assign',
    'roles.create',
    'roles.read',
    'roles.update',
    'roles.delete',
    'roles.list',
    'messages.create',
    'messages.read',
    'messages.update',
    'messages.delete',
    'messages.list',
    'ai.process',
    'admin.manage_settings',
    'audit.view_logs'
  ]
};

/**
 * Verificar si un usuario tiene un permiso específico
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user || !user.role) return false;
  
  // Super admin tiene todos los permisos
  if (user.role.name === 'super_admin') return true;
  
  return user.role.permissions.includes(permission);
};

/**
 * Verificar si un usuario tiene al menos uno de los permisos especificados
 */
export const hasAnyPermission = (user: User | null, permissions: Permission[]): boolean => {
  if (!user || !user.role) return false;
  
  // Super admin tiene todos los permisos
  if (user.role.name === 'super_admin') return true;
  
  return permissions.some(permission => user.role!.permissions.includes(permission));
};

/**
 * Verificar si un usuario tiene todos los permisos especificados
 */
export const hasAllPermissions = (user: User | null, permissions: Permission[]): boolean => {
  if (!user || !user.role) return false;
  
  // Super admin tiene todos los permisos
  if (user.role.name === 'super_admin') return true;
  
  return permissions.every(permission => user.role!.permissions.includes(permission));
};

/**
 * Verificar si un usuario tiene un rol específico
 */
export const hasRole = (user: User | null, role: string): boolean => {
  return user?.role?.name === role;
};

/**
 * Verificar si un usuario tiene al menos uno de los roles especificados
 */
export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  if (!user?.role) return false;
  return roles.includes(user.role.name);
};

/**
 * Obtener el nombre de visualización del rol
 */
export const getRoleDisplayName = (roleName: string): string => {
  const displayNames: Record<string, string> = {
    user: 'Usuario',
    moderator: 'Moderador',
    admin: 'Administrador', 
    super_admin: 'Super Administrador'
  };
  
  // Para roles conocidos, usar su nombre de visualización
  const knownDisplayName = displayNames[roleName];
  if (knownDisplayName) return knownDisplayName;
  
  // Para roles dinámicos, capitalizar y formatear
  return roleName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Obtener el color del rol para UI
 */
export const getRoleColor = (roleName: string): string => {
  const colors: Record<string, string> = {
    user: 'bg-blue-100 text-blue-800 border-blue-200',
    moderator: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    super_admin: 'bg-red-100 text-red-800 border-red-200'
  };
  
  // Para roles dinámicos, usar colores predeterminados basados en el nombre
  const knownColor = colors[roleName];
  if (knownColor) return knownColor;
  
  // Para roles nuevos/dinámicos, generar un color consistente
  const hash = roleName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colorOptions = [
    'bg-green-100 text-green-800 border-green-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200'
  ];
  
  return colorOptions[Math.abs(hash) % colorOptions.length];
};

/**
 * Obtener descripción del permiso
 */
export const getPermissionDescription = (permission: Permission): string => {
  for (const group of PERMISSION_GROUPS) {
    const found = group.permissions.find(p => p.permission === permission);
    if (found) return found.description;
  }
  return permission;
};

/**
 * Obtener la categoría de un permiso
 */
export const getPermissionCategory = (permission: Permission): string => {
  for (const group of PERMISSION_GROUPS) {
    const found = group.permissions.find(p => p.permission === permission);
    if (found) return group.category;
  }
  return 'Otros';
};

/**
 * Verificar si un usuario puede realizar una acción sobre otro usuario
 */
export const canManageUser = (currentUser: User | null, targetUser: User): boolean => {
  if (!currentUser || !hasPermission(currentUser, 'users.update')) return false;
  
  // Super admin puede manejar cualquier usuario
  if (hasRole(currentUser, 'super_admin')) return true;
  
  // Admin puede manejar usuarios que no sean super_admin
  if (hasRole(currentUser, 'admin') && !hasRole(targetUser, 'super_admin')) return true;
  
  // Usuarios no pueden manejar otros usuarios excepto ellos mismos
  return currentUser.id === targetUser.id;
};

/**
 * Obtener permisos faltantes para un rol
 */
export const getMissingPermissions = (role: UserRole, requiredPermissions: Permission[]): Permission[] => {
  return requiredPermissions.filter(permission => !role.permissions.includes(permission));
};

/**
 * Formatear fecha para mostrar
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatear última conexión
 */
export const formatLastLogin = (lastLogin?: string): string => {
  if (!lastLogin) return 'Nunca';
  
  const date = new Date(lastLogin);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora mismo';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
  if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} horas`;
  if (diffInMinutes < 10080) return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  
  return formatDate(lastLogin);
};