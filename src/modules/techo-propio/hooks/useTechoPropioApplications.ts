/**
 * Custom hook for CRUD operations on Techo Propio applications
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { techoPropioApi } from '../services';
import {
  TechoPropioApplication,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ChangeStatusRequest,
  ApplicationStatus
} from '../types';
import { SUCCESS_MESSAGES } from '../utils';

export const useTechoPropioApplications = () => {
  const { getToken } = useAuth();
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
      const response = await techoPropioApi.createApplication(data);

      if (response.success) {
        setSuccess(SUCCESS_MESSAGES.APPLICATION_CREATED);
        return response.data;
      } else {
        throw new Error('Error al crear solicitud');
      }
    } catch (err: any) {
      const errorMessage = err.error || err.message || 'Error al crear solicitud';
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
      const response = await techoPropioApi.changeStatus(id, {
        new_status: newStatus,
        comment
      });

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
    clearMessages
  };
};
