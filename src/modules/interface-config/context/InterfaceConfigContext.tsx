/**
 * Contexto principal para configuración de interfaz
 * Implementa nueva arquitectura modular con servicios especializados
 * OPTIMIZADO: Memoización del valor del contexto para evitar re-renders
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useInterfaceConfig, UseInterfaceConfigReturn } from '../hooks/useInterfaceConfig';

// Crear contexto
const InterfaceConfigContext = createContext<UseInterfaceConfigReturn | null>(null);

// Props del provider
interface InterfaceConfigProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto de configuración de interfaz
 * OPTIMIZADO: Memoiza el valor para evitar re-renders innecesarios
 */
export const InterfaceConfigProvider: React.FC<InterfaceConfigProviderProps> = ({ children }) => {
  const configValue = useInterfaceConfig();

  // OPTIMIZADO: Memoizar el valor del contexto basado en valores primitivos estables
  const memoizedValue = useMemo(() => configValue, [
    configValue.config?.id,
    configValue.loading,
    configValue.error,
    configValue.isDirty,
    configValue.isSaving,
    configValue.isGlobalAdmin,
    configValue.configSource,
    configValue.isReady,
    // Las funciones ya están memoizadas en useInterfaceConfig
  ]);

  return (
    <InterfaceConfigContext.Provider value={memoizedValue}>
      {children}
    </InterfaceConfigContext.Provider>
  );
};

/**
 * Hook para usar el contexto de configuración de interfaz
 */
export const useInterfaceConfigContext = (): UseInterfaceConfigReturn => {
  const context = useContext(InterfaceConfigContext);
  
  if (!context) {
    throw new Error(
      'useInterfaceConfigContext debe ser usado dentro de un InterfaceConfigProvider'
    );
  }
  
  return context;
};

// Exportar también como alias para compatibilidad
export { useInterfaceConfigContext as useInterfaceConfig };

// Hook adicional para cambios de configuración (compatibilidad)
export const useConfigChange = () => {
  const { setConfig } = useInterfaceConfigContext();
  return { onChange: setConfig };
};

// Re-exportar tipos para conveniencia
export type { UseInterfaceConfigReturn };