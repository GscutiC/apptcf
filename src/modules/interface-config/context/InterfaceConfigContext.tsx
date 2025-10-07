/**
 * Contexto principal para configuración de interfaz
 * Implementa nueva arquitectura modular con servicios especializados
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useInterfaceConfig, UseInterfaceConfigReturn } from '../hooks/useInterfaceConfig';

// Crear contexto
const InterfaceConfigContext = createContext<UseInterfaceConfigReturn | null>(null);

// Props del provider
interface InterfaceConfigProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto de configuración de interfaz
 * Ahora es mucho más simple gracias a la arquitectura modular
 */
export const InterfaceConfigProvider: React.FC<InterfaceConfigProviderProps> = ({ children }) => {
  const configValue = useInterfaceConfig();

  return (
    <InterfaceConfigContext.Provider value={configValue}>
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