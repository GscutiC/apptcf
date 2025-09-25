/**
 * Dashboard del Módulo de Gestión de Usuarios
 * Punto central para navegar entre gestión de usuarios y roles
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useAuthProfile } from '../hooks/useAuthProfile';
import { adaptUserProfileToUser } from '../shared/utils/userAdapter';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { hasPermission } from '../modules/user-management/utils/permissions.utils';
import Loading from '../shared/components/ui/Loading';

// Componente memoizado para la card de usuarios
const UserManagementCard: React.FC<{
  canManage: boolean;
  onNavigate: () => void;
}> = React.memo(({ canManage, onNavigate }) => {
  if (!canManage) {
    return (
      <div className="bg-gray-50 rounded-lg shadow-md border border-gray-200 opacity-60">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gray-200 rounded-lg">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Usuarios</h3>
              <p className="text-sm text-red-600">Sin Acceso</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Necesitas el permiso 'users.read' para acceder a esta sección.
          </p>
          <span className="text-sm text-gray-400">🔒 Acceso Restringido</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-green-300"
      onClick={onNavigate}
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Usuarios</h3>
            <p className="text-sm text-green-600">Activo</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Crear, editar y administrar usuarios del sistema. Asignar roles y gestionar permisos.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">📋 Acceso Completo</span>
          <div className="text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

// Componente memoizado para la card de roles
const RoleManagementCard: React.FC<{
  canManage: boolean;
  onNavigate: () => void;
}> = React.memo(({ canManage, onNavigate }) => {
  if (!canManage) {
    return (
      <div className="bg-gray-50 rounded-lg shadow-md border border-gray-200 opacity-60">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gray-200 rounded-lg">
              <span className="text-2xl">🔐</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Roles y Permisos</h3>
              <p className="text-sm text-red-600">Sin Acceso</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Solo administradores pueden gestionar roles y permisos del sistema.
          </p>
          <span className="text-sm text-gray-400">👮 Solo Administradores</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-purple-300"
      onClick={onNavigate}
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">🔐</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Roles y Permisos</h3>
            <p className="text-sm text-purple-600">Admin</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Configurar roles del sistema, definir permisos y establecer niveles de acceso.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">⚡ Control Total</span>
          <div className="text-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

export const UserManagementDashboard: React.FC = () => {
  // Todos los hooks deben estar al principio, antes de cualquier condicional
  const navigate = useNavigate();
  const { userProfile, loading: userLoading } = useAuthProfile();
  const { isAdmin, isSuperAdmin } = useProtectedRoute();
  
  // Funciones de navegación optimizadas con useCallback para evitar re-renders
  const navigateToUsers = useCallback(() => {
    navigate('/users');
  }, [navigate]);

  const navigateToRoles = useCallback(() => {
    navigate('/roles');
  }, [navigate]);

  // Verificaciones después de todos los hooks
  const currentUser = adaptUserProfileToUser(userProfile);
  
  if (userLoading || !currentUser) {
    return <Loading message="Cargando módulo de usuarios..." />;
  }

  // Permisos calculados después de la validación
  const canManageUsers = hasPermission(currentUser, 'users.read');
  const canManageRoles = hasPermission(currentUser, 'roles.read') && (isAdmin || isSuperAdmin);

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <p className="text-blue-100">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Navegación Interna */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserManagementCard 
          canManage={canManageUsers} 
          onNavigate={navigateToUsers}
        />
        <RoleManagementCard 
          canManage={canManageRoles} 
          onNavigate={navigateToRoles}
        />
      </div>

      {/* Estadísticas Rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Módulo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">🎯</div>
            <div className="text-sm text-gray-600">Acceso Centralizado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">⚡</div>
            <div className="text-sm text-gray-600">Gestión Rápida</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">🔐</div>
            <div className="text-sm text-gray-600">Control de Acceso</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">📊</div>
            <div className="text-sm text-gray-600">Vista Organizada</div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          {canManageUsers && (
            <>
              <button 
                onClick={navigateToUsers}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                👤 Ver Usuarios
              </button>
              <button 
                onClick={navigateToUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ Crear Usuario
              </button>
            </>
          )}
          {canManageRoles && (
            <>
              <button 
                onClick={navigateToRoles}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🔐 Ver Roles
              </button>
              <button 
                onClick={navigateToRoles}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ➕ Crear Rol
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementDashboard;