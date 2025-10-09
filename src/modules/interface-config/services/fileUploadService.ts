/**
 * Servicio para subir archivos al backend
 * Conecta con /api/files del backend FastAPI
 */

import { logger } from '../../../shared/utils/logger';

// Usar la misma configuración que otros servicios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Coincide con FileUploadResponseDTO del backend
export interface UploadResponse {
  id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  public_url: string;
  message?: string;
}

export interface LogoData {
  fileId: string;
  url: string;
  filename: string;
}

export class FileUploadService {
  /**
   * Subir logo al servidor
   * @param file - Archivo a subir
   * @param getToken - Función opcional para obtener token de autenticación
   */
  static async uploadLogo(file: File, getToken?: () => Promise<string | null>): Promise<LogoData> {
    try {
      // Validaciones
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen (PNG, JPG, SVG)');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('El archivo no debe superar 2MB');
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'logo');
      formData.append('description', `Logo: ${file.name}`);

      logger.info(`📤 [FileUploadService] Uploading file: ${file.name} (${file.size} bytes)`);
      logger.info(`📡 [FileUploadService] Upload URL: ${API_BASE_URL}/api/files/upload`);

      // ✅ Preparar headers con token si está disponible
      const headers: HeadersInit = {};
      if (getToken) {
        try {
          const token = await getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            logger.info(`🔑 [FileUploadService] Token de autenticación incluido`);
          }
        } catch (error) {
          logger.warn('⚠️ [FileUploadService] No se pudo obtener token, continuando sin autenticación');
        }
      }

      // Upload al backend
      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        headers,
        body: formData,
        // No incluir Content-Type header, FormData lo maneja automáticamente
      });

      logger.info(`📡 [FileUploadService] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('❌ [FileUploadService] Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Error desconocido en el servidor' };
        }
        
        throw new Error(errorData.detail || `Error HTTP ${response.status}`);
      }

      const data: UploadResponse = await response.json();
      
      logger.info(`✅ [FileUploadService] Upload response:`, data);

      // Construir URL completa si es relativa
      const fullUrl = data.public_url.startsWith('http') 
        ? data.public_url 
        : `${window.location.origin}${data.public_url}`;

      const result = {
        fileId: data.id,
        url: fullUrl,
        filename: data.original_filename
      };

      logger.info(`🎯 [FileUploadService] Returning LogoData:`, result);

      return result;

    } catch (error: any) {
      logger.error('❌ [FileUploadService] Error uploading logo:', error);
      logger.error('❌ [FileUploadService] Error stack:', error.stack);
      throw error; // Re-throw el error original, no crear uno nuevo
    }
  }

  /**
   * Eliminar logo del servidor
   * @param fileId - ID del archivo a eliminar
   * @param getToken - Función opcional para obtener token de autenticación
   */
  static async deleteLogo(fileId: string, getToken?: () => Promise<string | null>): Promise<boolean> {
    try {
      logger.info(`🗑️ Eliminando logo: ${fileId}`);

      // ✅ Preparar headers con token si está disponible
      const headers: HeadersInit = {};
      if (getToken) {
        try {
          const token = await getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (error) {
          logger.warn('⚠️ No se pudo obtener token para eliminación');
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        logger.info(`✅ Logo eliminado: ${fileId}`);
        return true;
      }

      logger.warn(`⚠️ No se pudo eliminar logo: ${fileId}`);
      return false;

    } catch (error) {
      logger.error('❌ Error eliminando logo:', error);
      return false;
    }
  }

  /**
   * Obtener URL pública del logo
   */
  static getPublicUrl(fileId: string): string {
    return `${API_BASE_URL}/api/files/${fileId}`;
  }

  /**
   * Listar logos subidos
   */
  static async listLogos(): Promise<LogoData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files?category=logo`);
      
      if (!response.ok) {
        throw new Error('Error al listar logos');
      }

      const data = await response.json();
      
      // Adaptar respuesta del backend al formato esperado
      return (data.files || []).map((file: any) => ({
        fileId: file.id,
        url: file.public_url || this.getPublicUrl(file.id),
        filename: file.original_filename || 'Logo'
      }));

    } catch (error) {
      logger.error('❌ Error listando logos:', error);
      return [];
    }
  }
}
