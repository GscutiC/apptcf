/**
 * Context para gestión de usuarios
 * Proporciona estado global para operaciones CRUD de usuarios
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { 
  User, 
  UserContextState, 
  UserListFilters, 
  PaginationInfo, 
  CreateUserRequest,
  UpdateUserRequest
} from '../types/user.types';
import { userService } from '../services/userService';

// Estado inicial
const initialState: UserContextState = {
  users: [],
  selectedUser: null,
  filters: {
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  },
  operations: {
    list: { loading: false, error: null, success: false },
    create: { loading: false, error: null, success: false },
    update: { loading: false, error: null, success: false },
    delete: { loading: false, error: null, success: false }
  }
};

// Tipos de acciones
type UserAction =
  | { type: 'SET_LOADING'; operation: keyof UserContextState['operations']; loading: boolean }
  | { type: 'SET_ERROR'; operation: keyof UserContextState['operations']; error: string | null }
  | { type: 'SET_SUCCESS'; operation: keyof UserContextState['operations']; success: boolean }
  | { type: 'SET_USERS'; users: User[] }
  | { type: 'SET_SELECTED_USER'; user: User | null }
  | { type: 'SET_FILTERS'; filters: Partial<UserListFilters> }
  | { type: 'SET_PAGINATION'; pagination: Partial<PaginationInfo> }
  | { type: 'ADD_USER'; user: User }
  | { type: 'UPDATE_USER'; user: User }
  | { type: 'REMOVE_USER'; userId: string }
  | { type: 'RESET_OPERATION'; operation: keyof UserContextState['operations'] }
  | { type: 'RESET_STATE' };

// Reducer
const userReducer = (state: UserContextState, action: UserAction): UserContextState => {
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

    case 'SET_USERS':
      return {
        ...state,
        users: action.users
      };

    case 'SET_SELECTED_USER':
      return {
        ...state,
        selectedUser: action.user
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.filters
        }
      };

    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.pagination
        }
      };

    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.user]
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.user.id ? action.user : user
        ),
        selectedUser: state.selectedUser?.id === action.user.id ? action.user : state.selectedUser
      };

    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.userId),
        selectedUser: state.selectedUser?.id === action.userId ? null : state.selectedUser
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
interface UserContextType {
  state: UserContextState;
  
  // Acciones básicas
  setFilters: (filters: Partial<UserListFilters>) => void;
  setPagination: (pagination: Partial<PaginationInfo>) => void;
  setSelectedUser: (user: User | null) => void;
  resetOperation: (operation: keyof UserContextState['operations']) => void;
  resetState: () => void;
  
  // Operaciones asíncronas
  loadUsers: (getToken: () => Promise<string | null>) => Promise<void>;
  createUser: (getToken: () => Promise<string | null>, userData: CreateUserRequest) => Promise<User | null>;
  updateUser: (getToken: () => Promise<string | null>, userId: string, userData: UpdateUserRequest) => Promise<User | null>;
  deleteUser: (getToken: () => Promise<string | null>, userId: string) => Promise<boolean>;
  loadUserById: (getToken: () => Promise<string | null>, userId: string) => Promise<void>;
  updateUserRole: (getToken: () => Promise<string | null>, clerkId: string, roleName: string) => Promise<User | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Acciones básicas
  const setFilters = useCallback((filters: Partial<UserListFilters>) => {
    dispatch({ type: 'SET_FILTERS', filters });
  }, []);

  const setPagination = useCallback((pagination: Partial<PaginationInfo>) => {
    dispatch({ type: 'SET_PAGINATION', pagination });
  }, []);

  const setSelectedUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_SELECTED_USER', user });
  }, []);

  const resetOperation = useCallback((operation: keyof UserContextState['operations']) => {
    dispatch({ type: 'RESET_OPERATION', operation });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Operaciones asíncronas
  const loadUsers = useCallback(async (getToken: () => Promise<string | null>) => {
    dispatch({ type: 'SET_LOADING', operation: 'list', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'list', error: null });

    try {
      const response = await userService.getUsers(
        getToken,
        state.filters,
        state.pagination.page,
        state.pagination.pageSize
      );

      dispatch({ type: 'SET_USERS', users: response.users });
      dispatch({ type: 'SET_PAGINATION', pagination: response.pagination });
      dispatch({ type: 'SET_SUCCESS', operation: 'list', success: true });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'list', error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }, [state.filters, state.pagination.page, state.pagination.pageSize]);

  const createUser = useCallback(async (getToken: () => Promise<string | null>, userData: CreateUserRequest): Promise<User | null> => {
    dispatch({ type: 'SET_LOADING', operation: 'create', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'create', error: null });

    try {
      const newUser = await userService.createUser(getToken, userData);
      dispatch({ type: 'ADD_USER', user: newUser });
      dispatch({ type: 'SET_SUCCESS', operation: 'create', success: true });
      return newUser;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'create', error: error instanceof Error ? error.message : 'Error desconocido' });
      return null;
    }
  }, []);

  const updateUser = useCallback(async (getToken: () => Promise<string | null>, userId: string, userData: UpdateUserRequest): Promise<User | null> => {
    dispatch({ type: 'SET_LOADING', operation: 'update', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'update', error: null });

    try {
      const updatedUser = await userService.updateUser(getToken, userId, userData);
      dispatch({ type: 'UPDATE_USER', user: updatedUser });
      dispatch({ type: 'SET_SUCCESS', operation: 'update', success: true });
      return updatedUser;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'update', error: error instanceof Error ? error.message : 'Error desconocido' });
      return null;
    }
  }, []);

  const deleteUser = useCallback(async (getToken: () => Promise<string | null>, userId: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', operation: 'delete', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'delete', error: null });

    try {
      await userService.deleteUser(getToken, userId);
      dispatch({ type: 'REMOVE_USER', userId });
      dispatch({ type: 'SET_SUCCESS', operation: 'delete', success: true });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'delete', error: error instanceof Error ? error.message : 'Error desconocido' });
      return false;
    }
  }, []);

  const loadUserById = useCallback(async (getToken: () => Promise<string | null>, userId: string) => {
    dispatch({ type: 'SET_LOADING', operation: 'list', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'list', error: null });

    try {
      const user = await userService.getUserById(getToken, userId);
      dispatch({ type: 'SET_SELECTED_USER', user });
      dispatch({ type: 'SET_SUCCESS', operation: 'list', success: true });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'list', error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }, []);

  const updateUserRole = useCallback(async (getToken: () => Promise<string | null>, clerkId: string, roleName: string): Promise<User | null> => {
    dispatch({ type: 'SET_LOADING', operation: 'update', loading: true });
    dispatch({ type: 'SET_ERROR', operation: 'update', error: null });

    try {
      const updatedUser = await userService.updateUserRole(getToken, clerkId, roleName);
      dispatch({ type: 'UPDATE_USER', user: updatedUser });
      dispatch({ type: 'SET_SUCCESS', operation: 'update', success: true });
      return updatedUser;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', operation: 'update', error: error instanceof Error ? error.message : 'Error desconocido' });
      return null;
    }
  }, []);

  const contextValue: UserContextType = {
    state,
    setFilters,
    setPagination,
    setSelectedUser,
    resetOperation,
    resetState,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    loadUserById,
    updateUserRole
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};