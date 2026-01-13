/**
 * Context para gestión de roles
 * Proporciona estado global para operaciones CRUD de roles
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  UserRole, 
  RoleContextState, 
  CreateRoleRequest,
  UpdateRoleRequest,
  Permission
} from '../types/user.types';
import { roleService } from '../services/roleService';

// Estado inicial
const initialState: RoleContextState = {
  roles: [],
  selectedRole: null,
  operations: {
    list: { loading: false, error: null, success: false },
    create: { loading: false, error: null, success: false },
    update: { loading: false, error: null, success: false },
    delete: { loading: false, error: null, success: false }
  }
};

// Tipos de acciones
type RoleAction =
  | { type: 'SET_LOADING'; operation: keyof RoleContextState['operations']; loading: boolean }
  | { type: 'SET_ERROR'; operation: keyof RoleContextState['operations']; error: string | null }
  | { type: 'SET_SUCCESS'; operation: keyof RoleContextState['operations']; success: boolean }
  | { type: 'SET_ROLES'; roles: UserRole[] }
  | { type: 'SET_SELECTED_ROLE'; role: UserRole | null }
  | { type: 'ADD_ROLE'; role: UserRole }
  | { type: 'UPDATE_ROLE'; role: UserRole }
  | { type: 'REMOVE_ROLE'; roleId: string }
  | { type: 'RESET_OPERATION'; operation: keyof RoleContextState['operations'] }
  | { type: 'RESET_STATE' };

// Reducer
const roleReducer = (state: RoleContextState, action: RoleAction): RoleContextState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        operations: {
          ...state.operations,
          [action.operation]: {
            ...state.operations[action.operation],
            loading: action.loading
          }
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        operations: {
          ...state.operations,
          [action.operation]: {
            ...state.operations[action.operation],
            error: action.error,
            loading: false
          }
        }
      };

    case 'SET_SUCCESS':
      return {
        ...state,
        operations: {
          ...state.operations,
          [action.operation]: {
            ...state.operations[action.operation],
            success: action.success,
            loading: false,
            error: null
          }
        }
      };

    case 'SET_ROLES':
      return {
        ...state,
        roles: action.roles
      };

    case 'SET_SELECTED_ROLE':
      return {
        ...state,
        selectedRole: action.role
      };

    case 'ADD_ROLE':
      return {
        ...state,
        roles: [...state.roles, action.role]
      };

    case 'UPDATE_ROLE':
      return {
        ...state,
        roles: state.roles.map(role => 
          role.id === action.role.id ? action.role : role
        ),
        selectedRole: state.selectedRole?.id === action.role.id ? action.role : state.selectedRole
      };

    case 'REMOVE_ROLE':
      return {
        ...state,
        roles: state.roles.filter(role => role.id !== action.roleId),
        selectedRole: state.selectedRole?.id === action.roleId ? null : state.selectedRole
      };

    case 'RESET_OPERATION':
      return {
        ...state,
        operations: {
          ...state.operations,
          [action.operation]: {
            loading: false,
            error: null,
            success: false
          }
        }
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
};

// Context
interface RoleContextType {
  state: RoleContextState;
  
  // Acciones básicas
  setSelectedRole: (role: UserRole | null) => void;
  resetOperation: (operation: keyof RoleContextState['operations']) => void;
  resetState: () => void;
  
  // Operaciones asíncronas
  loadRoles: (getToken: () => Promise<string | null>) => Promise<void>;
  createRole: (getToken: () => Promise<string | null>, roleData: CreateRoleRequest) => Promise<UserRole | null>;
  updateRole: (getToken: () => Promise<string | null>, roleId: string, roleData: UpdateRoleRequest) => Promise<UserRole | null>;
  deleteRole: (getToken: () => Promise<string | null>, roleId: string) => Promise<boolean>;
  loadRoleById: (getToken: () => Promise<string | null>, roleId: string) => Promise<void>;
  cloneRole: (getToken: () => Promise<string | null>, roleId: string, newName: string, newDisplayName: string) => Promise<UserRole | null>;
  
  // Utilidades
  getAvailablePermissions: () => Permission[];
  canDeleteRole: (getToken: () => Promise<string | null>, roleId: string) => Promise<{ canDelete: boolean; reason?: string }>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Provider component
interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(roleReducer, initialState);
  const { getToken } = useAuth();

  // Referencias para evitar loops infinitos
  const loadRolesRef = React.useRef<((getToken: () => Promise<string | null>) => Promise<void>) | null>(null);
  const hasInitializedRef = React.useRef(false);

  // Acciones básicas
  const setSelectedRole = useCallback((role: UserRole | null) => {
    dispatch({ type: 'SET_SELECTED_ROLE', role });
  }, []);

  const resetOperation = useCallback((operation: keyof RoleContextState['operations']) => {
    dispatch({ type: 'RESET_OPERATION', operation });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Operaciones asíncronas
  const loadRoles = useCallback(async (getToken: () => Promise<string | null>) => {
    // Evitar cargar si ya estamos cargando o tenemos datos recientes
    if (state.operations.list.loading) {
      return;
    }

    dispatch({ type: 'SET_LOADING', operation: 'list', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'list', error: null });

    try {
      const roles = await roleService.getRoles(getToken);
      dispatch({ type: 'SET_ROLES', roles });
      dispatch({ type: 'SET_SUCCESS', operation: 'list', success: true });
      hasInitializedRef.current = true;
    } catch (error) {
      // Log error solo en modo debug
      if (process.env.REACT_APP_DEBUG) {
        console.error('RoleContext: Error loading roles:', error);
      }
      dispatch({ type: 'SET_ERROR', operation: 'list', error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }, [state.operations.list.loading]);

  // Asignar la referencia para el listener
  loadRolesRef.current = loadRoles;

  // Cargar roles automáticamente al inicializar el contexto (solo una vez)
  useEffect(() => {
    // CRÍTICO: Solo cargar si no hemos inicializado aún
    if (hasInitializedRef.current) {
      return;
    }

    // Solo cargar si no hay roles y no se está cargando
    // NOTA: NO incluimos state.operations.list.error en las dependencias
    // porque causa loops infinitos al cambiar durante la carga
    if (getToken && state.roles.length === 0 && !state.operations.list.loading) {
      loadRoles(getToken);
    }
  }, [getToken, state.roles.length, state.operations.list.loading]);
  // CRÍTICO: NO incluir error ni loadRoles para evitar loops infinitos

  // Efecto para escuchar cambios de roles desde otras páginas
  useEffect(() => {
    const handleRolesUpdated = () => {
      if (loadRolesRef.current && getToken) {
        loadRolesRef.current(getToken);
      }
    };

    window.addEventListener('rolesUpdated', handleRolesUpdated);
    return () => window.removeEventListener('rolesUpdated', handleRolesUpdated);
  }, [getToken]);

  const createRole = useCallback(async (getToken: () => Promise<string | null>, roleData: CreateRoleRequest): Promise<UserRole | null> => {
    dispatch({ type: 'SET_LOADING', operation: 'create', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'create', error: null });

    try {
      const newRole = await roleService.createRole(getToken, roleData);
      dispatch({ type: 'ADD_ROLE', role: newRole });
      dispatch({ type: 'SET_SUCCESS', operation: 'create', success: true });
      return newRole;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'create', error: error instanceof Error ? error.message : 'Error desconocido' });
      return null;
    }
  }, []);

  const updateRole = useCallback(async (getToken: () => Promise<string | null>, roleId: string, roleData: UpdateRoleRequest): Promise<UserRole | null> => {
    dispatch({ type: 'SET_LOADING', operation: 'update', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'update', error: null });

    try {
      const updatedRole = await roleService.updateRole(getToken, roleId, roleData);
      dispatch({ type: 'UPDATE_ROLE', role: updatedRole });
      dispatch({ type: 'SET_SUCCESS', operation: 'update', success: true });
      return updatedRole;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'update', error: error instanceof Error ? error.message : 'Error desconocido' });
      return null;
    }
  }, []);

  const deleteRole = useCallback(async (getToken: () => Promise<string | null>, roleId: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', operation: 'delete', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'delete', error: null });

    try {
      await roleService.deleteRole(getToken, roleId);
      dispatch({ type: 'REMOVE_ROLE', roleId });
      dispatch({ type: 'SET_SUCCESS', operation: 'delete', success: true });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'delete', error: error instanceof Error ? error.message : 'Error desconocido' });
      return false;
    }
  }, []);

  const loadRoleById = useCallback(async (getToken: () => Promise<string | null>, roleId: string) => {
    dispatch({ type: 'SET_LOADING', operation: 'list', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'list', error: null });

    try {
      const role = await roleService.getRoleById(getToken, roleId);
      dispatch({ type: 'SET_SELECTED_ROLE', role });
      dispatch({ type: 'SET_SUCCESS', operation: 'list', success: true });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'list', error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }, []);

  const cloneRole = useCallback(async (getToken: () => Promise<string | null>, roleId: string, newName: string, newDisplayName: string): Promise<UserRole | null> => {
    dispatch({ type: 'SET_LOADING', operation: 'create', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'create', error: null });

    try {
      const clonedRole = await roleService.cloneRole(getToken, roleId, newName, newDisplayName);
      dispatch({ type: 'ADD_ROLE', role: clonedRole });
      dispatch({ type: 'SET_SUCCESS', operation: 'create', success: true });
      return clonedRole;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'create', error: error instanceof Error ? error.message : 'Error desconocido' });
      return null;
    }
  }, []);

  // Utilidades
  const getAvailablePermissions = useCallback((): Permission[] => {
    return roleService.getAvailablePermissions();
  }, []);

  const canDeleteRole = useCallback(async (getToken: () => Promise<string | null>, roleId: string) => {
    return await roleService.canDeleteRole(getToken, roleId);
  }, []);

  const contextValue: RoleContextType = {
    state,
    setSelectedRole,
    resetOperation,
    resetState,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    loadRoleById,
    cloneRole,
    getAvailablePermissions,
    canDeleteRole
  };

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};

// Hook personalizado
export const useRoleContext = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
};