/**
 * Panel de vista previa para configuración de interfaz
 */

import React, { useState } from 'react';
import { InterfaceConfig } from '../types';

interface PreviewPanelProps {
  config: InterfaceConfig;
  originalConfig: InterfaceConfig;
}

type PreviewMode = 'login' | 'sidebar' | 'dashboard';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ config, originalConfig }) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('login');
  const [showComparison, setShowComparison] = useState(false);

  const previewModes = [
    { key: 'login' as PreviewMode, label: 'Página de Login', icon: '🔐', description: 'Vista de la página de inicio de sesión' },
    { key: 'sidebar' as PreviewMode, label: 'Sidebar', icon: '📋', description: 'Vista de la barra lateral de navegación' },
    { key: 'dashboard' as PreviewMode, label: 'Dashboard', icon: '📊', description: 'Vista del panel principal' },
  ];

  const LoginPreview: React.FC<{ config: InterfaceConfig }> = ({ config }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            {config.logos.mainLogo.showImage && config.logos.mainLogo.imageUrl ? (
              <img
                src={config.logos.mainLogo.imageUrl}
                alt="Logo"
                className="h-16"
              />
            ) : config.logos.mainLogo.showText ? (
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ 
                  background: `linear-gradient(45deg, ${config.theme.colors.primary['500']}, ${config.theme.colors.secondary['600']})` 
                }}
              >
                {config.logos.mainLogo.text?.substring(0, 2).toUpperCase()}
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">MA</span>
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {config.branding.loginPageTitle}
          </h1>

          {/* Descripción */}
          <p className="text-gray-600 mb-8">
            {config.branding.loginPageDescription}
          </p>

          {/* Eslogan */}
          {config.branding.tagline && (
            <p 
              className="font-medium mb-8"
              style={{ color: config.theme.colors.primary['600'] }}
            >
              {config.branding.tagline}
            </p>
          )}

          {/* Botones */}
          <div className="space-y-4">
            <button 
              className="w-full py-3 px-6 text-white rounded-lg font-medium"
              style={{ backgroundColor: config.theme.colors.primary['600'] }}
            >
              Iniciar Sesión
            </button>
            <button 
              className="w-full py-3 px-6 rounded-lg font-medium"
              style={{ 
                borderColor: config.theme.colors.primary['600'],
                color: config.theme.colors.primary['600'],
                borderWidth: '1px'
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Empresa */}
          {config.branding.companyName && (
            <p className="text-xs text-gray-500 mt-6">
              © {new Date().getFullYear()} {config.branding.companyName}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const SidebarPreview: React.FC<{ config: InterfaceConfig }> = ({ config }) => (
    <div className="flex h-96">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            {config.logos.sidebarLogo.showImage && config.logos.sidebarLogo.imageUrl ? (
              <img
                src={config.logos.sidebarLogo.imageUrl}
                alt="Logo"
                className="w-8 h-8 mr-3"
              />
            ) : null}
            {config.logos.sidebarLogo.showText && (
              <div>
                <h1 className="text-lg font-bold" style={{ color: config.theme.colors.primary['600'] }}>
                  {config.logos.sidebarLogo.text}
                </h1>
                <p className="text-xs text-gray-500">{config.branding.tagline}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {['Dashboard', 'Chat IA', 'Usuarios', 'Configuración', 'Mi Perfil'].map((item, index) => (
            <div
              key={item}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                index === 0 
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
              style={index === 0 ? { 
                background: `linear-gradient(45deg, ${config.theme.colors.primary['500']}, ${config.theme.colors.primary['600']})` 
              } : {}}
            >
              <span className="mr-3">
                {index === 0 ? '📊' : index === 1 ? '💬' : index === 2 ? '👥' : index === 3 ? '⚙️' : '👤'}
              </span>
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main content preview */}
      <div className="flex-1 p-6 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {config.branding.welcomeMessage}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="h-16 bg-gray-100 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DashboardPreview: React.FC<{ config: InterfaceConfig }> = ({ config }) => (
    <div className="p-6 bg-gray-50 min-h-96">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {config.branding.welcomeMessage}
          </h1>
          <p className="text-gray-600">{config.branding.appDescription}</p>
        </div>
        <div 
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: config.theme.colors.primary['600'] }}
        >
          Panel Administrativo
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Usuarios Activos', value: '1,234', color: config.theme.colors.primary['500'] },
          { label: 'Mensajes IA', value: '5,678', color: config.theme.colors.secondary['500'] },
          { label: 'Configuraciones', value: '42', color: config.theme.colors.accent['500'] },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white mr-4"
                style={{ backgroundColor: stat.color }}
              >
                {index === 0 ? '👥' : index === 1 ? '💬' : '⚙️'}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
        <div className="h-40 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
          <p className="text-gray-600">Gráfico de actividad - Vista previa</p>
        </div>
      </div>
    </div>
  );

  const renderPreview = (config: InterfaceConfig) => {
    switch (previewMode) {
      case 'login':
        return <LoginPreview config={config} />;
      case 'sidebar':
        return <SidebarPreview config={config} />;
      case 'dashboard':
        return <DashboardPreview config={config} />;
      default:
        return <LoginPreview config={config} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de vista previa */}
      <div className="bg-neutral-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">Vista Previa en Tiempo Real</h3>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-neutral-700">Comparar con original</span>
            </label>
          </div>
        </div>

        {/* Selector de modo de vista previa */}
        <div className="flex space-x-2">
          {previewModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setPreviewMode(mode.key)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                previewMode === mode.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
              }`}
              title={mode.description}
            >
              <span className="mr-2">{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vista previa */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {showComparison ? (
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Configuración actual */}
            <div className="border-r border-neutral-200">
              <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-800">Nueva Configuración</h4>
              </div>
              <div className="overflow-auto max-h-96">
                {renderPreview(config)}
              </div>
            </div>

            {/* Configuración original */}
            <div>
              <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-800">Configuración Actual</h4>
              </div>
              <div className="overflow-auto max-h-96">
                {renderPreview(originalConfig)}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-auto max-h-96">
            {renderPreview(config)}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <span className="text-2xl mr-3">ℹ️</span>
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Acerca de la Vista Previa</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• La vista previa muestra una simulación de cómo se verá tu configuración</li>
              <li>• Los cambios se aplican automáticamente en la vista previa</li>
              <li>• Usa el modo comparación para ver diferencias con la configuración actual</li>
              <li>• Algunos elementos pueden verse ligeramente diferentes en la aplicación real</li>
              <li>• Guarda los cambios para aplicarlos permanentemente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};