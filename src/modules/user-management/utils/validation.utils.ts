/**
 * Utilidades de validación para formularios de usuarios y roles
 */

import { UserFormData, RoleFormData, Permission } from '../types/user.types';

// Patrones de validación
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+?[1-9]\d{1,14})?$/; // E.164 format
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;

// Tipos de errores de validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validar datos de usuario
 */
export const validateUserForm = (data: UserFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar nombre
  if (!data.first_name.trim()) {
    errors.push({ field: 'first_name', message: 'El nombre es obligatorio' });
  } else if (!NAME_REGEX.test(data.first_name.trim())) {
    errors.push({ field: 'first_name', message: 'El nombre debe tener entre 2 y 50 caracteres y contener solo letras' });
  }

  // Validar apellido
  if (!data.last_name.trim()) {
    errors.push({ field: 'last_name', message: 'El apellido es obligatorio' });
  } else if (!NAME_REGEX.test(data.last_name.trim())) {
    errors.push({ field: 'last_name', message: 'El apellido debe tener entre 2 y 50 caracteres y contener solo letras' });
  }

  // Validar email
  if (!data.email.trim()) {
    errors.push({ field: 'email', message: 'El email es obligatorio' });
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.push({ field: 'email', message: 'El formato del email no es válido' });
  }

  // Validar teléfono (opcional)
  if (data.phone_number && data.phone_number.trim() && !PHONE_REGEX.test(data.phone_number.trim())) {
    errors.push({ field: 'phone_number', message: 'El formato del teléfono no es válido' });
  }

  // Validar rol
  if (!data.role_name) {
    errors.push({ field: 'role_name', message: 'Debe seleccionar un rol' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar datos de rol
 */
export const validateRoleForm = (data: RoleFormData, existingRoles: string[] = []): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar nombre del rol
  if (!data.name.trim()) {
    errors.push({ field: 'name', message: 'El nombre del rol es obligatorio' });
  } else if (data.name.trim().length < 2 || data.name.trim().length > 50) {
    errors.push({ field: 'name', message: 'El nombre debe tener entre 2 y 50 caracteres' });
  } else if (!/^[a-z_]+$/.test(data.name.trim())) {
    errors.push({ field: 'name', message: 'El nombre solo puede contener letras minúsculas y guiones bajos' });
  } else if (existingRoles.includes(data.name.trim())) {
    errors.push({ field: 'name', message: 'Ya existe un rol con este nombre' });
  }

  // Validar nombre de visualización
  if (!data.display_name.trim()) {
    errors.push({ field: 'display_name', message: 'El nombre de visualización es obligatorio' });
  } else if (data.display_name.trim().length < 2 || data.display_name.trim().length > 100) {
    errors.push({ field: 'display_name', message: 'El nombre de visualización debe tener entre 2 y 100 caracteres' });
  }

  // Validar descripción (opcional)
  if (data.description && data.description.trim().length > 500) {
    errors.push({ field: 'description', message: 'La descripción no puede exceder los 500 caracteres' });
  }

  // Validar permisos
  if (!data.permissions || data.permissions.length === 0) {
    errors.push({ field: 'permissions', message: 'Debe seleccionar al menos un permiso' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitizar datos de entrada
 */
export const sanitizeUserData = (data: UserFormData): UserFormData => {
  return {
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    email: data.email.trim().toLowerCase(),
    phone_number: data.phone_number?.trim() || undefined,
    role_name: data.role_name,
    is_active: data.is_active
  };
};

/**
 * Sanitizar datos de rol
 */
export const sanitizeRoleData = (data: RoleFormData): RoleFormData => {
  return {
    name: data.name.trim().toLowerCase(),
    display_name: data.display_name.trim(),
    description: data.description?.trim() || '',
    permissions: data.permissions,
    is_active: data.is_active
  };
};

/**
 * Validar que un array de permisos sea válido
 */
export const validatePermissions = (permissions: string[]): Permission[] => {
  const validPermissions: Permission[] = [
    'users.create', 'users.read', 'users.update', 'users.delete', 'users.list', 'users.assign_role',
    'roles.create', 'roles.read', 'roles.update', 'roles.delete', 'roles.list', 'roles.assign',
    'messages.create', 'messages.read', 'messages.update', 'messages.delete',
    'ai.process_message', 'ai.access_advanced',
    'admin.dashboard', 'admin.system_settings',
    'system.read', 'system.maintenance',
    'audit.view_logs'
  ];

  return permissions.filter(permission => 
    validPermissions.includes(permission as Permission)
  ) as Permission[];
};

/**
 * Obtener errores de un campo específico
 */
export const getFieldError = (errors: ValidationError[], fieldName: string): string | undefined => {
  const error = errors.find(err => err.field === fieldName);
  return error?.message;
};

/**
 * Verificar si un formulario tiene errores
 */
export const hasErrors = (errors: ValidationError[]): boolean => {
  return errors.length > 0;
};

/**
 * Generar mensaje de resumen de errores
 */
export const getErrorSummary = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  return `Se encontraron ${errors.length} errores en el formulario`;
};