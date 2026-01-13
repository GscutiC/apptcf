/**
 * React Query hooks para gestión de usuarios
 * Reemplaza las llamadas directas a authService con cache inteligente
 * OPTIMIZADO: Usa refs para evitar re-renders por cambio de getToken
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { useRef, useEffect } from 'react';
import { authService } from '../../services/authService';

/**
 * Hook para obtener lista de usuarios
 * Cache: 5 minutos (alineado con backend)
 * OPTIMIZADO: Solo hace UNA llamada gracias a staleTime y refetchOnMount: false
 *
 * Uso:
 * const { data: users, isLoading, error, refetch } = useUsers();
 */
export const useUsers = () => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  
  // CRÍTICO: Guardar getToken en ref para evitar re-renders
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const users = await authService.getAllUsers(getTokenRef.current);
      return users;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 10 * 60 * 1000,    // 10 minutos
    // CRÍTICO: Usar isSignedIn (boolean estable) en lugar de !!getToken (función siempre truthy)
    enabled: isLoaded && isSignedIn,
    refetchOnMount: false,      // No refetch si hay cache válido
    refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
  });
};

/**
 * Hook para obtener un usuario específico
 * OPTIMIZADO: Usa la cache de users en lugar de hacer llamada separada
 *
 * Uso:
 * const { data: user, isLoading } = useUser(userId);
 */
export const useUser = (userId: string | null) => {
  const { isSignedIn, isLoaded } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) return null;
      // OPTIMIZADO: Usar cache existente de users si está disponible
      const cachedUsers = queryClient.getQueryData<any[]>(['users']);
      if (cachedUsers) {
        return cachedUsers.find(u => u.id === userId) || null;
      }
      return null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!userId && isLoaded && isSignedIn,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
  
  // CRÍTICO: Guardar getToken en ref para evitar re-renders
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  return useMutation({
    mutationFn: async ({ clerkId, roleName }: { clerkId: string; roleName: string }) => {
      const success = await authService.updateUserRole(getTokenRef.current, clerkId, roleName);
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
 * NOTA: Preferir useAuthContext() que ya tiene caché interno
 *
 * Uso:
 * const { data: currentUser, isLoading } = useCurrentUser();
 */
export const useCurrentUser = () => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  
  // CRÍTICO: Guardar getToken en ref para evitar re-renders
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  return useQuery({
    queryKey: ['users', 'current'],
    queryFn: async () => {
      const user = await authService.getCurrentUser(getTokenRef.current);
      return user;
    },
    staleTime: 10 * 60 * 1000,  // 10 minutos (perfil cambia menos)
    gcTime: 15 * 60 * 1000,     // 15 minutos
    enabled: isLoaded && isSignedIn,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
