/**
 * Panel para configuración de logos
 */

import React, { useState, useRef } from 'react';
import { InterfaceConfig } from '../types';
import { FileUploadService, LogoData } from '../services/fileUploadService';

interface LogoConfigPanelProps {
  config: InterfaceConfig;
  onChange: (updates: Partial<InterfaceConfig>) => void;
}

interface LogoUploaderProps {
  label: string;
  description: string;
  currentImageUrl?: string;
  currentFileId?: string;
  onImageUpload: (data: LogoData) => void;
  onImageRemove: () => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({
  label,
  description,
  currentImageUrl,
  currentFileId,
  onImageUpload,
  onImageRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    // Validaciones básicas
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('El archivo es demasiado grande. Máximo 2MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      console.log('📤 [LogoConfigPanel] Iniciando upload de:', file.name);
      
      // Upload al servidor (no más Base64)
      const uploadedData = await FileUploadService.uploadLogo(file);
      
      console.log('✅ [LogoConfigPanel] Upload exitoso:', uploadedData);
      
      // Notificar con fileId y URL
      onImageUpload(uploadedData);
      
    } catch (error: any) {
      console.error('❌ [LogoConfigPanel] Error en upload:', error);
      setUploadError(error.message || 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-neutral-800">{label}</h4>
        <p className="text-xs text-neutral-600">{description}</p>
      </div>

      {/* Error de upload */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          ⚠️ {uploadError}
        </div>
      )}

      {/* Área de subida */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-neutral-300 hover:border-neutral-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {currentImageUrl ? (
          <div className="space-y-3">
            <img
              src={currentImageUrl}
              alt={label}
              className="mx-auto max-h-24 rounded border border-neutral-200"
            />
            {currentFileId && (
              <p className="text-xs text-neutral-500">ID: {currentFileId.substring(0, 8)}...</p>
            )}
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1 text-sm text-primary-600 border border-primary-600 rounded hover:bg-primary-50 disabled:opacity-50"
              >
                Cambiar
              </button>
              <button
                onClick={onImageRemove}
                disabled={isUploading}
                className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                <span className="text-sm text-neutral-600">Subiendo al servidor...</span>
              </div>
            ) : (
              <>
                <div className="text-neutral-400">
                  <svg className="mx-auto h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-neutral-600">
                  <p>Arrastra una imagen aquí o</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    selecciona un archivo
                  </button>
                </div>
                <p className="text-xs text-neutral-500">PNG, JPG, SVG hasta 2MB</p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
};

export const LogoConfigPanel: React.FC<LogoConfigPanelProps> = ({ config, onChange }) => {
  const handleMainLogoChange = (updates: Partial<typeof config.logos.mainLogo>) => {
    onChange({
      logos: {
        ...config.logos,
        mainLogo: {
          ...config.logos.mainLogo,
          ...updates
        }
      }
    });
  };

  const handleSidebarLogoChange = (updates: Partial<typeof config.logos.sidebarLogo>) => {
    onChange({
      logos: {
        ...config.logos,
        sidebarLogo: {
          ...config.logos.sidebarLogo,
          ...updates
        }
      }
    });
  };

  const handleFaviconChange = (updates: Partial<typeof config.logos.favicon>) => {
    onChange({
      logos: {
        ...config.logos,
        favicon: {
          ...config.logos.favicon,
          ...updates
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Logo Principal */}
      <div className="bg-neutral-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Logo Principal</h3>
        <p className="text-sm text-neutral-600 mb-6">
          Este logo aparece en la página de login y en el header principal de la aplicación.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración de texto */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Texto del Logo
              </label>
              <input
                type="text"
                value={config.logos.mainLogo.text}
                onChange={(e) => handleMainLogoChange({ text: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Mi App"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.logos.mainLogo.showText}
                  onChange={(e) => handleMainLogoChange({ showText: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-neutral-700">Mostrar texto</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.logos.mainLogo.showImage}
                  onChange={(e) => handleMainLogoChange({ showImage: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-neutral-700">Mostrar imagen</span>
              </label>
            </div>
          </div>

          {/* Subida de imagen */}
          <LogoUploader
            label="Imagen del Logo"
            description="Recomendado: 200x60px, formato PNG con fondo transparente"
            currentImageUrl={config.logos.mainLogo.imageUrl}
            currentFileId={config.logos.mainLogo.fileId}
            onImageUpload={(logoData) => handleMainLogoChange({ 
              imageUrl: logoData.url, 
              fileId: logoData.fileId,
              showImage: true 
            })}
            onImageRemove={() => handleMainLogoChange({ imageUrl: undefined, fileId: undefined, showImage: false })}
          />
        </div>

        {/* Vista previa */}
        <div className="mt-6 p-4 bg-white border border-neutral-200 rounded-lg">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Vista Previa</h4>
          <div className="flex items-center space-x-3">
            {config.logos.mainLogo.showImage && config.logos.mainLogo.imageUrl && (
              <img
                src={config.logos.mainLogo.imageUrl}
                alt="Logo principal"
                className="h-12"
              />
            )}
            {config.logos.mainLogo.showText && (
              <span className="text-xl font-bold text-primary-600">
                {config.logos.mainLogo.text || 'Texto del Logo'}
              </span>
            )}
            {!config.logos.mainLogo.showText && !config.logos.mainLogo.showImage && (
              <span className="text-neutral-400 text-sm">
                Selecciona mostrar texto o imagen para ver la vista previa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Logo del Sidebar */}
      <div className="bg-neutral-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Logo del Sidebar</h3>
        <p className="text-sm text-neutral-600 mb-6">
          Este logo aparece en la barra lateral de navegación.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración de texto */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Texto Completo
              </label>
              <input
                type="text"
                value={config.logos.sidebarLogo.text}
                onChange={(e) => handleSidebarLogoChange({ text: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder={config.logos?.sidebarLogo?.text || config.branding?.appName || 'Nombre de la aplicación'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Texto Colapsado
              </label>
              <input
                type="text"
                value={config.logos.sidebarLogo.collapsedText}
                onChange={(e) => handleSidebarLogoChange({ collapsedText: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder={config.logos?.sidebarLogo?.collapsedText || config.logos?.mainLogo?.text || 'Logo'}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Texto que se muestra cuando el sidebar está colapsado
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.logos.sidebarLogo.showText}
                  onChange={(e) => handleSidebarLogoChange({ showText: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-neutral-700">Mostrar texto</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.logos.sidebarLogo.showImage}
                  onChange={(e) => handleSidebarLogoChange({ showImage: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-neutral-700">Mostrar imagen</span>
              </label>
            </div>
          </div>

          {/* Subida de imagen */}
          <LogoUploader
            label="Imagen del Sidebar"
            description="Recomendado: 40x40px, formato PNG cuadrado"
            currentImageUrl={config.logos.sidebarLogo.imageUrl}
            currentFileId={config.logos.sidebarLogo.fileId}
            onImageUpload={(logoData) => handleSidebarLogoChange({ 
              imageUrl: logoData.url,
              fileId: logoData.fileId,
              showImage: true 
            })}
            onImageRemove={() => handleSidebarLogoChange({ imageUrl: undefined, fileId: undefined })}
          />
        </div>
      </div>

      {/* Favicon */}
      <div className="bg-neutral-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Favicon</h3>
        <p className="text-sm text-neutral-600 mb-6">
          Icono que aparece en la pestaña del navegador.
        </p>

        <div className="max-w-md">
          <LogoUploader
            label="Icono del Favicon"
            description="Recomendado: 32x32px o 64x64px, formato ICO o PNG"
            currentImageUrl={config.logos.favicon.imageUrl}
            currentFileId={config.logos.favicon.fileId}
            onImageUpload={(logoData) => handleFaviconChange({ 
              imageUrl: logoData.url,
              fileId: logoData.fileId
            })}
            onImageRemove={() => handleFaviconChange({ imageUrl: undefined, fileId: undefined })}
          />
        </div>
      </div>
    </div>
  );
};