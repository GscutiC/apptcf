/**
 * Panel de configuración visual del módulo Techo Propio
 * Permite a los usuarios personalizar colores, logos y textos del módulo
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTechoPropioConfigContext } from '../context/TechoPropioConfigContext';
import { TechoPropioColors, TechoPropioLogos, TechoPropioBranding } from '../types/config.types';
import { LogoUploadSimple } from './LogoUploadSimple';

export const TechoPropioConfigPanel: React.FC = () => {
  const { config, loading, isCustomized, saveConfig, resetConfig } = useTechoPropioConfigContext();
  const { getToken } = useAuth();

  // Estado local para edición
  const [localColors, setLocalColors] = useState<TechoPropioColors | null>(null);
  const [localLogos, setLocalLogos] = useState<TechoPropioLogos | null>(null);
  const [localBranding, setLocalBranding] = useState<TechoPropioBranding | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Inicializar estado local con la configuración actual
  useEffect(() => {
    if (config) {
      setLocalColors(config.colors);
      setLocalLogos(config.logos);
      setLocalBranding(config.branding);
    }
  }, [config]);

  // Manejar cambios en colores
  const handleColorChange = (key: keyof TechoPropioColors, value: string) => {
    if (!localColors) return;
    setLocalColors({ ...localColors, [key]: value });
    setIsDirty(true);
  };

  // Manejar cambios en logos
  const handleLogoChange = (key: keyof TechoPropioLogos, value: string) => {
    if (!localLogos) return;
    setLocalLogos({ ...localLogos, [key]: value });
    setIsDirty(true);
  };

  // Manejar upload de logo del sidebar
  const handleSidebarLogoUpload = (fileId: string, url: string) => {
    if (!localLogos) return;
    setLocalLogos({
      ...localLogos,
      sidebar_icon_file_id: fileId,
      sidebar_icon_url: url
    });
    setIsDirty(true);
  };

  // Manejar remove de logo del sidebar
  const handleSidebarLogoRemove = () => {
    if (!localLogos) return;
    setLocalLogos({
      ...localLogos,
      sidebar_icon_file_id: undefined,
      sidebar_icon_url: undefined
    });
    setIsDirty(true);
  };

  // Manejar upload de logo del header
  const handleHeaderLogoUpload = (fileId: string, url: string) => {
    if (!localLogos) return;
    setLocalLogos({
      ...localLogos,
      header_logo_file_id: fileId,
      header_logo_url: url
    });
    setIsDirty(true);
  };

  // Manejar remove de logo del header
  const handleHeaderLogoRemove = () => {
    if (!localLogos) return;
    setLocalLogos({
      ...localLogos,
      header_logo_file_id: undefined,
      header_logo_url: undefined
    });
    setIsDirty(true);
  };

  // Manejar cambios en branding
  const handleBrandingChange = (key: keyof TechoPropioBranding, value: string) => {
    if (!localBranding) return;
    setLocalBranding({ ...localBranding, [key]: value });
    setIsDirty(true);
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!localColors || !localLogos || !localBranding) return;

    setIsSaving(true);
    setMessage(null);

    const result = await saveConfig({
      colors: localColors,
      logos: localLogos,
      branding: localBranding
    });

    setIsSaving(false);

    if (result.success) {
      setIsDirty(false);
      setMessage({ type: 'success', text: '✅ Configuración guardada exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: `❌ Error: ${result.error}` });
    }
  };

  // Resetear a valores actuales (cancelar cambios)
  const handleCancel = () => {
    if (config) {
      setLocalColors(config.colors);
      setLocalLogos(config.logos);
      setLocalBranding(config.branding);
      setIsDirty(false);
    }
  };

  // Resetear a configuración por defecto
  const handleReset = async () => {
    if (!window.confirm('¿Estás seguro de que deseas resetear a la configuración por defecto?')) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await resetConfig();

    setIsSaving(false);

    if (result.success) {
      setIsDirty(false);
      setMessage({ type: 'success', text: '✅ Configuración reseteada a valores por defecto' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: `❌ Error: ${result.error}` });
    }
  };

  if (loading || !localColors || !localLogos || !localBranding) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando configuración...</div>
      </div>
    );
  }

  if (!localColors || !localLogos || !localBranding) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: No se pudo cargar la configuración</div>
      </div>
    );
  }

  return (
    <div 
      className="max-w-4xl mx-auto p-6 space-y-6"
      style={{
        // CSS Variables para preview en tiempo real
        '--tp-primary': localColors.primary,
        '--tp-secondary': localColors.secondary,
        '--tp-accent': localColors.accent
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            🎨 Configuración de Diseño
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Personaliza colores, logos y textos del módulo Techo Propio
          </p>
        </div>
        {isCustomized && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            ✨ Personalizado
          </span>
        )}
      </div>

      {/* Mensaje de éxito/error */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Indicador de cambios pendientes */}
      {isDirty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <span className="text-yellow-600">⚠️</span>
          <span className="text-sm text-yellow-800 font-medium">
            Tienes cambios sin guardar. Presiona "Guardar Cambios" para aplicarlos.
          </span>
        </div>
      )}

      {/* Layout Principal: 2 columnas en desktop, responsivo */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Columna Izquierda: Colores y Textos (2/3 del ancho) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Sección 1: Colores */}
          <div className="bg-white rounded-lg shadow p-4 space-y-2">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              🎨 Colores del Módulo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Color Primario */}
              <div className="flex flex-col items-center">
                <label className="text-sm font-medium text-gray-700">Primario</label>
                <input
                  type="color"
                  value={localColors?.primary || '#000000'}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-12 h-12 border rounded-full"
                />
              </div>

              {/* Color Secundario */}
              <div className="flex flex-col items-center">
                <label className="text-sm font-medium text-gray-700">Secundario</label>
                <input
                  type="color"
                  value={localColors?.secondary || '#000000'}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-12 h-12 border rounded-full"
                />
              </div>

              {/* Color de Acento */}
              <div className="flex flex-col items-center">
                <label className="text-sm font-medium text-gray-700">Acento</label>
                <input
                  type="color"
                  value={localColors?.accent || '#000000'}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-12 h-12 border rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Textos de Branding */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              � Textos y Branding
            </h3>

            <div className="space-y-4">
              {/* Título del Módulo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Módulo
                </label>
                <input
                  type="text"
                  value={localBranding.module_title}
                  onChange={(e) => handleBrandingChange('module_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Techo Propio"
                  maxLength={50}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Módulo
                </label>
                <input
                  type="text"
                  value={localBranding.module_description}
                  onChange={(e) => handleBrandingChange('module_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Gestión de Solicitudes"
                  maxLength={200}
                />
              </div>

              {/* Mensaje de Bienvenida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de Bienvenida
                </label>
                <input
                  type="text"
                  value={localBranding.dashboard_welcome}
                  onChange={(e) => handleBrandingChange('dashboard_welcome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bienvenido al sistema"
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Logos (1/3 del ancho) */}
        <div className="xl:col-span-1 space-y-4">
          {/* Sección 2: Logos */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              🖼️ Logos del Módulo
            </h3>

            {/* Ícono del Sidebar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícono del Sidebar
              </label>
              <LogoUploadSimple
                label="Cargar Ícono del Sidebar"
                description="Para la navegación lateral"
                currentValue={localLogos?.sidebar_icon_url || localLogos?.sidebar_icon || '🏠'}
                currentFileId={localLogos?.sidebar_icon_file_id}
                onUpload={handleSidebarLogoUpload}
                onRemove={handleSidebarLogoRemove}
                getToken={getToken}
              />
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Emoji Respaldo
                </label>
                <input
                  type="text"
                  value={localLogos?.sidebar_icon || ''}
                  onChange={(e) => handleLogoChange('sidebar_icon', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="🏠"
                  maxLength={5}
                />
              </div>
            </div>

            {/* Logo del Header */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo del Header
                <span className="text-xs text-gray-500 ml-1">(Botón Dashboard)</span>
              </label>
              <LogoUploadSimple
                label="Cargar Logo del Header"
                description="Clickeable → Dashboard Principal"
                currentValue={localLogos?.header_logo_url || localLogos?.header_logo || ''}
                currentFileId={localLogos?.header_logo_file_id}
                onUpload={handleHeaderLogoUpload}
                onRemove={handleHeaderLogoRemove}
                getToken={getToken}
              />
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Texto Respaldo
                </label>
                <input
                  type="text"
                  value={localLogos?.header_logo || ''}
                  onChange={(e) => handleLogoChange('header_logo', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="🏠 Inicio"
                  maxLength={20}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista Previa Mejorada */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          👁️ Vista Previa en Vivo
        </h3>
        
        {/* Paleta de Colores Visual */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">🎨 Paleta de Colores</h4>
          <div className="flex gap-2">
            <div className="flex-1 text-center">
              <div 
                className="h-16 rounded-lg shadow-lg border-2 border-white"
                style={{ backgroundColor: localColors.primary }}
              ></div>
              <p className="text-xs mt-1 font-medium text-gray-600">Primario</p>
              <p className="text-xs text-gray-500">{localColors.primary}</p>
            </div>
            <div className="flex-1 text-center">
              <div 
                className="h-16 rounded-lg shadow-lg border-2 border-white"
                style={{ backgroundColor: localColors.secondary }}
              ></div>
              <p className="text-xs mt-1 font-medium text-gray-600">Secundario</p>
              <p className="text-xs text-gray-500">{localColors.secondary}</p>
            </div>
            <div className="flex-1 text-center">
              <div 
                className="h-16 rounded-lg shadow-lg border-2 border-white"
                style={{ backgroundColor: localColors.accent }}
              ></div>
              <p className="text-xs mt-1 font-medium text-gray-600">Acento</p>
              <p className="text-xs text-gray-500">{localColors.accent}</p>
            </div>
          </div>
        </div>

        {/* Simulación de UI */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">🖼️ Simulación de Interfaz</h4>
          
          {/* Mock Header */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{localLogos.sidebar_icon}</span>
                <div>
                  <div className="font-semibold text-sm" style={{ color: localColors.primary }}>
                    {localBranding.module_title}
                  </div>
                  <div className="text-xs text-gray-500">{localBranding.module_description}</div>
                </div>
              </div>
              {localLogos.header_logo && (
                <div className="text-lg">{localLogos.header_logo}</div>
              )}
            </div>
          </div>

          {/* Mock Botones */}
          <div className="space-y-2">
            <button
              className="w-full px-4 py-2 rounded-lg text-white font-medium text-sm shadow-md hover:shadow-lg transition-all"
              style={{
                background: `linear-gradient(135deg, ${localColors.primary}, ${localColors.secondary})`
              }}
            >
              ✨ Botón Principal (Gradiente)
            </button>
            
            <button
              className="w-full px-4 py-2 rounded-lg text-white font-medium text-sm shadow-md hover:shadow-lg transition-all"
              style={{ backgroundColor: localColors.accent }}
            >
              🎯 Botón de Acción
            </button>

            <div className="bg-white rounded p-3 text-center border">
              <div className="text-sm text-gray-600 mb-1">{localBranding.dashboard_welcome}</div>
              <div className="text-xs text-gray-500">Estado: 🟢 Configuración personalizada activa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <button
          onClick={handleReset}
          disabled={!isCustomized || isSaving}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🔄 Resetear a Default
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};
