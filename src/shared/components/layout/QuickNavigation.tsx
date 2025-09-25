/**
 * Componente de Navegación Rápida para el Dashboard
 * Muestra todos los módulos disponibles según permisos del usuario
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useProtectedRoute } from '../../../hooks/useProtectedRoute';

interface QuickNavItem {
  path: string;
  title: string;
  description: string;
  icon: string;
  permission?: string;
  role?: string;
  bgColor: string;
  hoverColor: string;
  iconBg: string;
  checkAccess: (canAccess: any, checkPermission: any, checkAnyRole: any, isAdmin: boolean) => boolean;
}

const QUICK_NAV_ITEMS: QuickNavItem[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Vista general del sistema',
    icon: '📊',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    iconBg: 'bg-blue-500',
    checkAccess: () => true // Siempre disponible
  },
  {
    path: '/chat',  
    title: 'Chat IA',
    description: 'Conversa con la inteligencia artificial',
    icon: '💬',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100',
    iconBg: 'bg-green-500',
    checkAccess: () => true // Siempre disponible
  },
  {
    path: '/profile',
    title: 'Mi Perfil',
    description: 'Información personal y configuración',
    icon: '👤',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100', 
    iconBg: 'bg-purple-500',
    checkAccess: () => true // Siempre disponible
  },
  {
    path: '/users',
    title: 'Gestión de Usuarios',
    description: 'Administrar usuarios y permisos',
    icon: '👥',
    permission: 'users.read',
    bgColor: 'bg-cyan-50',
    hoverColor: 'hover:bg-cyan-100',
    iconBg: 'bg-cyan-500',
    checkAccess: (canAccess, checkPermission) => checkPermission('users.read')
  },
  {
    path: '/roles',
    title: 'Gestión de Roles',
    description: 'Configurar roles y permisos',
    icon: '🔐',
    role: 'admin',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100',
    iconBg: 'bg-indigo-500',
    checkAccess: (canAccess, checkPermission, checkAnyRole) => 
      checkAnyRole(['admin', 'super_admin'])
  },
  {
    path: '/settings',
    title: 'Configuración',
    description: 'Configuración del sistema',
    icon: '⚙️',
    role: 'admin',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100',
    iconBg: 'bg-orange-500',
    checkAccess: (canAccess, checkPermission, checkAnyRole, isAdmin) => isAdmin
  }
];

export const QuickNavigation: React.FC = () => {
  const { 
    canAccess, 
    checkPermission, 
    checkAnyRole, 
    isAdmin,
    userPermissions
  } = useProtectedRoute();

  const availableItems = QUICK_NAV_ITEMS.filter(item => 
    item.checkAccess(canAccess, checkPermission, checkAnyRole, isAdmin)
  );

  const blockedItems = QUICK_NAV_ITEMS.filter(item => 
    !item.checkAccess(canAccess, checkPermission, checkAnyRole, isAdmin)
  );

  return (
    <div className="space-y-6">
      {/* Módulos Disponibles */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-green-500 mr-2">✅</span>
          Módulos Disponibles ({availableItems.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${item.bgColor} ${item.hoverColor} p-4 rounded-lg border-2 border-transparent hover:border-gray-300 transition-all duration-200 group block`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-lg">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 group-hover:text-gray-800">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 mt-1">
                    {item.description}
                  </p>
                  {item.permission && (
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                      <span className="text-xs text-blue-600 font-medium">{item.permission}</span>
                    </div>
                  )}
                  {item.role && (
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                      <span className="text-xs text-purple-600 font-medium">Rol: {item.role}</span>
                    </div>
                  )}
                </div>
                <div className="text-gray-400 group-hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Módulos Bloqueados */}
      {blockedItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-red-500 mr-2">🔒</span>
            Requieren Permisos Adicionales ({blockedItems.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blockedItems.map((item) => (
              <div
                key={item.path}
                className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 opacity-60"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center text-white">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-700">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                      <span className="text-xs text-red-600 font-medium">
                        {item.permission ? `Requiere: ${item.permission}` : 
                         item.role ? `Requiere rol: ${item.role}` : 'Sin acceso'}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen de Permisos */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">📋 Resumen de tu Acceso</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Módulos disponibles:</strong> {availableItems.length} de {QUICK_NAV_ITEMS.length}</p>
          <p><strong>Permisos activos:</strong> {userPermissions.length}</p>
          <p><strong>Nivel de acceso:</strong> {isAdmin ? 'Administrador' : 'Usuario básico'}</p>
        </div>
      </div>
    </div>
  );
};

export default QuickNavigation;