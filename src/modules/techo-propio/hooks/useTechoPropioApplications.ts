/**
 * Custom hook for CRUD operations on Techo Propio applications
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthProfile } from '../../../hooks/useAuthProfile';
import { techoPropioApi } from '../services';
import {
  TechoPropioApplication,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ChangeStatusRequest,
  ApplicationStatus
} from '../types';
import { SUCCESS_MESSAGES, logger } from '../utils';

export const useTechoPropioApplications = () => {
  const { getToken } = useAuth();
  const { userProfile } = useAuthProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Configurar token getter al montar el hook
  useEffect(() => {
    if (getToken) {
      techoPropioApi.setTokenGetter(getToken);
    }
  }, [getToken]);

  // ==================== CREATE ====================

  const createApplication = async (
    data: CreateApplicationRequest
  ): Promise<TechoPropioApplication | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      logger.start('Crear aplicación', data);
      const response = await techoPropioApi.createApplicationDirect(data, getToken);
      logger.debug('Respuesta completa del backend', response);

      // ✅ El backend devuelve directamente TechoPropioApplicationResponseDTO
      const responseData = response as any; // Flexibilidad de tipos para manejar respuesta real
      if (responseData && responseData.id) {
        logger.success('Solicitud creada exitosamente', responseData);
        setSuccess(SUCCESS_MESSAGES.APPLICATION_CREATED);
        return responseData as unknown as TechoPropioApplication;
      } else {
        logger.warn('Respuesta inesperada del backend', response);
        throw new Error('La respuesta del backend no contiene un ID válido');
      }
    } catch (err: any) {
      logger.failure('Error al crear aplicación', err);
      logger.error('Error response', err?.response);
      logger.error('Error data', err?.response?.data);
      
      const errorMessage = err?.response?.data?.detail || err.error || err.message || 'Error al crear solicitud';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== UPDATE ====================

  const updateApplication = async (
    id: string,
    data: UpdateApplicationRequest
  ): Promise<TechoPropioApplication | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await techoPropioApi.updateApplication(id, data);

      if (response.success) {
        setSuccess(SUCCESS_MESSAGES.APPLICATION_UPDATED);
        return response.data;
      } else {
        throw new Error('Error al actualizar solicitud');
      }
    } catch (err: any) {
      const errorMessage = err.error || err.message || 'Error al actualizar solicitud';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== DELETE ====================

  const deleteApplication = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await techoPropioApi.deleteApplication(id);

      if (response.success) {
        setSuccess(SUCCESS_MESSAGES.APPLICATION_DELETED);
        return true;
      } else {
        throw new Error('Error al eliminar solicitud');
      }
    } catch (err: any) {
      const errorMessage = err.error || err.message || 'Error al eliminar solicitud';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== CHANGE STATUS ====================

  const changeStatus = async (
    id: string,
    newStatus: ApplicationStatus,
    comment?: string
  ): Promise<TechoPropioApplication | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Preparar el payload base
      const payload: ChangeStatusRequest = {
        new_status: newStatus
      };

      // Para rechazos, usar "reason" en lugar de "comment"
      if (newStatus === ApplicationStatus.REJECTED) {
        payload.reason = comment;
      } else {
        payload.comment = comment;
      }

      // Estados que requieren reviewer_id
      const requiresReviewer = [
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.APPROVED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.ADDITIONAL_INFO_REQUIRED
      ];

      // Agregar reviewer_id si el estado lo requiere
      if (requiresReviewer.includes(newStatus) && userProfile?.id) {
        payload.reviewer_id = userProfile.id;
      }

      const response = await techoPropioApi.changeStatus(id, payload);

      if (response.success) {
        setSuccess(SUCCESS_MESSAGES.STATUS_CHANGED);
        return response.data;
      } else {
        throw new Error('Error al cambiar estado');
      }
    } catch (err: any) {
      const errorMessage = err.error || err.message || 'Error al cambiar estado';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== SUBMIT APPLICATION ====================

  const submitApplication = async (id: string): Promise<TechoPropioApplication | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      logger.start(`Enviando solicitud ${id}`);
      const response = await techoPropioApi.submitApplication(id);

      logger.success('Solicitud enviada exitosamente', response);
      setSuccess('Solicitud enviada para revisión exitosamente');

      // El backend retorna directamente el objeto
      return response as unknown as TechoPropioApplication;
    } catch (err: any) {
      logger.failure('Error al enviar solicitud', err);
      const errorMessage = err?.response?.data?.detail || err.error || err.message || 'Error al enviar solicitud';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== HELPERS ====================

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    // State
    isLoading,
    error,
    success,

    // Actions
    createApplication,
    updateApplication,
    deleteApplication,
    changeStatus,
    submitApplication,
    clearMessages
  };
};
