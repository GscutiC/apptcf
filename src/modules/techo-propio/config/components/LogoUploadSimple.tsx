/**
 * Componente compacto para subir logos
 * Versión optimizada y minimalista
 */

import React, { useState, useRef } from 'react';
import { FileUploadService } from '../../../interface-config/services/fileUploadService';

interface LogoUploadSimpleProps {
  label: string;
  description?: string;
  currentValue: string;  // Emoji o URL
  currentFileId?: string;
  onUpload: (fileId: string, url: string) => void;
  onRemove: () => void;
  getToken: () => Promise<string | null>;
}

export const LogoUploadSimple: React.FC<LogoUploadSimpleProps> = ({
  label,
  description,
  currentValue,
  currentFileId,
  onUpload,
  onRemove,
  getToken
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const { fileId, url } = await FileUploadService.uploadLogo(file, getToken);
      onUpload(fileId, url);
    } catch (err: any) {
      setError(err.message || 'Error al subir archivo');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  // Determinar si el valor actual es una imagen válida o emoji/texto
  // CRÍTICO: Solo mostrar <img> si:
  // 1. No hubo error previo
  // 2. La URL es válida (empieza con http/https)
  // 3. NO mostrar <img> si es una URL de /api/files/ sin fileId válido
  const hasValidFileId = currentFileId && currentFileId.length > 0;
  const isExternalImage = currentValue?.startsWith('http://') || currentValue?.startsWith('https://');
  const isImageUrl = !imageError && (isExternalImage || (currentValue?.startsWith('/api/files/') && hasValidFileId));

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Vista previa compacta */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          {/* Preview más pequeño */}
          <div className="w-12 h-12 bg-white border rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            {isImageUrl ? (
              <img
                src={currentValue}
                alt={label}
                className="max-w-full max-h-full object-contain rounded"
                onError={() => {
                  // Silenciar error de imagen y mostrar fallback
                  setImageError(true);
                }}
              />
            ) : (
              <span className="text-lg">{currentValue || '🖼️'}</span>
            )}
          </div>
          
          {/* Botones más compactos */}
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-md hover:shadow-md transition-all disabled:opacity-50 text-sm font-medium"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Subiendo...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <span>📤</span>
                  <span className="hidden sm:inline">Subir</span>
                </span>
              )}
            </button>
            
            {currentFileId && (
              <button
                onClick={onRemove}
                disabled={isUploading}
                className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-all disabled:opacity-50 text-sm font-medium"
                title="Eliminar imagen"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
        
        {/* Error e info más compactos */}
        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-700">⚠️ {error}</p>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <div>📷 PNG, JPG, SVG (máx. 2MB)</div>
          {currentFileId && (
            <div className="text-gray-400">🆔 {currentFileId.substring(0, 8)}...</div>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};
