/**
 * Componente principal para listar usuarios
 * Incluye filtrado, búsqueda, paginación y acciones
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useUserContext } from '../context/UserContext';
import { useRoleContext } from '../context/RoleContext';
import { User, UserListFilters } from '../types/user.types';
import { PermissionGuard } from '../../../shared/components/guards/PermissionGuard';
import { formatDate, formatLastLogin, getRoleColor, getRoleDisplayName } from '../utils/permissions.utils';

interface UserListProps {
  currentUser?: User | null;
  onSelectUser?: (user: User) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
  compact?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  currentUser = null,
  onSelectUser,
  onEditUser,
  onDeleteUser,
  compact = false
}) => {
  const { getToken } = useAuth();
  const { state, loadUsers, setFilters, setPagination, updateUserRole } = useUserContext();
  const { state: roleState } = useRoleContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null);

  // Refs para evitar cargas duplicadas y loops
  const hasLoadedUsersRef = React.useRef(false);
  const getTokenRef = React.useRef(getToken);
  const loadUsersRef = React.useRef(loadUsers);

  // Actualizar refs sin causar re-renders
  React.useEffect(() => {
    getTokenRef.current = getToken;
    loadUsersRef.current = loadUsers;
  }, [getToken, loadUsers]);

  // Cargar usuarios al montar el componente (solo una vez)
  useEffect(() => {
    if (hasLoadedUsersRef.current) return;
    hasLoadedUsersRef.current = true;
    loadUsersRef.current(getTokenRef.current);
  }, []); // Sin dependencias - solo carga una vez al montar

  // Los roles ya se cargan en RoleContext automáticamente, no necesitamos cargarlos aquí

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters: Partial<UserListFilters>) => {
    setFilters(newFilters);
    setPagination({ page: 1 }); // Resetear a la primera página
    // Cargar con nuevos filtros
    loadUsersRef.current(getTokenRef.current);
  };

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== state.filters.search) {
        setFilters({ search: searchTerm });
        setPagination({ page: 1 });
        if (hasLoadedUsersRef.current) {
          loadUsersRef.current(getTokenRef.current);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Manejar cambio de rol
  const handleRoleChange = async (user: User, newRole: string) => {
    if (!user.clerk_id) return;
    
    setIsLoadingAction(user.id);
    try {
      await updateUserRole(getTokenRef.current, user.clerk_id, newRole);
    } catch (error) {
      console.error('Error actualizando rol:', error);
    } finally {
      setIsLoadingAction(null);
    }
  };

  // Manejar paginación
  const handlePageChange = (newPage: number) => {
    setPagination({ page: newPage });
  };

  if (state.operations.list.loading && state.users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando usuarios...</span>
      </div>
    );
  }

  if (state.operations.list.error) {
    return (
      <div className="text-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {state.operations.list.error}</p>
          <button
            onClick={() => loadUsers(getToken)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      {!compact && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por rol */}
            <div className="w-full md:w-48">
              <select
                value={state.filters.role || 'all'}
                onChange={(e) => handleFilterChange({ role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los roles</option>
                {roleState.roles.length > 0 ? (
                  roleState.roles
                    .filter(role => role.is_active)
                    .map(role => (
                      <option key={role.id} value={role.name}>
                        {role.display_name}
                      </option>
                    ))
                ) : (
                  <>
                    <option value="user">Usuario</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Administrador</option>
                    <option value="super_admin">Super Admin</option>
                  </>
                )}
              </select>
              {roleState.operations.list.loading && (
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                  Cargando roles...
                </p>
              )}
            </div>

            {/* Filtro por estado */}
            <div className="w-full md:w-48">
              <select
                value={state.filters.status || 'all'}
                onChange={(e) => handleFilterChange({ status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {state.users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        ) : (
          <>
            {/* Tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último acceso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.users.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectUser?.(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.image_url && (
                            <img
                              className="h-8 w-8 rounded-full mr-3"
                              src={user.image_url}
                              alt={user.full_name || user.email}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || `${user.first_name} ${user.last_name}` || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PermissionGuard
                          user={currentUser}
                          permission="roles.assign"
                          fallback={
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role?.name || 'user')}`}>
                              {getRoleDisplayName(user.role?.name || 'user')}
                            </span>
                          }
                        >
                          <select
                            value={user.role?.name || 'user'}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleRoleChange(user, e.target.value);
                            }}
                            disabled={isLoadingAction === user.id || roleState.operations.list.loading}
                            className={`text-xs px-2 py-1 rounded-full border ${getRoleColor(user.role?.name || 'user')} ${
                              isLoadingAction === user.id ? 'opacity-50' : ''
                            }`}
                          >
                            {roleState.roles.length > 0 ? (
                              roleState.roles
                                .filter(role => role.is_active)
                                .map(role => (
                                  <option key={role.id} value={role.name}>
                                    {role.display_name}
                                  </option>
                                ))
                            ) : (
                              <>
                                <option value="user">Usuario</option>
                                <option value="moderator">Moderador</option>
                                <option value="admin">Administrador</option>
                                <option value="super_admin">Super Admin</option>
                              </>
                            )}
                          </select>
                          {roleState.operations.list.loading && (
                            <div className="absolute -bottom-6 left-0 text-xs text-blue-600 flex items-center">
                              <div className="animate-spin rounded-full h-2 w-2 border-b border-blue-600 mr-1"></div>
                              Cargando...
                            </div>
                          )}
                        </PermissionGuard>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatLastLogin(user.last_login)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <PermissionGuard user={currentUser} permission="users.update">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('🔧 Botón Editar clickeado para usuario:', user);
                                console.log('🔧 currentUser tiene permisos:', currentUser);
                                onEditUser?.(user);
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              Editar
                            </button>
                          </PermissionGuard>
                          
                          <PermissionGuard user={currentUser} permission="users.delete">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteUser?.(user);
                              }}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Eliminar
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards para mobile */}
            <div className="md:hidden">
              {state.users.map((user) => (
                <div
                  key={user.id}
                  className="border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectUser?.(user)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {user.image_url && (
                        <img
                          className="h-8 w-8 rounded-full mr-3"
                          src={user.image_url}
                          alt={user.full_name || user.email}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || `${user.first_name} ${user.last_name}` || 'Sin nombre'}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role?.name || 'user')}`}>
                      {getRoleDisplayName(user.role?.name || 'user')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Creado: {formatDate(user.created_at)}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Paginación */}
        {!compact && state.pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(state.pagination.page - 1)}
                disabled={state.pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(state.pagination.page + 1)}
                disabled={state.pagination.page >= state.pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">
                    {((state.pagination.page - 1) * state.pagination.pageSize) + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-medium">
                    {Math.min(state.pagination.page * state.pagination.pageSize, state.pagination.total)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">{state.pagination.total}</span> usuarios
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: state.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === state.pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};