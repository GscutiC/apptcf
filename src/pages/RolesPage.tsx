/**
 * Página de Gestión de Roles y Permisos - Optimizada con React Query
 * Ruta: /roles
 * Protegida: Solo administradores o super_admin
 *
 * ✅ OPTIMIZADO: Usa React Query para cache automático y reducción de llamadas API
 */

import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthContext } from '../context/AuthContext';
import { adaptUserProfileToUser } from '../shared/utils/userAdapter';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { PERMISSION_GROUPS, getRoleDisplayName, getRoleColor } from '../modules/user-management/utils/permissions.utils';
import Loading from '../shared/components/ui/Loading';
import RoleFormModal, { RoleFormData } from '../shared/components/ui/RoleFormModal';

import { UserRole } from '../services/authService';

// ✅ NUEVO: Importar hooks de React Query
import { useUsers, useRoles, useCreateRole, useUpdateRole } from '../hooks/queries';

export const RolesPage: React.FC = () => {
  const { getToken } = useAuth();
  const { userProfile, loading: userLoading } = useAuthContext();
  const currentUser = adaptUserProfileToUser(userProfile);
  const { isSuperAdmin, isAdmin } = useProtectedRoute();

  // ✅ NUEVO: Usar React Query en lugar de useState + useEffect
  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useRoles();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);

  // ✅ OPTIMIZADO: handleCreateRole ahora usa mutación de React Query
  const handleCreateRole = async (roleData: RoleFormData) => {
    try {
      await createRole.mutateAsync(roleData);

      setShowCreateModal(false);
      alert('✅ Rol creado exitosamente!');
      // ✅ React Query invalida automáticamente el cache de roles
      // Ya no necesitamos eventos globales ni recargas manuales

    } catch (error) {
      console.error('❌ Error creando rol:', error);
      alert('❌ Error al crear el rol: ' + (error as Error).message);
      throw error;
    }
  };

  // ✅ OPTIMIZADO: handleEditRole ahora usa mutación de React Query
  const handleEditRole = async (roleData: RoleFormData) => {
    try {
      if (!editingRole) {
        console.error('❌ No hay rol seleccionado para editar');
        return;
      }

      if (!editingRole.id) {
        alert('❌ Error: El rol no tiene un ID válido');
        return;
      }
      
      await updateRole.mutateAsync({
        roleId: editingRole.id,
        roleData
      });

      // Si el rol seleccionado es el que se editó, actualizarlo
      if (selectedRole?.id === editingRole.id) {
        // React Query actualizará el cache automáticamente
        const updatedRoles = roles.find(r => r.id === editingRole.id);
        if (updatedRoles) {
          setSelectedRole(updatedRoles);
        }
      }

      setEditingRole(null);
      alert('✅ Rol actualizado exitosamente!');
      // ✅ React Query invalida automáticamente el cache

    } catch (error) {
      console.error('❌ Error editando rol:', error);
      alert('❌ Error al actualizar el rol: ' + (error as Error).message);
      throw error;
    }
  };

  // ✅ OPTIMIZADO: Loading unificado de React Query
  if (userLoading || rolesLoading || usersLoading) {
    return <Loading message="Cargando gestión de roles..." />;
  }

  // ✅ NUEVO: Manejo de errores de React Query
  if (rolesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold">Error al Cargar Roles</h2>
          <p className="text-red-600">{rolesError instanceof Error ? rolesError.message : 'Error desconocido'}</p>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🛡️ Gestión de Roles y Permisos
        </h1>
        <p className="text-gray-600">
          Configurar roles y permisos del sistema
        </p>
      </div>

      {/* Info del usuario actual */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          👤 Tu nivel de acceso:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Usuario:</strong> {currentUser.full_name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
          </div>
          <div>
            <p><strong>Rol actual:</strong>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser.role?.name || 'user')}`}>
                {currentUser.role?.display_name || 'Sin rol'}
              </span>
            </p>
            <p><strong>Puede gestionar roles:</strong> {isAdmin ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Puede crear roles:</strong> {isSuperAdmin ? '✅ Sí' : '❌ No'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Roles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  📋 Roles del Sistema
                </h2>
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={createRole.isPending}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {createRole.isPending ? '...' : '+ Nuevo'}
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">
                {roles.length} roles configurados
              </p>
            </div>

            <div className="p-4 space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id || `role-${role.name}`}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedRole?.id === role.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      onClick={() => setSelectedRole(role)}
                      className="flex-1 cursor-pointer"
                    >
                      <h3 className="font-medium text-gray-900">
                        {getRoleDisplayName(role.name)}
                      </h3>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role.name)}`}>
                        {role.name}
                      </span>
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRole(role);
                        }}
                        disabled={updateRole.isPending}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title="Editar rol"
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                  <div
                    onClick={() => setSelectedRole(role)}
                    className="cursor-pointer"
                  >
                    <p className="text-sm text-gray-600 mb-2">
                      {role.description || 'Sin descripción'}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{role.permissions.length} permisos</span>
                      <span className="text-green-600">
                        ✅ Activo
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detalles del Rol */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {getRoleDisplayName(selectedRole.name)}
                    </h2>
                    <p className="text-gray-600">
                      {selectedRole.description || 'Sin descripción'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedRole.name)}`}>
                    {selectedRole.name}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔐 Permisos ({selectedRole.permissions.length})
                </h3>

                <div className="space-y-4">
                  {PERMISSION_GROUPS
                    .filter(group => group.permissions.some(p => selectedRole.permissions.includes(p.permission)))
                    .map((group) => (
                      <div key={group.category} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{group.category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {group.permissions.map((perm) => (
                            <div
                              key={perm.permission}
                              className={`flex items-center space-x-2 p-2 rounded ${
                                selectedRole.permissions.includes(perm.permission)
                                  ? 'bg-green-50 text-green-800'
                                  : 'bg-gray-50 text-gray-400'
                              }`}
                            >
                              <span>{selectedRole.permissions.includes(perm.permission) ? '✅' : '❌'}</span>
                              <div>
                                <p className="text-sm font-medium">{perm.permission}</p>
                                <p className="text-xs">{perm.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Estadísticas de uso del rol */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📊 Estadísticas de Uso
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Usuarios con este rol</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.role?.name === selectedRole.name).length}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Total de permisos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedRole.permissions.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <div className="text-6xl mb-4">🛡️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona un rol</h3>
              <p className="text-gray-600">Elige un rol para ver sus detalles y permisos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar roles */}
      {(showCreateModal || editingRole) && (
        <RoleFormModal
          isOpen={showCreateModal || !!editingRole}
          mode={editingRole ? 'edit' : 'create'}
          role={editingRole}
          onSave={editingRole ? handleEditRole : handleCreateRole}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRole(null);
          }}
        />
      )}
    </div>
  );
};

export default RolesPage;
