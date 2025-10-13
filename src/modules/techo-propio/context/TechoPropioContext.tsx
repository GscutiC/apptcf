/**
 * Global Context for Techo Propio Module
 * Manages application state and provides data to all components
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  TechoPropioApplication,
  ApplicationFilters,
  ApplicationStatistics,
  SearchQuery,
  Gender,
  ApplicationStatus
} from '../types';
import { techoPropioApi } from '../services';

// ==================== HELPER: MAPPER BACKEND → FRONTEND ====================

/**
 * Transforma los datos del backend al formato esperado por el frontend
 * Backend: head_of_family {document_number, paternal_surname, maternal_surname}
 * Frontend: applicant {dni, first_name, last_name}
 */
const mapBackendApplicationToFrontend = (backendApp: any): TechoPropioApplication => {
  const headOfFamily = backendApp.head_of_family || backendApp.main_applicant;
  
  const finalStatus = backendApp.status || backendApp.application_status || ApplicationStatus.DRAFT;
  
  return {
    ...backendApp,
    // ✅ CRÍTICO: Preservar el estado del backend correctamente
    id: backendApp.id,
    status: finalStatus,
    code: backendApp.id || backendApp.code || 'N/A',
    applicant: {
      dni: headOfFamily.document_number,
      first_name: headOfFamily.first_name,
      last_name: `${headOfFamily.paternal_surname} ${headOfFamily.maternal_surname}`.trim(),
      birth_date: headOfFamily.birth_date,
      gender: Gender.OTHER, // Default, no viene en backend
      marital_status: headOfFamily.civil_status,
      phone: headOfFamily.phone_number || '',
      email: headOfFamily.email || '',
      current_address: {
        department: backendApp.property_info?.department || '',
        province: backendApp.property_info?.province || '',
        district: backendApp.property_info?.district || '',
        address: backendApp.property_info?.address || '',
        reference: backendApp.property_info?.reference,
        ubigeo_code: backendApp.property_info?.ubigeo_code
      }
    },
    household_members: backendApp.household_members || [],
    household_size: backendApp.total_household_size || 1,
    economic_info: {
      occupation: backendApp.head_of_family_economic?.occupation_detail || backendApp.main_applicant_economic?.occupation_detail || '',
      employer_name: backendApp.head_of_family_economic?.employer_name || backendApp.main_applicant_economic?.employer_name,
      employment_years: 0, // No disponible en backend
      income: {
        main_income: backendApp.head_of_family_economic?.monthly_income || backendApp.main_applicant_economic?.monthly_income || 0,
        additional_income: backendApp.head_of_family_economic?.additional_income_amount || backendApp.main_applicant_economic?.additional_income_amount || 0,
        total_income: backendApp.total_family_income || 0
      },
      expenses: {
        housing: 0,
        food: 0,
        education: 0,
        health: 0,
        transport: 0,
        other: 0,
        total_expenses: 0
      },
      has_debts: false,
      debt_amount: 0
    },
    property_info: backendApp.property_info || {},
    documents: [],
    state_history: []
  };
};

// ==================== CONTEXT TYPE ====================

interface TechoPropioContextType {
  // State
  applications: TechoPropioApplication[];
  selectedApplication: TechoPropioApplication | null;
  statistics: ApplicationStatistics | null;
  filters: ApplicationFilters;
  searchQuery: SearchQuery;
  isLoading: boolean;
  error: string | null;

  // Actions - Applications
  fetchApplications: (filters?: ApplicationFilters) => Promise<void>;
  fetchApplication: (id: string) => Promise<TechoPropioApplication | null>;
  selectApplication: (application: TechoPropioApplication | null) => void;
  refreshApplications: () => Promise<void>;
  deleteApplication: (id: string) => Promise<boolean>;

  // Actions - Filters
  setFilters: (filters: ApplicationFilters) => void;
  clearFilters: () => void;
  setSearchQuery: (query: SearchQuery) => void;

  // Actions - Statistics
  fetchStatistics: () => Promise<void>;

  // Actions - State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// ==================== CONTEXT ====================

const TechoPropioContext = createContext<TechoPropioContextType | undefined>(undefined);

// ==================== PROVIDER ====================

interface TechoPropioProviderProps {
  children: ReactNode;
}

export const TechoPropioProvider: React.FC<TechoPropioProviderProps> = ({ children }) => {
  // Auth
  const { getToken } = useAuth();
  
  // State
  const [applications, setApplications] = useState<TechoPropioApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<TechoPropioApplication | null>(null);
  const [statistics, setStatistics] = useState<ApplicationStatistics | null>(null);
  const [filters, setFiltersState] = useState<ApplicationFilters>({});
  const [searchQuery, setSearchQueryState] = useState<SearchQuery>({
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    page_size: 10
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Configurar token getter al montar el provider
  useEffect(() => {
    if (getToken) {
      techoPropioApi.setTokenGetter(getToken);
    }
  }, [getToken]);

  // ==================== ACTIONS - APPLICATIONS ====================

  const fetchApplications = useCallback(async (newFilters?: ApplicationFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const filtersToUse = newFilters || filters;
      const response = await techoPropioApi.getApplications({
        status: filtersToUse.status,
        department: filtersToUse.department,
        province: filtersToUse.province,
        district: filtersToUse.district,
        priority_min: filtersToUse.priority_min,
        priority_max: filtersToUse.priority_max,
        created_from: filtersToUse.created_from,
        created_to: filtersToUse.created_to,
        skip: ((searchQuery.page || 1) - 1) * (searchQuery.page_size || 10),
        limit: searchQuery.page_size || 10
      });

      // ✅ Manejar ambas posibles estructuras de respuesta
      let items: any[] = [];
      
      if ((response as any)?.items) {
        // Caso 1: Backend retorna directamente {items, total, ...}
        items = (response as any).items;
      } else if ((response as any)?.success && (response as any)?.data?.items) {
        // Caso 2: Backend retorna {success, data: {items, ...}}
        items = (response as any).data.items;
      } else {
        throw new Error('Error al cargar solicitudes: estructura de respuesta inválida');
      }

      // 🔄 MAPPER: Transformar datos del backend al formato del frontend
      const mappedApplications = items.map(mapBackendApplicationToFrontend);
      setApplications(mappedApplications);
      
      // ✅ SYNC: Si hay una aplicación seleccionada, actualizarla también
      if (selectedApplication) {
        const updatedSelected = mappedApplications.find(app => app.id === selectedApplication.id);
        if (updatedSelected && updatedSelected.status !== selectedApplication.status) {
          setSelectedApplication(updatedSelected);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitudes');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchApplication = useCallback(async (id: string): Promise<TechoPropioApplication | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await techoPropioApi.getApplication(id);

      // ✅ FIX: Verificar si response es directo o envuelto
      const applicationData = response.success ? response.data : response;
      
      if (applicationData) {
        // 🔄 MAPPER: Transformar datos del backend al formato del frontend
        const mappedApplication = mapBackendApplicationToFrontend(applicationData);
        setSelectedApplication(mappedApplication);
        
        // ✅ SYNC: También actualizar en la lista de applications si existe
        setApplications(prev => 
          prev.map(app => 
            app.id === mappedApplication.id 
              ? { ...mappedApplication }
              : app
          )
        );
        
        return mappedApplication;
      } else {
        throw new Error('Error al cargar solicitud');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitud');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectApplication = (application: TechoPropioApplication | null) => {
    setSelectedApplication(application);
  };

  const refreshApplications = async () => {
    await fetchApplications(filters);
  };

  // ==================== ACTIONS - FILTERS ====================

  const setFilters = (newFilters: ApplicationFilters) => {
    setFiltersState(newFilters);
    // Auto-fetch when filters change
    fetchApplications(newFilters);
  };

  const clearFilters = () => {
    setFiltersState({});
    fetchApplications({});
  };

  const setSearchQuery = (query: SearchQuery) => {
    setSearchQueryState(query);
  };

  // ==================== ACTIONS - STATISTICS ====================

  const fetchStatistics = async () => {
    try {
      const response = await techoPropioApi.getStatistics({
        department: filters.department,
        from_date: filters.created_from,
        to_date: filters.created_to
      });

      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err: any) {
      // Silenciar error de estadísticas - no es crítico para la funcionalidad
    }
  };

  // ==================== ACTIONS - DELETE ====================

  const deleteApplication = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await techoPropioApi.deleteApplication(id);
      
      if (response.success) {
        // Remover de la lista local
        setApplications(prev => prev.filter(app => app.id !== id));
        
        // Si es la aplicación seleccionada, limpiarla
        if (selectedApplication?.id === id) {
          setSelectedApplication(null);
        }
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar solicitud';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== ACTIONS - STATE ====================

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const setErrorMessage = (errorMessage: string | null) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  // ==================== EFFECTS ====================

  // Load applications on mount
  useEffect(() => {
    fetchApplications();
    fetchStatistics();
    // eslint-disable-next-line
  }, []);

  // ==================== CONTEXT VALUE ====================

  const value: TechoPropioContextType = {
    // State
    applications,
    selectedApplication,
    statistics,
    filters,
    searchQuery,
    isLoading,
    error,

    // Actions
    fetchApplications,
    fetchApplication,
    selectApplication,
    refreshApplications,
    deleteApplication,
    setFilters,
    clearFilters,
    setSearchQuery,
    fetchStatistics,
    setLoading,
    setError: setErrorMessage,
    clearError
  };

  return (
    <TechoPropioContext.Provider value={value}>
      {children}
    </TechoPropioContext.Provider>
  );
};

// ==================== HOOK ====================

/**
 * Custom hook to use Techo Propio context
 */
export const useTechoPropio = (): TechoPropioContextType => {
  const context = useContext(TechoPropioContext);

  if (context === undefined) {
    throw new Error('useTechoPropio must be used within a TechoPropioProvider');
  }

  return context;
};

// Export context for testing
export { TechoPropioContext };
