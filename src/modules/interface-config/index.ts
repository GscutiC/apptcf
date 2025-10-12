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
export { dynamicConfigService, ConfigLoadError } from './services/dynamicConfigService';
export { presetEditService } from './services/presetEditService';

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
export { PresetEditModal } from './components/PresetEditModal';
export { PreviewPanel } from './components/PreviewPanel';
export { ConfigSyncMonitor } from './components/ConfigSyncMonitor';
export { ConfigLoader } from './components/ConfigLoader';
export { OptimizedConfigLoader } from './components/OptimizedConfigLoader';
export { SaveStatusIndicator } from './components/SaveStatusIndicator';
export { ConfigUsageGuide } from './components/ConfigUsageGuide';
export { 
  ConfigLoadingSkeleton, 
  ConfigLoadErrorUI,
  PresetsLoadingSkeleton,
  ConfigPanelSkeleton 
} from './components/ConfigLoadingSkeleton';

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

// Utilidades de configuración
export {
  DEFAULT_INTERFACE_CONFIG,  // Configuración de emergencia (fallback)
  validateConfig,            // Validación de configuración
  loadConfigFromBackend,     // ✅ Cargar config desde backend
  loadPresetsFromBackend     // ✅ Cargar presets desde backend
} from './utils/defaultConfigs';

// Hooks
// useConfigSync removido - usaba lógica legacy conflictiva