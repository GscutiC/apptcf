/**
 * Utilidades para convertir entre tipos del sistema existente y el nuevo sistema modular
 */

import { UserProfile } from '../../services/authService';
import { User } from '../../modules/user-management/types/user.types';

/**
 * Convierte UserProfile (sistema existente) a User (sistema modular)
 */
export const adaptUserProfileToUser = (userProfile: UserProfile | null): User | null => {
  if (!userProfile) return null;

  return {
    id: userProfile.id,
    clerk_id: userProfile.clerk_id,
    email: userProfile.email,
    first_name: userProfile.first_name,
    last_name: userProfile.last_name,
    full_name: userProfile.full_name,
    image_url: userProfile.image_url,
    phone_number: userProfile.phone_number,
    role: userProfile.role ? {
      id: userProfile.role.id,
      name: userProfile.role.name as any,
      display_name: userProfile.role.display_name,
      description: userProfile.role.description,
      permissions: userProfile.role.permissions as any[],
      is_active: userProfile.role.is_active,
      created_at: new Date().toISOString(), // Valor por defecto
      updated_at: new Date().toISOString()  // Valor por defecto
    } : undefined,
    is_active: userProfile.is_active,
    last_login: userProfile.last_login,
    created_at: userProfile.created_at,
    updated_at: userProfile.updated_at
  };
};

/**
 * Convierte User (sistema modular) a UserProfile (sistema existente)
 */
export const adaptUserToUserProfile = (user: User | null): UserProfile | null => {
  if (!user) return null;

  return {
    id: user.id,
    clerk_id: user.clerk_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: user.full_name,
    image_url: user.image_url,
    phone_number: user.phone_number,
    role: user.role ? {
      id: user.role.id,
      name: user.role.name,
      display_name: user.role.display_name,
      description: user.role.description,
      permissions: user.role.permissions,
      is_active: user.role.is_active
    } : undefined,
    is_active: user.is_active,
    last_login: user.last_login,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
};