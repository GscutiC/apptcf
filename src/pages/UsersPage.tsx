/**
 * Página de Gestión de Usuarios - Optimizada con React Query
 * Ruta: /users
 * Protegida: Requiere permiso 'users.read'
 *
 * ✅ OPTIMIZADO: Usa React Query para cache automático y reducción de llamadas API
 */

import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthProfile } from '../hooks/useAuthProfile';
import { adaptUserProfileToUser } from '../shared/utils/userAdapter';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import Loading from '../shared/components/ui/Loading';
// ✅ NUEVO: Importar hooks de React Query
import { useUsers, useRoles, useUpdateUserRole } from '../hooks/queries';

interface User {
  id: string;
  clerk_id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  role?: {
    name: string;
    display_name: string;
    permissions: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const UsersPage: React.FC = () => {
  const { getToken } = useAuth();
  const { userProfile, loading: userLoading } = useAuthProfile();
  const currentUser = adaptUserProfileToUser(userProfile);
  const { isSuperAdmin, isAdmin, checkPermission } = useProtectedRoute();

  // ✅ NUEVO: Usar React Query en lugar de useState + useEffect
  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const updateUserRole = useUpdateUserRole();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // ✅ OPTIMIZADO: handleSaveUser ahora usa mutación de React Query
  const handleSaveUser = async (updatedData: any) => {
    if (!editingUser || !getToken) return;

    try {
      // Si el rol cambió, actualizar el rol
      if (updatedData.role !== editingUser.role?.name) {
        await updateUserRole.mutateAsync({
          clerkId: editingUser.clerk_id || editingUser.id,
          roleName: updatedData.role
        });

        // ✅ React Query invalida automáticamente el cache de usuarios
        // No necesitamos recargar manualmente
      }

      setEditingUser(null);
      alert('✅ Usuario actualizado correctamente');

    } catch (error) {
      console.error('❌ Error guardando usuario:', error);
      alert('❌ Error al guardar los cambios. Por favor, inténtalo de nuevo.');
    }
  };

  // ✅ OPTIMIZADO: Loading unificado de React Query
  if (userLoading || usersLoading || rolesLoading) {
    return <Loading message="Cargando gestión de usuarios..." />;
  }

  // ✅ NUEVO: Manejo de errores de React Query
  if (usersError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold">Error al Cargar Usuarios</h2>
          <p className="text-red-600">{usersError instanceof Error ? usersError.message : 'Error desconocido'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold">Error de Autenticación</h2>
          <p className="text-red-600">No se pudo cargar la información del usuario.</p>
        </div>
      </div>
    );
  }

  // Verificar permisos
  if (!checkPermission('users.read') && !isAdmin && !isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-yellow-800 font-semibold">Acceso Restringido</h2>
          <p className="text-yellow-600">No tienes permisos para acceder a la gestión de usuarios.</p>
          <div className="mt-4 text-sm text-yellow-700">
            <p><strong>Tu rol actual:</strong> {currentUser.role?.display_name || 'Sin rol'}</p>
            <p><strong>Permisos requeridos:</strong> users.read, admin, o super_admin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👥 Gestión de Usuarios
        </h1>
        <p className="text-gray-600">
          Administrar usuarios y permisos del sistema
        </p>
      </div>

      {/* Info del usuario actual */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          ✅ Acceso Autorizado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p><strong>Usuario:</strong> {currentUser.full_name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
          </div>
          <div>
            <p><strong>Rol:</strong> {currentUser.role?.display_name || 'Sin rol'}</p>
            <p><strong>Nivel:</strong> {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Usuario'}</p>
          </div>
          <div>
            <p><strong>Puede crear usuarios:</strong> {checkPermission('users.create') || isSuperAdmin ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Puede editar usuarios:</strong> {checkPermission('users.update') || isSuperAdmin ? '✅ Sí' : '❌ No'}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">🛡️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role?.name === 'super_admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-semibold">👑</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role?.name === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Lista de Usuarios
            </h2>
            {(checkPermission('users.create') || isSuperAdmin) && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                + Nuevo Usuario
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
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
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {(user.first_name?.[0] || user.full_name?.[0] || user.email[0]).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role?.name === 'super_admin' ? 'bg-red-100 text-red-800' :
                      user.role?.name === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role?.name === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role?.display_name || 'Sin rol'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </button>
                      {(checkPermission('users.update') || isSuperAdmin) && (
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                      )}
                      {(checkPermission('users.delete') || isSuperAdmin) && user.id !== currentUser.id && (
                        <button className="text-red-600 hover:text-red-900">
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalle de usuario */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Detalles del Usuario
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre:</label>
                  <p className="text-gray-900">{selectedUser.full_name || 'Sin nombre'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email:</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rol:</label>
                  <p className="text-gray-900">{selectedUser.role?.display_name || 'Sin rol'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Permisos:</label>
                  <div className="mt-2 space-y-1">
                    {selectedUser.role?.permissions.slice(0, 5).map(permission => (
                      <span
                        key={permission}
                        className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs mr-1 mb-1"
                      >
                        {permission}
                      </span>
                    ))}
                    {(selectedUser.role?.permissions.length || 0) > 5 && (
                      <p className="text-xs text-gray-500">
                        +{(selectedUser.role?.permissions.length || 0) - 5} más...
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                {(checkPermission('users.update') || isSuperAdmin) && (
                  <button
                    onClick={() => {
                      setEditingUser(selectedUser);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de usuario */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                ✏️ Editar Usuario: {editingUser.full_name || editingUser.email}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedData = {
                  full_name: formData.get('full_name'),
                  role: formData.get('role'),
                  is_active: formData.has('is_active')
                };

                handleSaveUser(updatedData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      defaultValue={editingUser.full_name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre completo del usuario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={editingUser.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <select
                      name="role"
                      defaultValue={editingUser.role?.name || 'user'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roles
                        .filter((role: any) => role.is_active)
                        .map((role: any) => (
                          <option key={role.id} value={role.name}>
                            {role.display_name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={editingUser.is_active}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Usuario activo</span>
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    disabled={updateUserRole.isPending}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updateUserRole.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {updateUserRole.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      '💾 Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje si no hay usuarios */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios</h3>
          <p className="text-gray-600">No se encontraron usuarios en el sistema.</p>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
