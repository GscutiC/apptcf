/**
 * Panel para configuración de branding
 */

import React from 'react';
import { InterfaceConfig } from '../types';

interface BrandingConfigPanelProps {
  config: InterfaceConfig;
  onChange: (updates: Partial<InterfaceConfig>) => void;
}

export const BrandingConfigPanel: React.FC<BrandingConfigPanelProps> = ({ config, onChange }) => {
  const handleBrandingChange = (updates: Partial<typeof config.branding>) => {
    onChange({
      branding: {
        ...config.branding,
        ...updates
      }
    });
  };

  const brandingFields = [
    {
      key: 'appName' as keyof typeof config.branding,
      label: 'Nombre de la Aplicación',
      description: 'Nombre principal que aparece en el título de la página',
      placeholder: 'Ej: Mi App Completa',
      required: true
    },
    {
      key: 'appDescription' as keyof typeof config.branding,
      label: 'Descripción de la Aplicación',
      description: 'Descripción breve que aparece en metadatos y página de login',
      placeholder: 'Ej: Sistema de gestión integral con IA',
      required: true
    },
    {
      key: 'tagline' as keyof typeof config.branding,
      label: 'Eslogan',
      description: 'Frase corta que define la propuesta de valor',
      placeholder: 'Ej: Gestión inteligente y eficiente',
      required: false
    },
    {
      key: 'companyName' as keyof typeof config.branding,
      label: 'Nombre de la Empresa',
      description: 'Nombre de la organización o empresa',
      placeholder: 'Ej: Mi Empresa S.A.',
      required: false
    },
    {
      key: 'welcomeMessage' as keyof typeof config.branding,
      label: 'Mensaje de Bienvenida',
      description: 'Mensaje que aparece en la página de login',
      placeholder: 'Ej: ¡Bienvenido a Mi App Completa!',
      required: true
    },
    {
      key: 'loginPageTitle' as keyof typeof config.branding,
      label: 'Título de Página de Login',
      description: 'Título principal en la página de inicio de sesión',
      placeholder: 'Ej: ¡Bienvenido a Mi App Completa!',
      required: true
    },
    {
      key: 'loginPageDescription' as keyof typeof config.branding,
      label: 'Descripción de Página de Login',
      description: 'Texto descriptivo en la página de inicio de sesión',
      placeholder: 'Ej: Inicia sesión o regístrate para acceder...',
      required: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Información general */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">🏷️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-blue-800">Configuración de Marca</h3>
            <p className="text-blue-600 text-sm mt-1">
              Personaliza los textos y mensajes que definen la identidad de tu aplicación.
              Estos cambios se reflejarán en toda la interfaz de usuario.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de configuración */}
      <div className="space-y-6">
        {brandingFields.map((field) => (
          <div key={field.key} className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <p className="text-sm text-neutral-600 mt-1">{field.description}</p>
              </div>
            </div>

            {/* Campo de texto o textarea según el tipo */}
            {field.key === 'appDescription' || field.key === 'loginPageDescription' ? (
              <textarea
                value={config.branding[field.key] || ''}
                onChange={(e) => handleBrandingChange({ [field.key]: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500 min-h-[80px] resize-y"
                placeholder={field.placeholder}
                required={field.required}
              />
            ) : (
              <input
                type="text"
                value={config.branding[field.key] || ''}
                onChange={(e) => handleBrandingChange({ [field.key]: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}

            {/* Contador de caracteres para campos largos */}
            {(field.key === 'appDescription' || field.key === 'loginPageDescription') && (
              <div className="mt-2 text-right">
                <span className="text-xs text-neutral-500">
                  {(config.branding[field.key] || '').length} caracteres
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vista previa del branding */}
      <div className="bg-neutral-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Vista Previa</h3>
        
        {/* Simulación de página de login */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 max-w-md mx-auto">
          <div className="text-center">
            {/* Logo simulado */}
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">
                {config.logos.mainLogo.text?.substring(0, 2).toUpperCase() || 'MA'}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-xl font-bold text-neutral-800 mb-2">
              {config.branding.loginPageTitle || 'Título de Login'}
            </h1>

            {/* Descripción */}
            <p className="text-neutral-600 text-sm mb-4">
              {config.branding.loginPageDescription || 'Descripción de la página de login'}
            </p>

            {/* Eslogan si existe */}
            {config.branding.tagline && (
              <p className="text-primary-600 text-sm font-medium mb-4">
                {config.branding.tagline}
              </p>
            )}

            {/* Botones simulados */}
            <div className="space-y-2">
              <div className="w-full py-2 px-4 bg-primary-600 text-white rounded text-sm">
                Iniciar Sesión
              </div>
              <div className="w-full py-2 px-4 border border-primary-600 text-primary-600 rounded text-sm">
                Registrarse
              </div>
            </div>

            {/* Nombre de empresa si existe */}
            {config.branding.companyName && (
              <p className="text-xs text-neutral-500 mt-4">
                © {new Date().getFullYear()} {config.branding.companyName}
              </p>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded border border-neutral-200 p-3">
            <h4 className="font-medium text-neutral-700 mb-1">Título de Página</h4>
            <p className="text-neutral-600">
              {config.branding.appName || 'Nombre de la Aplicación'}
            </p>
          </div>
          
          <div className="bg-white rounded border border-neutral-200 p-3">
            <h4 className="font-medium text-neutral-700 mb-1">Meta Descripción</h4>
            <p className="text-neutral-600">
              {config.branding.appDescription || 'Descripción de la aplicación'}
            </p>
          </div>
        </div>
      </div>

      {/* Consejos y mejores prácticas */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-amber-800 mb-2">Consejos para el Branding</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Mantén el nombre de la aplicación conciso y memorable</li>
              <li>• La descripción debe explicar claramente el propósito de la app</li>
              <li>• El eslogan debe ser breve y destacar el valor único</li>
              <li>• Los mensajes de bienvenida deben ser amigables y profesionales</li>
              <li>• Asegúrate de que todos los textos sean consistentes en tono</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};