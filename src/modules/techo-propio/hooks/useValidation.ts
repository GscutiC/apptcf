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
        console.log('Validación DNI exitosa:', dni);
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

  const loadProvinces = async (departmentName: string): Promise<UbigeoProvince[]> => {
    console.log(`🔍 [FRONTEND] loadProvinces llamado con departmentName: '${departmentName}'`);
    setIsLoadingUbigeo(true);
    setValidationError(null);

    try {
      console.log(`📡 [FRONTEND] Llamando techoPropioApi.getProvinces('${departmentName}')`);
      const data = await techoPropioApi.getProvinces(departmentName);
      console.log(`✅ [FRONTEND] Respuesta recibida:`, data);
      console.log(`📊 [FRONTEND] ${data.length} provincias recibidas para '${departmentName}'`);
      setProvinces(data);
      return data;
    } catch (err: any) {
      console.error('💥 loadProvinces: Error capturado:', err);
      const errorMessage = err.error || err.message || 'Error al cargar provincias';
      setValidationError(errorMessage);
      return [];
    } finally {
      setIsLoadingUbigeo(false);
    }
  };

  const loadDistricts = async (departmentName: string, provinceName: string): Promise<UbigeoDistrict[]> => {
    console.log(`🔍 [FRONTEND] loadDistricts llamado con: '${departmentName}' > '${provinceName}'`);
    setIsLoadingUbigeo(true);
    setValidationError(null);

    try {
      console.log(`📡 [FRONTEND] Llamando techoPropioApi.getDistricts('${departmentName}', '${provinceName}')`);
      const data = await techoPropioApi.getDistricts(departmentName, provinceName);
      console.log(`✅ [FRONTEND] Respuesta recibida:`, data);
      console.log(`📊 [FRONTEND] ${data.length} distritos recibidos para '${departmentName}' > '${provinceName}'`);
      setDistricts(data);
      return data;
    } catch (err: any) {
      console.error('💥 loadDistricts: Error capturado:', err);
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
