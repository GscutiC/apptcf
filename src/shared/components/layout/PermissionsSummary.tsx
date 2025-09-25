import React from 'react';
import { useProtectedRoute } from '../../../hooks/useProtectedRoute';
import { PERMISSION_GROUPS, getRoleColor } from '../../../modules/user-management/utils/permissions.utils';
import { Link } from 'react-router-dom';

const PermissionsSummary: React.FC = () => {
  const { user, isSuperAdmin, isAdmin, checkPermission } = useProtectedRoute();

  if (!user) return null;

  // Calcular estadísticas de permisos
  const totalPermissions = PERMISSION_GROUPS.reduce((acc, group) => acc + group.permissions.length, 0);
  const userPermissions = user.role?.permissions || [];
  const permissionsByCategory = PERMISSION_GROUPS.map(group => ({
    category: group.category,
    total: group.permissions.length,
    granted: group.permissions.filter(p => userPermissions.includes(p.permission)).length,
    permissions: group.permissions
  }));

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            🔐 Resumen de Permisos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tu nivel de acceso y permisos disponibles
          </p>
        </div>
        {(isAdmin || isSuperAdmin) && (
          <Link 
            to="/roles"
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Gestionar Roles
          </Link>
        )}
      </div>

      {/* Info del usuario */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Usuario actual</p>
            <p className="font-semibold text-gray-900">{user.full_name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Rol</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role?.name || 'user')}`}>
              {user.role?.display_name || 'Sin rol'}
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">{userPermissions.length}</p>
          <p className="text-xs text-green-700">Permisos otorgados</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{totalPermissions}</p>
          <p className="text-xs text-blue-700">Total sistema</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">{Math.round((userPermissions.length / totalPermissions) * 100)}%</p>
          <p className="text-xs text-purple-700">Cobertura</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-600">{isSuperAdmin ? 'TOTAL' : isAdmin ? 'ALTA' : 'MEDIA'}</p>
          <p className="text-xs text-yellow-700">Autoridad</p>
        </div>
      </div>

      {/* Permisos por categoría */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 mb-3">Permisos por categoría:</h4>
        {permissionsByCategory.map((category) => (
          <div key={category.category} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-800">{category.category}</h5>
              <span className="text-sm text-gray-600">
                {category.granted}/{category.total}
              </span>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full ${
                  category.granted === category.total 
                    ? 'bg-green-500' 
                    : category.granted > 0 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${(category.granted / category.total) * 100}%` }}
              ></div>
            </div>

            {/* Lista de permisos (solo los primeros 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
              {category.permissions.slice(0, 3).map((perm) => (
                <div 
                  key={perm.permission}
                  className={`flex items-center space-x-2 ${
                    userPermissions.includes(perm.permission)
                      ? 'text-green-700'
                      : 'text-gray-400'
                  }`}
                >
                  <span className="text-xs">
                    {userPermissions.includes(perm.permission) ? '✅' : '❌'}
                  </span>
                  <span className="truncate">{perm.permission}</span>
                </div>
              ))}
              {category.permissions.length > 3 && (
                <div className="text-xs text-gray-500 col-span-2">
                  +{category.permissions.length - 3} más...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Acciones disponibles:</h4>
        <div className="grid grid-cols-2 gap-3">
          {checkPermission('users.read') && (
            <Link 
              to="/users"
              className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm"
            >
              👥 Gestionar Usuarios
            </Link>
          )}
          {(isAdmin || isSuperAdmin) && (
            <Link 
              to="/roles"
              className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors text-sm"
            >
              🛡️ Gestionar Roles
            </Link>
          )}
          {checkPermission('audit.view_logs') && (
            <Link 
              to="/settings"
              className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm"
            >
              📊 Ver Auditoría
            </Link>
          )}
          {(isAdmin || isSuperAdmin) && (
            <Link 
              to="/settings"
              className="flex items-center justify-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors text-sm"
            >
              ⚙️ Configuración
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionsSummary;