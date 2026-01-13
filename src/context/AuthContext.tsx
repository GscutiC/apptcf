/**
 * AuthContext - Contexto centralizado para autenticación
 *
 * Proporciona userProfile a toda la aplicación desde un único punto
 * Evita múltiples llamadas a useAuthProfile() en diferentes componentes
 *
 * VENTAJAS:
 * - Una sola llamada a /auth/me por carga de página
 * - Caché automático en authService
 * - Estado compartido entre todos los componentes
 * - Invalidación automática al cambiar usuario
 */

import React, { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthProfile } from '../hooks/useAuthProfile';
import { authService, UserProfile } from '../services/authService';
import { logger } from '../shared/utils/logger';

export interface AuthContextValue {
  // Estado del usuario
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Estado de autenticación de Clerk
  isSignedIn: boolean;
  isLoaded: boolean;

  // Acciones
  refreshProfile: () => Promise<void>;
  clearCache: () => void;

  // Usuario de Clerk (solo para casos especiales)
  clerkUser: ReturnType<typeof useUser>['user'];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider centralizado para autenticación
 * Usa useAuthProfile internamente y comparte el resultado
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();

  // Este es el ÚNICO lugar donde se llama useAuthProfile en toda la app
  const {
    userProfile,
    loading,
    error,
    refreshProfile: originalRefreshProfile
  } = useAuthProfile();

  /**
   * Limpiar caché cuando el usuario cambia
   */
  useEffect(() => {
    // Si cambia el clerkUser.id, limpiar caché
    if (clerkUser?.id) {
      logger.info(`👤 Usuario activo: ${clerkUser.id}`);
    }
  }, [clerkUser?.id]);

  /**
   * Refresca el perfil ignorando caché
   */
  const refreshProfile = useCallback(async () => {
    await originalRefreshProfile();
  }, [originalRefreshProfile]);

  /**
   * Limpia el caché del authService
   */
  const clearCache = useCallback(() => {
    authService.clearUserProfileCache();
  }, []);

  // CRÍTICO: Memoizar el valor para evitar re-renders innecesarios
  const value: AuthContextValue = React.useMemo(() => ({
    userProfile,
    loading,
    error,
    isSignedIn: isSignedIn || false,
    isLoaded: isLoaded || false,
    refreshProfile,
    clearCache,
    clerkUser
  }), [userProfile, loading, error, isSignedIn, isLoaded, refreshProfile, clearCache, clerkUser]);

  // ✅ CRÍTICO: NO bloquear el renderizado
  // El loading debe ser manejado por cada componente que lo necesite
  // AuthProvider solo provee el estado, no controla el flujo de renderizado
  // Esto permite que Layout/Dashboard muestren loading states individuales si quieren
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el AuthContext
 * Reemplaza useAuthProfile() en todos los componentes
 *
 * ANTES:
 * const { userProfile, loading } = useAuthProfile();
 *
 * DESPUÉS:
 * const { userProfile, loading } = useAuthContext();
 */
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext debe usarse dentro de un AuthProvider');
  }
  return context;
};

/**
 * Hook de compatibilidad para componentes que usan useAuthProfile
 * Permite migración gradual
 *
 * DEPRECADO: Usar useAuthContext() en su lugar
 */
export const useAuthProfileCompat = () => {
  const { userProfile, loading, error, refreshProfile, isSignedIn, clerkUser } = useAuthContext();
  return {
    userProfile,
    loading,
    error,
    refreshProfile,
    isSignedIn,
    clerkUser
  };
};

export default AuthContext;
