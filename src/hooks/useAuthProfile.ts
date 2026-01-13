import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { authService, UserProfile } from '../services/authService';

export const useAuthProfile = () => {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Referencias para evitar llamadas múltiples
  const isLoadingRef = useRef(false);
  const lastClerkIdRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);
  const getTokenRef = useRef(getToken);
  const mountedRef = useRef(false);

  // Actualizar la referencia de getToken sin causar re-renders
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // Memoizar el clerkUser.id para evitar re-renders innecesarios
  const clerkUserId = useMemo(() => clerkUser?.id, [clerkUser?.id]);

  useEffect(() => {
    const loadUserProfile = async () => {
      // Evitar ejecución si no está listo
      if (!isLoaded) return;

      // Si no está autenticado, limpiar y salir
      if (!isSignedIn) {
        setUserProfile(null);
        setLoading(false);
        hasLoadedRef.current = false;
        lastClerkIdRef.current = null;
        mountedRef.current = true;
        return;
      }

      // Evitar cargas duplicadas para el mismo usuario
      if (!clerkUserId) return;

      // Si ya cargamos este usuario, no volver a cargar
      if (hasLoadedRef.current && lastClerkIdRef.current === clerkUserId) {
        // Ya tenemos los datos cacheados, no hacer nada
        return;
      }

      // Evitar llamadas concurrentes
      if (isLoadingRef.current) {
        // Si ya hay una carga en progreso, no iniciar otra
        return;
      }

      isLoadingRef.current = true;

      try {
        setLoading(true);
        setError(null);

        // Intentar sincronizar con el backend (usa getTokenRef para evitar re-renders)
        let profile = await authService.syncUserWithBackend(getTokenRef.current);
        
        // Si no funciona la sincronización normal, usar el método de debug (solo una vez)
        if (!profile && clerkUser && !hasLoadedRef.current) {
          // Intentar crear usuario con método alternativo
          const debugResult = await authService.debugCreateUser({
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            first_name: clerkUser.firstName || '',
            last_name: clerkUser.lastName || '', 
            full_name: clerkUser.fullName || '',
            image_url: clerkUser.imageUrl || undefined,
            phone_number: clerkUser.primaryPhoneNumber?.phoneNumber || undefined
          });
          
          if (debugResult.success) {
            // Intentar obtener el perfil completo después de crear
            profile = await authService.syncUserWithBackend(getTokenRef.current);
          }
        }

        setUserProfile(profile);
        hasLoadedRef.current = true;
        lastClerkIdRef.current = clerkUserId;
        mountedRef.current = true;

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando perfil');
        // Error ya se logea en authService, no duplicar aquí
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadUserProfile();
  // OPTIMIZADO: Solo depender de valores primitivos estables
  // clerkUserId es memoizado, isSignedIn e isLoaded son booleanos estables
  }, [isSignedIn, isLoaded, clerkUserId]); // REMOVIDO clerkUser - solo necesitamos clerkUserId

  const refreshProfile = useCallback(async () => {
    if (!isSignedIn || isLoadingRef.current) return;

    isLoadingRef.current = true;

    try {
      setLoading(true);
      setError(null);
      const profile = await authService.syncUserWithBackend(getTokenRef.current);
      setUserProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando perfil');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isSignedIn]); // Removido getToken de las dependencias

  return {
    userProfile,
    loading,
    error,
    refreshProfile,
    isSignedIn,
    clerkUser
  };
};