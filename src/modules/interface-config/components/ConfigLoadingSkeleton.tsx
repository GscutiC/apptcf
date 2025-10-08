/**
 * Skeleton UI para estado de carga de configuraciones
 * Mejora la UX mientras se cargan configuraciones desde el backend
 */

import React from 'react';

interface ConfigLoadingSkeletonProps {
  variant?: 'full' | 'compact' | 'inline';
  message?: string;
}

/**
 * Componente Skeleton para carga de configuraciones
 */
export const ConfigLoadingSkeleton: React.FC<ConfigLoadingSkeletonProps> = ({ 
  variant = 'full',
  message = 'Cargando configuración desde el servidor...'
}) => {
  
  if (variant === 'inline') {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500" />
        <span>{message}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="rounded-full bg-gray-200 h-10 w-10" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  // Variant: full (default)
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="animate-pulse flex-1">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500" />
      </div>

      {/* Loading message */}
      <div className="flex items-center space-x-3 mb-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-300 border-t-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-900">{message}</p>
          <p className="text-xs text-blue-700">Por favor espera un momento</p>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-6 animate-pulse">
        {/* Section 1 */}
        <div>
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
          </div>
        </div>

        {/* Section 2 */}
        <div>
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Section 3 */}
        <div>
          <div className="h-5 bg-gray-200 rounded w-1/5 mb-3" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded w-5/6" />
            <div className="h-8 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
};

/**
 * Skeleton para lista de presets
 */
export const PresetsLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton para panel de configuración específico
 */
export const ConfigPanelSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Info box */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>

      {/* Form fields */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}

      {/* Color picker section */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Error state cuando falla la carga
 */
interface ConfigLoadErrorUIProps {
  error: string;
  onRetry?: () => void;
  onUseOffline?: () => void;
}

export const ConfigLoadErrorUI: React.FC<ConfigLoadErrorUIProps> = ({ 
  error, 
  onRetry,
  onUseOffline 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center">
        {/* Error icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Error message */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar configuración
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {error}
        </p>

        {/* Actions */}
        <div className="flex justify-center space-x-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
          )}
          {onUseOffline && (
            <button
              onClick={onUseOffline}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              Modo Offline
            </button>
          )}
        </div>

        {/* Help text */}
        <p className="mt-4 text-xs text-gray-400">
          Si el problema persiste, contacta al administrador del sistema
        </p>
      </div>
    </div>
  );
};

export default ConfigLoadingSkeleton;
