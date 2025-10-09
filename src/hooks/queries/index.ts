/**
 * Exportaciones centralizadas de React Query hooks
 * Importar desde: import { useUsers, useRoles } from '@/hooks/queries';
 */

// Hooks de usuarios
export {
  useUsers,
  useUser,
  useUpdateUserRole,
  useCurrentUser,
  useRefreshUsers,
} from './useUsers';

// Hooks de roles
export {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useRefreshRoles,
  useRolesEventListener,
} from './useRoles';
