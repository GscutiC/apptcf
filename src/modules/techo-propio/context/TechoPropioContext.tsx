/**
 * Global Context for Techo Propio Module
 * Manages application state and provides data to all components
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TechoPropioApplication,
  ApplicationFilters,
  ApplicationStatistics,
  SearchQuery
} from '../types';
import { techoPropioApi } from '../services';

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

  // ==================== ACTIONS - APPLICATIONS ====================

  const fetchApplications = async (newFilters?: ApplicationFilters) => {
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

      if (response.success) {
        setApplications(response.data.items);
      } else {
        throw new Error('Error al cargar solicitudes');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitudes');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplication = async (id: string): Promise<TechoPropioApplication | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await techoPropioApi.getApplication(id);

      if (response.success) {
        setSelectedApplication(response.data);
        return response.data;
      } else {
        throw new Error('Error al cargar solicitud');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitud');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

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
      console.error('Error loading statistics:', err);
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
