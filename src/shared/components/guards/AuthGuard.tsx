/**
 * Guard básico de autenticación
 */

import React, { ReactNode } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireActive?: boolean;
  loading?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireActive = true,
  loading = false
}) => {
  const { isSignedIn, isLoaded } = useAuth();

  // Mostrar loading mientras carga la autenticación
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Verificando autenticación...</span>
      </div>
    );
  }

  // Usuario no autenticado
  if (!isSignedIn) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="text-center p-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">🔒</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Autenticación Requerida
          </h3>
          <p className="text-gray-600 mb-4">
            Debes iniciar sesión para acceder a este contenido.
          </p>
          <SignInButton mode="modal">
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
              Iniciar Sesión
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>;
};

// Componente wrapper más simple
interface RequireAuthProps {
  children: ReactNode;
  message?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  message = 'Debes iniciar sesión para continuar'
}) => {
  return (
    <AuthGuard
      fallback={
        <div className="text-center p-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <span className="font-medium">Acceso restringido:</span> {message}
            </p>
          </div>
        </div>
      }
    >
      {children}
    </AuthGuard>
  );
};

// HOC para componentes que requieren autenticación
export function withAuthGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WithAuthGuard = (props: P) => {
    return (
      <AuthGuard fallback={fallback}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };

  WithAuthGuard.displayName = `withAuthGuard(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithAuthGuard;
}