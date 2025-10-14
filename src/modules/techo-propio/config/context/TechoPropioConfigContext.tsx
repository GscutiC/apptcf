/**
 * Context Provider para la configuración visual del módulo Techo Propio
 * Proporciona acceso global a la configuración en todo el módulo
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useTechoPropioConfig, UseTechoPropioConfigResult } from '../hooks/useTechoPropioConfig';

/**
 * Tipo del contexto
 */
type TechoPropioConfigContextValue = UseTechoPropioConfigResult;

/**
 * Contexto de configuración
 */
const TechoPropioConfigContext = createContext<TechoPropioConfigContextValue | null>(null);

/**
 * Props del Provider
 */
interface TechoPropioConfigProviderProps {
  children: ReactNode;
}

/**
 * Provider de configuración del módulo Techo Propio
 * Debe envolver el Layout del módulo para proporcionar configuración a todos los componentes
 *
 * @example
 * ```tsx
 * <TechoPropioConfigProvider>
 *   <TechoPropioLayout>
 *     <Dashboard />
 *   </TechoPropioLayout>
 * </TechoPropioConfigProvider>
 * ```
 */
export const TechoPropioConfigProvider: React.FC<TechoPropioConfigProviderProps> = ({ children }) => {
  const configValue = useTechoPropioConfig();

  return (
    <TechoPropioConfigContext.Provider value={configValue}>
      {children}
    </TechoPropioConfigContext.Provider>
  );
};

/**
 * Hook para acceder al contexto de configuración
 * Debe usarse dentro de un TechoPropioConfigProvider
 *
 * @throws Error si se usa fuera del Provider
 *
 * @example
 * ```tsx
 * const { config, loading, saveConfig } = useTechoPropioConfigContext();
 *
 * if (loading) return <Loading />;
 *
 * return (
 *   <div style={{ backgroundColor: config?.colors.primary }}>
 *     {config?.branding.module_title}
 *   </div>
 * );
 * ```
 */
export const useTechoPropioConfigContext = (): TechoPropioConfigContextValue => {
  const context = useContext(TechoPropioConfigContext);

  if (!context) {
    throw new Error(
      'useTechoPropioConfigContext debe usarse dentro de un TechoPropioConfigProvider. ' +
      'Asegúrate de envolver tu componente con <TechoPropioConfigProvider>.'
    );
  }

  return context;
};

/**
 * HOC para inyectar la configuración en un componente
 *
 * @example
 * ```tsx
 * const MyComponent = withTechoPropioConfig(({ config }) => {
 *   return <div>{config.branding.module_title}</div>;
 * });
 * ```
 */
export function withTechoPropioConfig<P extends object>(
  Component: React.ComponentType<P & { configContext: TechoPropioConfigContextValue }>
): React.FC<P> {
  return (props: P) => {
    const configContext = useTechoPropioConfigContext();
    return <Component {...props} configContext={configContext} />;
  };
}
