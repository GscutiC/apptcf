import { useState, useEffect, useRef, useCallback } from 'react';
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
        return;
      }

      // Evitar cargas duplicadas para el mismo usuario
      const currentClerkId = clerkUser?.id;
      if (!currentClerkId) return;
      
      // Si ya cargamos este usuario, no volver a cargar
      if (hasLoadedRef.current && lastClerkIdRef.current === currentClerkId) {
        return;
      }
      
      // Evitar llamadas concurrentes
      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;

      try {
        setLoading(true);
        setError(null);
        
        // Intentar sincronizar con el backend
        let profile = await authService.syncUserWithBackend(getToken);
        
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
            profile = await authService.syncUserWithBackend(getToken);
          }
        }
        
        setUserProfile(profile);
        hasLoadedRef.current = true;
        lastClerkIdRef.current = currentClerkId;
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando perfil');
        console.error('Error cargando perfil de usuario:', err);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadUserProfile();
  // Solo depender de isSignedIn e isLoaded para evitar bucles infinitos
  // clerkUser.id se verifica internamente
  }, [isSignedIn, isLoaded, clerkUser?.id]);

  const refreshProfile = useCallback(async () => {
    if (!isSignedIn || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      const profile = await authService.syncUserWithBackend(getToken);
      setUserProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando perfil');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isSignedIn, getToken]);

  return {
    userProfile,
    loading,
    error,
    refreshProfile,
    isSignedIn,
    clerkUser
  };
};