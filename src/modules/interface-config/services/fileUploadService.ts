/**
 * Servicio para subir archivos usando Cloudinary
 * Reemplaza el sistema de archivos locales del backend
 */

import { logger } from '../../../shared/utils/logger';

// Usar la misma configuración que otros servicios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Respuesta de Cloudinary desde el backend
export interface CloudinaryUploadResponse {
  success: boolean;
  message: string;
  data: {
    public_id: string;
    url: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
  };
}

export interface LogoData {
  fileId: string;  // Ahora será el public_id de Cloudinary
  url: string;     // URL segura de Cloudinary
  filename: string;
}

export class FileUploadService {
  /**
   * Subir logo a Cloudinary a través del backend
   * @param file - Archivo a subir
   * @param getToken - Función para obtener token de autenticación (REQUERIDO)
   */
  static async uploadLogo(file: File, getToken: () => Promise<string | null>): Promise<LogoData> {
    try {
      // Validaciones
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen (PNG, JPG, SVG)');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('El archivo no debe superar 2MB');
      }

      // Obtener token de autenticación
      const token = await getToken();
      if (!token) {
        throw new Error('Se requiere autenticación para subir archivos');
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('logo_type', 'primary');

      logger.info(`📤 [CloudinaryService] Uploading file to Cloudinary: ${file.name} (${file.size} bytes)`);

      // Upload a Cloudinary a través del backend
      const response = await fetch(`${API_BASE_URL}/api/cloudinary/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      logger.info(`📡 [CloudinaryService] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('❌ [CloudinaryService] Error response:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Error desconocido en el servidor' };
        }

        throw new Error(errorData.detail || `Error HTTP ${response.status}`);
      }

      const responseData: CloudinaryUploadResponse = await response.json();

      logger.info(`✅ [CloudinaryService] Upload response:`, responseData);

      if (!responseData.success) {
        throw new Error(responseData.message || 'Error al subir imagen a Cloudinary');
      }

      const result: LogoData = {
        fileId: responseData.data.public_id,
        url: responseData.data.secure_url,
        filename: file.name
      };

      logger.info(`🎯 [CloudinaryService] Returning LogoData:`, result);

      return result;

    } catch (error: any) {
      logger.error('❌ [CloudinaryService] Error uploading logo:', error);
      throw error;
    }
  }

  /**
   * Eliminar logo de Cloudinary
   * @param publicId - Public ID de Cloudinary (ej: "apptc/logos/primary/primary_logo")
   * @param getToken - Función para obtener token de autenticación
   */
  static async deleteLogo(publicId: string, getToken: () => Promise<string | null>): Promise<boolean> {
    try {
      logger.info(`🗑️ Eliminando logo de Cloudinary: ${publicId}`);

      const token = await getToken();
      if (!token) {
        logger.warn('⚠️ No se pudo obtener token para eliminación');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/cloudinary/delete/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        logger.info(`✅ Logo eliminado de Cloudinary: ${publicId}`);
        return true;
      }

      logger.warn(`⚠️ No se pudo eliminar logo: ${publicId}`);
      return false;

    } catch (error) {
      logger.error('❌ Error eliminando logo:', error);
      return false;
    }
  }

  /**
   * Obtener URL pública del logo desde Cloudinary
   * NOTA: Las URLs de Cloudinary ya son públicas y seguras
   */
  static getPublicUrl(publicId: string): string {
    // Las URLs de Cloudinary ya son completas
    // Este método se mantiene por compatibilidad
    return publicId;
  }

  /**
   * Listar logos subidos
   * DEPRECADO: Cloudinary no tiene endpoint de listado en este servicio
   * Los logos se gestionan individualmente
   */
  static async listLogos(): Promise<LogoData[]> {
    logger.warn('⚠️ listLogos() está deprecado con Cloudinary');
    return [];
  }
}
