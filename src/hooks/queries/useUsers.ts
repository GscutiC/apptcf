/**
 * React Query hooks para gestión de usuarios
 * Reemplaza las llamadas directas a authService con cache inteligente
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { authService } from '../../services/authService';

/**
 * Hook para obtener lista de usuarios
 * Cache: 5 minutos (alineado con backend)
 *
 * Uso:
 * const { data: users, isLoading, error, refetch } = useUsers();
 */
export const useUsers = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const users = await authService.getAllUsers(getToken);
      return users;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 10 * 60 * 1000,     // 10 minutos
    enabled: !!getToken,        // Solo ejecutar si hay token
  });
};

/**
 * Hook para obtener un usuario específico
 *
 * Uso:
 * const { data: user, isLoading } = useUser(userId);
 */
export const useUser = (userId: string | null) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) return null;
      // Usar el método existente del servicio
      const users = await authService.getAllUsers(getToken);
      return users.find(u => u.id === userId) || null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!userId && !!getToken,
  });
};

/**
 * Hook para actualizar rol de usuario
 * Invalida automáticamente el cache de usuarios
 *
 * Uso:
 * const updateRole = useUpdateUserRole();
 * await updateRole.mutateAsync({ clerkId: 'user_123', roleName: 'admin' });
 */
export const useUpdateUserRole = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clerkId, roleName }: { clerkId: string; roleName: string }) => {
      const success = await authService.updateUserRole(getToken, clerkId, roleName);
      if (!success) {
        throw new Error('Error al actualizar el rol del usuario');
      }
      return success;
    },
    onSuccess: () => {
      // Invalidar cache de usuarios para refetch automático
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Hook para obtener perfil del usuario actual
 * Cache más agresivo ya que no cambia tan frecuentemente
 *
 * Uso:
 * const { data: currentUser, isLoading } = useCurrentUser();
 */
export const useCurrentUser = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['users', 'current'],
    queryFn: async () => {
      const user = await authService.getCurrentUser(getToken);
      return user;
    },
    staleTime: 10 * 60 * 1000,  // 10 minutos (perfil cambia menos)
    gcTime: 15 * 60 * 1000,     // 15 minutos
    enabled: !!getToken,
  });
};

/**
 * Hook para refrescar manualmente los usuarios
 * Útil después de operaciones que no usan React Query
 *
 * Uso:
 * const refreshUsers = useRefreshUsers();
 * refreshUsers();
 */
export const useRefreshUsers = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };
};
