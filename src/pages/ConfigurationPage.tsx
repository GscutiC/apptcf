/**
 * Ejemplo de uso del módulo de configuración con guardado manual
 */

import React from 'react';
import { 
  InterfaceConfigProvider,
  ThemeConfigPanel,
  SaveStatusIndicator,
  ConfigUsageGuide,
  useInterfaceConfig
} from '../modules/interface-config';

// Wrapper para conectar ThemeConfigPanel con el contexto
const ThemeConfigPanelWrapper: React.FC = () => {
  const { config, setConfig } = useInterfaceConfig();
  return <ThemeConfigPanel config={config} onChange={setConfig} />;
};

export const ConfigurationPage: React.FC = () => {
  return (
    <InterfaceConfigProvider>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Configuración de Interfaz
          </h1>
          <SaveStatusIndicator />
        </div>

        {/* Guía explicativa */}
        <ConfigUsageGuide />

        {/* Panel principal de configuración */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Temas y Colores
            </h2>
            <p className="text-gray-600 mt-1">
              Personaliza la paleta de colores de tu aplicación. 
              Los cambios se mostrarán inmediatamente, pero solo se guardarán al hacer clic en "Guardar".
            </p>
          </div>
          
          <div className="p-6">
            <ThemeConfigPanelWrapper />
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Consejos de Uso</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li><strong>Previsualización en tiempo real:</strong> Los cambios se ven inmediatamente en la interfaz</li>
            <li><strong>Guardado manual seguro:</strong> Solo se persisten cuando haces clic en "Guardar"</li>
            <li><strong>Descartar cambios:</strong> Puedes revertir todos los cambios no guardados fácilmente</li>
            <li><strong>Paletas independientes:</strong> Primario, Secundario, Acento y Neutral se editan por separado</li>
          </ul>
        </div>
      </div>
    </InterfaceConfigProvider>
  );
};

export default ConfigurationPage;