/**
 * Layout principal - VERSIÓN CON REACT ROUTER
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useAuthProfile } from '../../../hooks/useAuthProfile';
import { adaptUserProfileToUser } from '../../utils/userAdapter';
import { useInterfaceConfig, ConfigSyncMonitor } from '../../../modules/interface-config';

// Componente para logo con fallback automático
interface LogoWithFallbackProps {
  imageUrl?: string;
  showImage?: boolean;
  appName: string;
  size?: string;
  collapsedText?: string;
}

const LogoWithFallback: React.FC<LogoWithFallbackProps> = ({ 
  imageUrl, 
  showImage, 
  appName, 
  size = "w-8 h-8",
  collapsedText 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(false);
    setImageLoading(false);
  };

  const shouldUseFallback = !showImage || !imageUrl || imageError;

  // Si no debe mostrar imagen o hay error o no hay URL, usar fallback
  if (shouldUseFallback) {
    const fallbackText = collapsedText || appName.substring(0, 2).toUpperCase();
    
    return (
      <div className={`${size} rounded-lg bg-gradient-to-r from-primary-500 to-secondary-600 flex items-center justify-center shadow-md`}>
        <span className="text-white font-bold text-sm">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {imageLoading && (
        <div className={`${size} rounded-lg bg-gray-300 animate-pulse flex items-center justify-center shadow-md`}>
          <span className="text-gray-500 text-xs">...</span>
        </div>
      )}
      <img 
        src={imageUrl}
        alt="Logo" 
        className={`${size} rounded-lg object-cover shadow-md ${imageLoading ? 'hidden' : 'block'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

// Mapeo de rutas a identificadores de página
export type ModulePage = 
  | 'dashboard' 
  | 'chat' 
  | 'users-management'
  | 'user-management-module'
  | 'roles-management'
  | 'settings'
  | 'profile';

interface MenuItem {
  id: ModulePage;
  path: string;
  label: string;
  icon: string;
  description: string;
  permission?: string;
  requireAdmin?: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Vista general del sistema'
  },
  {
    id: 'chat',
    path: '/chat',
    label: 'Chat IA',
    icon: '💬',
    description: 'Interactúa con la inteligencia artificial'
  },
  {
    id: 'user-management-module',
    path: '/user-management',
    label: 'Usuarios',
    icon: '👥',
    description: 'Gestión centralizada de usuarios y roles',
    permission: 'users.read'
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Configuración',
    icon: '⚙️',
    description: 'Configuración del sistema',
    requireAdmin: true
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Mi Perfil',
    icon: '👤',
    description: 'Información personal'
  }
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { userProfile, loading } = useAuthProfile();
  const currentUser = adaptUserProfileToUser(userProfile);
  const navigate = useNavigate();
  const { config } = useInterfaceConfig();
  const location = useLocation();

  // Validación defensiva para configuración
  if (!config || !config.logos || !config.logos.sidebarLogo || !config.branding) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-neutral-600">Cargando configuración...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-neutral-600">Cargando aplicación...</span>
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

  // Obtener información de la página actual basada en la URL
  const getCurrentPageInfo = () => {
    const currentItem = MENU_ITEMS.find(item => item.path === location.pathname);
    return currentItem || MENU_ITEMS[0];
  };

  // Función para navegar a una página
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <ConfigSyncMonitor>
      <div className="flex h-screen bg-neutral-50">
      {/* Sidebar Optimizado */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-white shadow-lg border-r border-neutral-200 flex flex-col transition-all duration-300 flex-shrink-0`}>
        
        {/* Header del Sidebar */}
        <div className="p-3 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-2">
                <LogoWithFallback 
                  imageUrl={config?.logos?.sidebarLogo?.imageUrl || config?.logos?.mainLogo?.imageUrl}
                  showImage={config?.logos?.sidebarLogo?.showImage ?? config?.logos?.mainLogo?.showImage ?? false}
                  appName={config?.branding?.appName || 'App'}
                  size="w-8 h-8"
                />
                <div>
                  <h1 className="text-sm font-bold text-neutral-800">
                    {config?.logos?.sidebarLogo?.showText ? config.logos.sidebarLogo.text : config?.branding?.appName}
                  </h1>
                  <p className="text-xs text-neutral-500">{config?.branding?.tagline}</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <LogoWithFallback 
                  imageUrl={config?.logos?.sidebarLogo?.imageUrl || config?.logos?.mainLogo?.imageUrl}
                  showImage={config?.logos?.sidebarLogo?.showImage ?? config?.logos?.mainLogo?.showImage ?? false}
                  appName={config?.branding?.appName || 'App'}
                  size="w-8 h-8"
                  collapsedText={config?.logos?.sidebarLogo?.collapsedText}
                />
              </div>
            )}
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-neutral-600 transition-all duration-200"
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
          {visibleMenuItems.map((item) => {
            const isCurrentPage = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 group ${
                  isCurrentPage
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-lg transform scale-105'
                    : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-700 hover:shadow-sm'
                }`}
                title={sidebarCollapsed ? item.label : item.description}
              >
                <span className={`text-base mr-3 ${sidebarCollapsed ? 'mx-auto' : ''}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${
                      isCurrentPage ? 'text-white' : 'text-neutral-900 group-hover:text-primary-800'
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs truncate ${
                      isCurrentPage ? 'text-primary-100' : 'text-neutral-500 group-hover:text-primary-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                )}
                {!sidebarCollapsed && !isCurrentPage && (
                  <svg className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-colors opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-success-400"></div>
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
        {/* Header Superior */}
        <header className="bg-white border-b border-neutral-200 shadow-sm px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LogoWithFallback 
                imageUrl={config?.logos?.mainLogo?.imageUrl}
                showImage={config?.logos?.mainLogo?.showImage ?? false}
                appName={config?.branding?.appName || 'App'}
                size="w-10 h-10"
              />
              <div>
                <h1 className="text-lg font-bold text-neutral-800">
                  {config?.branding?.appName || 'Aplicación'}
                </h1>
                <p className="text-sm text-neutral-500">{config?.branding?.tagline || ''}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-600">
                Bienvenido, {userProfile?.first_name || 'Usuario'}
              </span>
            </div>
          </div>
        </header>
        
        {/* Área de Contenido */}
        <main className="flex-1 overflow-auto bg-neutral-50">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ConfigSyncMonitor>
  );
};