/**
 * Custom hook for validation operations (RENIEC and UBIGEO)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { techoPropioApi } from '../services';
import {
  ReniecValidationResponse,
  ValidateDniResponse,
  UbigeoDepartment,
  UbigeoProvince,
  UbigeoDistrict
} from '../types';

export const useValidation = () => {
  const { getToken } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Configure token getter for API service
  useEffect(() => {
    if (getToken) {
      techoPropioApi.setTokenGetter(getToken);
    }
  }, [getToken]);

  // ==================== RENIEC VALIDATION ====================

  const validateDNI = async (dni: string): Promise<ValidateDniResponse | null> => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await techoPropioApi.validateDni(dni);

      if (response.success && response.data) {
        return response;
      } else {
        throw new Error(response.error || 'Error al validar DNI');
      }
    } catch (err: any) {
      const errorMessage = err.error || err.message || 'Error al validar DNI';
      setValidationError(errorMessage);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  // ==================== UBIGEO ====================

  const [departments, setDepartments] = useState<UbigeoDepartment[]>([]);
  const [provinces, setProvinces] = useState<UbigeoProvince[]>([]);
  const [districts, setDistricts] = useState<UbigeoDistrict[]>([]);
  const [isLoadingUbigeo, setIsLoadingUbigeo] = useState(false);

  const loadDepartments = async (): Promise<UbigeoDepartment[]> => {
    setIsLoadingUbigeo(true);
    setValidationError(null);

    try {
      const data = await techoPropioApi.getDepartments();
      setDepartments(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.error || err.message || 'Error al cargar departamentos';
      setValidationError(errorMessage);
      return [];
    } finally {
      setIsLoadingUbigeo(false);
    }
  };

  const loadProvinces = async (departmentCode: string): Promise<UbigeoProvince[]> => {
    setIsLoadingUbigeo(true);
    setValidationError(null);

    try {
      const data = await techoPropioApi.getProvinces(departmentCode);
      setProvinces(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.error || err.message || 'Error al cargar provincias';
      setValidationError(errorMessage);
      return [];
    } finally {
      setIsLoadingUbigeo(false);
    }
  };

  const loadDistricts = async (departmentCode: string, provinceCode: string): Promise<UbigeoDistrict[]> => {
    setIsLoadingUbigeo(true);
    setValidationError(null);

    try {
      const data = await techoPropioApi.getDistricts(departmentCode, provinceCode);
      setDistricts(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.error || err.message || 'Error al cargar distritos';
      setValidationError(errorMessage);
      return [];
    } finally {
      setIsLoadingUbigeo(false);
    }
  };

  const clearUbigeo = () => {
    setProvinces([]);
    setDistricts([]);
  };

  const clearValidationError = () => {
    setValidationError(null);
  };

  return {
    // State
    isValidating,
    isLoadingUbigeo,
    validationError,
    departments,
    provinces,
    districts,

    // Actions
    validateDNI,
    loadDepartments,
    loadProvinces,
    loadDistricts,
    clearUbigeo,
    clearValidationError
  };
};
