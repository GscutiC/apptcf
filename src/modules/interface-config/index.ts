/**
 * Índice del módulo de configuración de interfaz
 */

// Contexto
export { InterfaceConfigProvider, useInterfaceConfig, useConfigChange } from './context/InterfaceConfigContext';

// Componentes principales
export { InterfaceConfigManager } from './components/InterfaceConfigManager';
export { ThemeConfigPanel } from './components/ThemeConfigPanel';
export { LogoConfigPanel } from './components/LogoConfigPanel';
export { BrandingConfigPanel } from './components/BrandingConfigPanel';
export { PresetsPanel } from './components/PresetsPanel';
export { PreviewPanel } from './components/PreviewPanel';
export { ConfigSyncMonitor } from './components/ConfigSyncMonitor';
export { ConfigLoader } from './components/ConfigLoader';

// Tipos
export type {
  InterfaceConfig,
  PresetConfig,
  ThemeConfig,
  ColorConfig,
  ColorShades,
  TypographyConfig,
  LayoutConfig,
  LogoConfig,
  BrandingConfig,
  ThemeContextValue,
  ConfigFormState,
  ConfigChangeEvent
} from './types';

// Servicios
export { interfaceConfigService } from './services/interfaceConfigService';
export { httpService } from './services/httpService';

// Utilidades
export {
  DEFAULT_INTERFACE_CONFIG,
  DARK_THEME_CONFIG,
  GREEN_CORPORATE_CONFIG,
  SYSTEM_PRESETS,
  getDefaultConfig,
  getPresetById,
  validateConfig
} from './utils/defaultConfigs';

// Hooks
export { useConfigSync } from './hooks/useConfigSync';