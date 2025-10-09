/**
 * React Query hooks para gestión de roles
 * Reemplaza las llamadas directas a authService y roleService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { authService } from '../../services/authService';

/**
 * Hook para obtener lista de roles
 * Cache: 10 minutos (roles cambian menos frecuentemente que usuarios)
 *
 * Uso:
 * const { data: roles, isLoading, error } = useRoles();
 */
export const useRoles = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const roles = await authService.getAllRoles(getToken);
      return roles;
    },
    staleTime: 10 * 60 * 1000,  // 10 minutos (roles son más estables)
    gcTime: 15 * 60 * 1000,     // 15 minutos
    enabled: !!getToken,
  });
};

/**
 * Hook para crear un nuevo rol
 * Invalida automáticamente el cache de roles
 *
 * Uso:
 * const createRole = useCreateRole();
 * await createRole.mutateAsync({
 *   name: 'moderator',
 *   display_name: 'Moderador',
 *   description: 'Rol de moderador',
 *   permissions: ['users.read', 'content.moderate']
 * });
 */
export const useCreateRole = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: {
      name: string;
      display_name: string;
      description: string;
      permissions: string[];
    }) => {
      const newRole = await authService.createRole(getToken, roleData);

      if (!newRole) {
        throw new Error('Error al crear el rol');
      }

      return newRole;
    },
    onSuccess: () => {
      // Invalidar cache de roles para refetch automático
      queryClient.invalidateQueries({ queryKey: ['roles'] });

      // También invalidar usuarios porque pueden tener roles actualizados
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Disparar evento global para otros componentes (compatibilidad)
      window.dispatchEvent(new CustomEvent('rolesUpdated'));
    },
  });
};

/**
 * Hook para actualizar un rol existente
 * Invalida automáticamente el cache de roles
 *
 * Uso:
 * const updateRole = useUpdateRole();
 * await updateRole.mutateAsync({
 *   roleId: 'role_123',
 *   roleData: { display_name: 'Nuevo nombre' }
 * });
 */
export const useUpdateRole = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      roleData,
    }: {
      roleId: string;
      roleData: {
        display_name?: string;
        description?: string;
        permissions?: string[];
      };
    }) => {
      const updatedRole = await authService.updateRole(getToken, roleId, roleData);

      if (!updatedRole) {
        throw new Error('Error al actualizar el rol');
      }

      return updatedRole;
    },
    onSuccess: () => {
      // Invalidar cache de roles
      queryClient.invalidateQueries({ queryKey: ['roles'] });

      // También invalidar usuarios porque sus permisos pueden haber cambiado
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Disparar evento global (compatibilidad)
      window.dispatchEvent(new CustomEvent('rolesUpdated'));
    },
  });
};

/**
 * Hook para refrescar manualmente los roles
 * Útil para sincronizar después de operaciones externas
 *
 * Uso:
 * const refreshRoles = useRefreshRoles();
 * refreshRoles();
 */
export const useRefreshRoles = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] });
  };
};

/**
 * Hook para escuchar eventos globales de actualización de roles
 * Útil para mantener compatibilidad con código existente
 *
 * Uso:
 * useRolesEventListener(); // Automáticamente invalida cache cuando se dispara 'rolesUpdated'
 */
export const useRolesEventListener = () => {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const handleRolesUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    };

    window.addEventListener('rolesUpdated', handleRolesUpdated);

    return () => {
      window.removeEventListener('rolesUpdated', handleRolesUpdated);
    };
  }, [queryClient]);
};

// Importar React para el useEffect
import React from 'react';
