import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { authService, UserProfile } from '../services/authService';

export const useAuthProfile = () => {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Intentar sincronizar con el backend
        let profile = await authService.syncUserWithBackend(getToken);
        
        // Si no funciona la sincronización normal, usar el método de debug
        if (!profile && clerkUser) {
          console.log('🔧 Usando método de debug para crear usuario...');
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando perfil');
        console.error('Error cargando perfil de usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [isSignedIn, isLoaded, clerkUser]);

  const refreshProfile = async () => {
    if (!isSignedIn) return;
    
    try {
      setLoading(true);
      setError(null);
      const profile = await authService.syncUserWithBackend(getToken);
      setUserProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando perfil');
    } finally {
      setLoading(false);
    }
  };

  return {
    userProfile,
    loading,
    error,
    refreshProfile,
    isSignedIn,
    clerkUser
  };
};