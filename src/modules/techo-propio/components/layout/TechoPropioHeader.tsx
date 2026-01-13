/**
 * TechoPropioHeader - Header específico del módulo Techo Propio
 * Incluye breadcrumbs, búsqueda rápida y acciones
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useAuthContext } from '../../../../context/AuthContext';
import { adaptUserProfileToUser } from '../../../../shared/utils/userAdapter';
import { useTechoPropioConfigContext } from '../../config/context/TechoPropioConfigContext';
import { getLogoToDisplay } from '../../config/types/config.types';

interface Breadcrumb {
  label: string;
  path?: string;
  icon?: string;
}

interface TechoPropioHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const TechoPropioHeader: React.FC<TechoPropioHeaderProps> = ({
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuthContext();
  const currentUser = adaptUserProfileToUser(userProfile);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Obtener configuración personalizada
  const { config } = useTechoPropioConfigContext();

  // Obtener logo del header (getLogoToDisplay ahora maneja valores null/undefined)
  const headerLogoDisplay = getLogoToDisplay(config?.logos, 'header');

  // Generar breadcrumbs basado en la ruta actual
  const getBreadcrumbs = (): Breadcrumb[] => {
    const path = location.pathname;
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Dashboard Principal', path: '/dashboard', icon: '🏠' },
      { label: 'Techo Propio', path: '/techo-propio', icon: '🏠' },
    ];

    if (path === '/techo-propio') {
      breadcrumbs.push({ label: 'Dashboard' });
    } else if (path.includes('/solicitudes')) {
      breadcrumbs.push({ label: 'Solicitudes', icon: '📋' });
    } else if (path.includes('/nueva')) {
      breadcrumbs.push({ label: 'Nueva Solicitud', icon: '➕' });
    } else if (path.includes('/editar')) {
      breadcrumbs.push({ label: 'Editar Solicitud', icon: '✏️' });
    } else if (path.includes('/ver/')) {
      breadcrumbs.push({ label: 'Ver Solicitud', icon: '👁️' });
    } else if (path.includes('/convocatorias')) {
      breadcrumbs.push({ label: 'Convocatorias', icon: '📢' });
    } else if (path.includes('/estadisticas')) {
      breadcrumbs.push({ label: 'Estadísticas', icon: '📈' });
    } else if (path.includes('/buscar')) {
      breadcrumbs.push({ label: 'Búsqueda Avanzada', icon: '🔍' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/techo-propio/buscar?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left section: Menu toggle + Logo + Breadcrumbs */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Toggle sidebar button */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={isSidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo del Header (si está configurado) - Botón para regresar al Dashboard Principal */}
            {headerLogoDisplay && headerLogoDisplay.value && (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center px-3 py-2 border-r border-gray-200 hover:bg-gray-50 rounded-lg transition-colors group"
                title="Regresar al Dashboard Principal"
              >
                {headerLogoDisplay.type === 'image' ? (
                  <img
                    src={headerLogoDisplay.value}
                    alt="Logo - Regresar al Dashboard"
                    className="h-8 w-auto object-contain transition-transform group-hover:scale-110"
                    onError={(e) => {
                      // Hide on error
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl transition-transform group-hover:scale-110">
                    {headerLogoDisplay.value}
                  </span>
                )}
              </button>
            )}

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 overflow-x-auto" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {crumb.path ? (
                    <button
                      onClick={() => navigate(crumb.path!)}
                      className="flex items-center gap-1 text-sm text-gray-600 transition-colors whitespace-nowrap"
                      style={{ ['--hover-color' as any]: 'var(--tp-primary, #16a34a)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--tp-primary, #16a34a)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >
                      {crumb.icon && <span>{crumb.icon}</span>}
                      <span>{crumb.label}</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {crumb.icon && <span>{crumb.icon}</span>}
                      <span>{crumb.label}</span>
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right section: Search + Actions + User */}
          <div className="flex items-center gap-3">
            {/* Búsqueda rápida */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar solicitud..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                  style={{
                    ['--tw-ring-color' as any]: 'var(--tp-primary, #16a34a)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px var(--tp-primary, #16a34a)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Botón Nueva Solicitud */}
            <button
              onClick={() => navigate('/techo-propio/nueva')}
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
              style={{
                background: 'linear-gradient(to right, var(--tp-primary, #16a34a), var(--tp-secondary, #2563eb))'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nueva Solicitud</span>
            </button>

            {/* Notificaciones */}
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Notificaciones"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Badge de notificaciones pendientes */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Usuario */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.first_name || 'Usuario'}
                </div>
                <div className="text-xs text-gray-500">
                  {currentUser?.role?.display_name || 'Rol'}
                </div>
              </div>
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TechoPropioHeader;