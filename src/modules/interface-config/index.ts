/**
 * Módulo de configuración de interfaz - Arquitectura Modular v2.0
 * Implementa servicios especializados y arquitectura limpia
 */

// ===============================
// 🏛️ CONTEXTO Y HOOKS PRINCIPALES
// ===============================
export { InterfaceConfigProvider, useInterfaceConfig, useConfigChange } from './context/InterfaceConfigContext';

// ===============================
// 🎯 SERVICIOS ESPECIALIZADOS
// ===============================
export { ConfigStateService } from './services/configStateService';
export { ConfigComparisonService } from './services/configComparisonService';
export { DOMConfigService } from './services/domConfigService';

// Hook principal
export { useInterfaceConfig as useInterfaceConfigHook } from './hooks/useInterfaceConfig';

// ===============================
// 📦 COMPONENTES UI
// ===============================
export { InterfaceConfigManager } from './components/InterfaceConfigManager';
export { ThemeConfigPanel } from './components/ThemeConfigPanel';
export { LogoConfigPanel } from './components/LogoConfigPanel';
export { BrandingConfigPanel } from './components/BrandingConfigPanel';
export { PresetsPanel } from './components/PresetsPanel';
export { PreviewPanel } from './components/PreviewPanel';
export { ConfigSyncMonitor } from './components/ConfigSyncMonitor';
export { ConfigLoader } from './components/ConfigLoader';
export { SaveStatusIndicator } from './components/SaveStatusIndicator';
export { ConfigUsageGuide } from './components/ConfigUsageGuide';

// ===============================
// 🎯 TIPOS TYPESCRIPT
// ===============================
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

// Tipos de servicios
export type { 
  ConfigState, 
  ConfigAction
} from './services/configStateService';
export type { ConfigComparison } from './services/configComparisonService';
export type { UseInterfaceConfigReturn } from './hooks/useInterfaceConfig';

// ===============================
// 🛠️ SERVICIOS Y UTILIDADES
// ===============================
export { interfaceConfigService } from './services/interfaceConfigService';
export { httpService } from './services/httpService';

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
// useConfigSync removido - usaba lógica legacy conflictiva