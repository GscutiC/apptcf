/**
 * Custom hook for validation operations (RENIEC and UBIGEO)
 *
 * IMPORTANTE - POLÍTICA DE CACHE:
 * ✅ UBIGEO: Usa cache (datos geográficos estáticos)
 * ❌ RENIEC: NO usa cache (cada DNI es único, datos en tiempo real)
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { techoPropioApi } from '../services';
import { cacheService, CACHE_KEYS } from '../services/cacheService';
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
  // ⚠️ IMPORTANTE: NO usar cache para RENIEC
  // Cada DNI es único y representa una persona diferente
  // Siempre validar en tiempo real contra API oficial

  const validateDNI = async (dni: string): Promise<ValidateDniResponse | null> => {
    setIsValidating(true);
    setValidationError(null);

    try {
      // NO CACHE - Cada validación es única por persona
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
    // ✅ CACHE HABILITADO: Departamentos son datos estáticos
    const cacheKey = CACHE_KEYS.DEPARTMENTS;
    const cached = cacheService.get<UbigeoDepartment[]>(cacheKey);

    if (cached) {
      setDepartments(cached);
      return cached;
    }

    setIsLoadingUbigeo(true);
    setValidationError(null);

    try {
      const data = await techoPropioApi.getDepartments();
      cacheService.set(cacheKey, data);
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
    // ✅ CACHE HABILITADO: Provincias son datos estáticos por departamento
    const cacheKey = CACHE_KEYS.PROVINCES(departmentCode);
    const cached = cacheService.get<UbigeoProvince[]>(cacheKey);

    if (cached) {
      setProvinces(cached);
      return cached;
    }

    setIsLoadingUbigeo(true);
    setValidationError(null);

    try {
      const data = await techoPropioApi.getProvinces(departmentCode);
      cacheService.set(cacheKey, data);
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
    // ✅ CACHE HABILITADO: Distritos son datos estáticos por provincia
    const cacheKey = CACHE_KEYS.DISTRICTS(departmentCode, provinceCode);
    const cached = cacheService.get<UbigeoDistrict[]>(cacheKey);

    if (cached) {
      setDistricts(cached);
      return cached;
    }

    setIsLoadingUbigeo(true);
    setValidationError(null);

    try {
      const data = await techoPropioApi.getDistricts(departmentCode, provinceCode);
      cacheService.set(cacheKey, data);
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
