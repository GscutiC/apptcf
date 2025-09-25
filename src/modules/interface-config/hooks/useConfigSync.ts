/**
 * Hook para forzar actualización de configuración
 */

import { useInterfaceConfig } from '../context/InterfaceConfigContext';

export const useConfigSync = () => {
  const { config, loading } = useInterfaceConfig();

  const forceRefresh = async () => {
    try {
      // Forzar recarga de configuración desde el servidor
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/interface-config/current`);
      if (response.ok) {
        const freshConfig = await response.json();
        // Disparar evento personalizado para notificar el cambio
        window.dispatchEvent(new CustomEvent('interface-config-changed', { detail: freshConfig }));
        return freshConfig;
      }
    } catch (error) {
      console.error('Error forzando actualización de configuración:', error);
    }
    return null;
  };

  const syncWithOtherTabs = () => {
    // Disparar evento de sincronización
    const configString = JSON.stringify(config);
    localStorage.setItem('interface-config', configString);
    localStorage.setItem('interface-config-timestamp', Date.now().toString());
  };

  return {
    config,
    loading,
    forceRefresh,
    syncWithOtherTabs
  };
};