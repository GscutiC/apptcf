/**
 * Página principal de gestión de usuarios
 * Integra todos los componentes de usuario en una interfaz completa
 */

import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { UserProvider } from '../context/UserContext';
import { RoleProvider } from '../context/RoleContext';
import { UserList } from '../components/UserList';
import { UserForm } from '../components/UserForm';
import { User } from '../types/user.types';
import { PermissionGuard } from '../../../shared/components/guards/PermissionGuard';
import { useAuthProfile } from '../../../hooks/useAuthProfile';
import { adaptUserProfileToUser } from '../../../shared/utils/userAdapter';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export const UsersPage: React.FC = () => {
  const { userProfile } = useAuthProfile();
  const currentUser = adaptUserProfileToUser(userProfile);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Handlers para cambiar vistas
  const handleCreateUser = () => {
    setSelectedUser(null);
    setViewMode('create');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setViewMode('edit');
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setViewMode('detail');
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.full_name || user.email}?`)) {
      // La lógica de eliminación se maneja en el UserList
      console.log('Eliminar usuario:', user);
    }
  };

  const handleFormSubmit = (user: User) => {
    setViewMode('list');
    setSelectedUser(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedUser(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <UserForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        );
      
      case 'edit':
        return (
          <UserForm
            user={selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        );
      
      case 'detail':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Detalles del Usuario
                </h2>
                <p className="text-gray-600 mt-1">
                  Información completa del usuario seleccionado
                </p>
              </div>
              <div className="flex space-x-2">
                <PermissionGuard user={currentUser} permission="users.update">
                  <button
                    onClick={() => handleEditUser(selectedUser!)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Editar
                  </button>
                </PermissionGuard>
                <button
                  onClick={() => setViewMode('list')}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                >
                  Volver
                </button>
              </div>
            </div>
            
            {selectedUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                    <p className="text-gray-900">{selectedUser.full_name || `${selectedUser.first_name} ${selectedUser.last_name}`}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Teléfono</label>
                    <p className="text-gray-900">{selectedUser.phone_number || 'No especificado'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rol</label>
                    <p className="text-gray-900">{selectedUser.role?.display_name || 'Sin rol'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Permisos</label>
                    <div className="mt-2 space-y-1">
                      {selectedUser.role?.permissions.map(permission => (
                        <span 
                          key={permission}
                          className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs mr-2 mb-1"
                        >
                          {permission}
                        </span>
                      )) || <p className="text-gray-500 text-sm">Sin permisos asignados</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Creado</label>
                    <p className="text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Última Actualización</label>
                    <p className="text-gray-900">{new Date(selectedUser.updated_at).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <UserList
            onSelectUser={handleSelectUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        );
    }
  };

  return (
    <UserProvider>
      <RoleProvider>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {viewMode === 'create' && 'Crear Usuario'}
                      {viewMode === 'edit' && 'Editar Usuario'}
                      {viewMode === 'detail' && 'Detalles del Usuario'}
                      {viewMode === 'list' && 'Gestión de Usuarios'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {viewMode === 'create' && 'Completa los datos para crear un nuevo usuario'}
                      {viewMode === 'edit' && 'Modifica la información del usuario'}
                      {viewMode === 'detail' && 'Información completa del usuario'}
                      {viewMode === 'list' && 'Administra todos los usuarios del sistema'}
                    </p>
                  </div>
                  
                  {viewMode === 'list' && (
                    <PermissionGuard user={currentUser} permission="users.create">
                      <button
                        onClick={handleCreateUser}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                      >
                        <span className="mr-2">+</span>
                        Nuevo Usuario
                      </button>
                    </PermissionGuard>
                  )}
                </div>
                
                {/* Breadcrumb */}
                <nav className="flex mt-4" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`text-sm ${viewMode === 'list' ? 'text-gray-700 font-medium' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        Usuarios
                      </button>
                    </li>
                    {viewMode !== 'list' && (
                      <>
                        <li>
                          <div className="flex items-center">
                            <span className="text-gray-400">/</span>
                            <span className="ml-1 text-sm font-medium text-gray-700">
                              {viewMode === 'create' && 'Crear'}
                              {viewMode === 'edit' && 'Editar'}
                              {viewMode === 'detail' && 'Detalles'}
                            </span>
                          </div>
                        </li>
                      </>
                    )}
                  </ol>
                </nav>
              </div>

              {/* Content */}
              {renderContent()}
            </div>
          </div>
        </div>
      </RoleProvider>
    </UserProvider>
  );
};