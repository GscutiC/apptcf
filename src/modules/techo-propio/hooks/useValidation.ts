/**
 * Custom hook for validation operations (RENIEC and UBIGEO)
 */

import { useState } from 'react';
import { techoPropioApi } from '../services';
import {
  ReniecValidationResponse,
  UbigeoDepartment,
  UbigeoProvince,
  UbigeoDistrict
} from '../types';

export const useValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ==================== RENIEC VALIDATION ====================

  const validateDNI = async (dni: string): Promise<ReniecValidationResponse | null> => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await techoPropioApi.validateDni(dni);

      if (response.success && response.data) {
        return response.data;
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
      const response = await techoPropioApi.getDepartments();

      if (response.success) {
        setDepartments(response.data);
        return response.data;
      } else {
        throw new Error('Error al cargar departamentos');
      }
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
      const response = await techoPropioApi.getProvinces(departmentCode);

      if (response.success) {
        setProvinces(response.data);
        return response.data;
      } else {
        throw new Error('Error al cargar provincias');
      }
    } catch (err: any) {
      const errorMessage = err.error || err.message || 'Error al cargar provincias';
      setValidationError(errorMessage);
      return [];
    } finally {
      setIsLoadingUbigeo(false);
    }
  };

  const loadDistricts = async (provinceCode: string): Promise<UbigeoDistrict[]> => {
    setIsLoadingUbigeo(true);
    setValidationError(null);

    try {
      const response = await techoPropioApi.getDistricts(provinceCode);

      if (response.success) {
        setDistricts(response.data);
        return response.data;
      } else {
        throw new Error('Error al cargar distritos');
      }
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
