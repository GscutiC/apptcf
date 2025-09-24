/**
 * Layout principal - VERSIÓN FINAL OPTIMIZADA
 */

import React, { useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { useAuthProfile } from '../../../hooks/useAuthProfile';
import { adaptUserProfileToUser } from '../../utils/userAdapter';

export type ModulePage = 
  | 'dashboard' 
  | 'chat' 
  | 'users-legacy' 
  | 'users-management'
  | 'roles-management'
  | 'settings'
  | 'profile';

interface MenuItem {
  id: ModulePage;
  label: string;
  icon: string;
  description: string;
  permission?: string;
  requireAdmin?: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  currentPage: ModulePage;
  onPageChange: (page: ModulePage) => void;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Vista general del sistema'
  },
  {
    id: 'chat',
    label: 'Chat IA',
    icon: '💬',
    description: 'Interactúa con la inteligencia artificial'
  },
  {
    id: 'users-management',
    label: 'Gestión de Usuarios',
    icon: '👥',
    description: 'Administrar usuarios y permisos',
    permission: 'users.read'
  },
  {
    id: 'roles-management',
    label: 'Gestión de Roles',
    icon: '🔐',
    description: 'Configurar roles y permisos',
    permission: 'roles.read',
    requireAdmin: true
  },
  {
    id: 'users-legacy',
    label: 'Usuarios (Legacy)',
    icon: '👤',
    description: 'Sistema de usuarios anterior'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: '⚙️',
    description: 'Configuración del sistema',
    requireAdmin: true
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    icon: '👤',
    description: 'Información personal'
  }
];

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { userProfile, loading } = useAuthProfile();
  const currentUser = adaptUserProfileToUser(userProfile);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando aplicación...</span>
      </div>
    );
  }

  const isAdmin = currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'super_admin';

  const hasPermissionForItem = (item: MenuItem): boolean => {
    if (item.requireAdmin && !isAdmin) return false;
    if (!item.permission) return true;
    
    return currentUser?.role?.permissions.includes(item.permission as any) || false;
  };

  const visibleMenuItems = MENU_ITEMS.filter(item => hasPermissionForItem(item));

  const getCurrentPageInfo = () => {
    return MENU_ITEMS.find(item => item.id === currentPage) || MENU_ITEMS[0];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Optimizado */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0`}>
        
        {/* Header del Sidebar */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">MA</span>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-800">Mi App Completa</h1>
                  <p className="text-xs text-gray-500">Sistema de Gestión</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto shadow-md">
                <span className="text-white font-bold text-sm">MA</span>
              </div>
            )}
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all duration-200"
              title={sidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 group ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm'
              }`}
              title={sidebarCollapsed ? item.label : item.description}
            >
              <span className={`text-base mr-3 ${sidebarCollapsed ? 'mx-auto' : ''}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${
                    currentPage === item.id ? 'text-white' : 'text-gray-900 group-hover:text-blue-800'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-xs truncate ${
                    currentPage === item.id ? 'text-blue-100' : 'text-gray-500 group-hover:text-blue-600'
                  }`}>
                    {item.description}
                  </div>
                </div>
              )}
              {!sidebarCollapsed && currentPage !== item.id && (
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="font-medium">v1.0.0</span>
                </div>
                <p className="text-xs">Sistema Completo</p>
              </div>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full shadow-md"
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full shadow-md"
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Principal */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{getCurrentPageInfo().icon}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {getCurrentPageInfo().label}
                </h1>
                <p className="text-sm text-gray-600">
                  {getCurrentPageInfo().description}
                </p>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-2">
                <li className="inline-flex items-center">
                  <span className="text-sm text-gray-500">Mi App Completa</span>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {getCurrentPageInfo().label}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </header>

        {/* Área de Contenido */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};