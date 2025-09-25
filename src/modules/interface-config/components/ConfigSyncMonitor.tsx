/**
 * Componente para sincronización automática de configuración
 * Se ejecuta en segundo plano para todos los usuarios
 */

import { useEffect } from 'react';
import { useInterfaceConfig } from '../context/InterfaceConfigContext';

interface ConfigSyncMonitorProps {
  children?: React.ReactNode;
}

export const ConfigSyncMonitor: React.FC<ConfigSyncMonitorProps> = ({ children }) => {
  const { config } = useInterfaceConfig();

  useEffect(() => {
    // Función para verificar cambios de configuración
    const checkForConfigUpdates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/interface-config/current`);
        if (response.ok) {
          const serverConfig = await response.json();
          const currentConfigString = JSON.stringify(config);
          const serverConfigString = JSON.stringify(serverConfig);
          
          if (currentConfigString !== serverConfigString) {
            console.log('🔄 Nueva configuración detectada desde servidor');
            window.dispatchEvent(new CustomEvent('interface-config-changed', { detail: serverConfig }));
          }
        }
      } catch (error) {
        // Silenciosamente manejar errores de conexión
        console.debug('Config sync check failed (expected if backend is down):', error);
      }
    };

    // Verificar inmediatamente
    checkForConfigUpdates();

    // Configurar verificación periódica cada 15 segundos
    const interval = setInterval(checkForConfigUpdates, 15000);

    // Listener para cambios en localStorage desde otras pestañas
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'interface-config' && event.newValue) {
        try {
          const newConfig = JSON.parse(event.newValue);
          console.log('🔄 Configuración actualizada desde otra pestaña');
          window.dispatchEvent(new CustomEvent('interface-config-changed', { detail: newConfig }));
        } catch (error) {
          console.error('Error parsing storage config:', error);
        }
      }
    };

    // Listener para eventos de visibilidad (cuando el usuario vuelve a la pestaña)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Verificar configuración cuando el usuario vuelve a la pestaña
        setTimeout(checkForConfigUpdates, 1000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [config]);

  // Este componente no renderiza nada visible
  return <>{children}</>;
};