/**
 * TechoPropioSidebar - Sidebar específico del módulo Techo Propio
 * Navegación interna del módulo con diseño independiente
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useAuthProfile } from '../../../../hooks/useAuthProfile';
import { adaptUserProfileToUser } from '../../../../shared/utils/userAdapter';
import { MODULE_CONFIG } from '../../config/moduleConfig';

interface SidebarItemProps {
  icon: string;
  label: string;
  path: string;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, path, isActive, badge, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
        }
      `}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium flex-1 text-left text-sm">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`
          px-1.5 py-0.5 rounded-full text-xs font-bold
          ${isActive ? 'bg-white text-green-600' : 'bg-green-100 text-green-600'}
        `}>
          {badge}
        </span>
      )}
    </button>
  );
};

interface TechoPropioSidebarProps {
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export const TechoPropioSidebar: React.FC<TechoPropioSidebarProps> = ({ 
  isCollapsed = false,
  onClose,
  onToggle
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuthProfile();
  const currentUser = adaptUserProfileToUser(userProfile);
  const [searchQuery, setSearchQuery] = useState('');

  // Navegación items
  const navigationItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      path: '/techo-propio',
      exact: true,
    },
    {
      icon: '📋',
      label: 'Solicitudes',
      path: '/techo-propio/solicitudes',
    },
    {
      icon: '➕',
      label: 'Nueva Solicitud',
      path: '/techo-propio/nueva',
    },
    {
      icon: '📢',
      label: 'Convocatorias',
      path: '/techo-propio/convocatorias',
    },
    {
      icon: '📈',
      label: 'Estadísticas',
      path: '/techo-propio/estadisticas',
    },
    {
      icon: '🔍',
      label: 'Búsqueda Avanzada',
      path: '/techo-propio/buscar',
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/techo-propio/buscar?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isPathActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) && location.pathname !== '/techo-propio';
  };

  if (isCollapsed) {
    return (
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40">
        {/* Botón expandir */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="absolute top-3 right-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-50"
            title="Expandir sidebar"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Logo colapsado */}
        <div className="p-4 border-b border-gray-200">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🏠</span>
          </div>
        </div>

        {/* Items colapsados */}
        <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`
                w-full p-3 rounded-lg transition-all duration-200 flex items-center justify-center
                ${isPathActive(item.path, item.exact)
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-green-600'
                }
              `}
              title={item.label}
            >
              <span className="text-2xl">{item.icon}</span>
            </button>
          ))}
        </nav>

        {/* Botón volver colapsado */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleBackToDashboard}
            className="w-full p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200 flex items-center justify-center"
            title="Volver al Dashboard Principal"
          >
            <span className="text-2xl">🏠</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-lg lg:translate-x-0">
      {/* Botones de control */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-50">
        {/* Botón toggle para desktop */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Contraer sidebar"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Botón cerrar para móviles */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Header del módulo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-2xl">🏠</span>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900">Techo Propio</h2>
            <p className="text-[10px] text-gray-500">Gestión de Solicitudes</p>
          </div>
        </div>
        
        {/* Stats rápidos */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-blue-50 rounded-md p-1.5 text-center">
            <div className="text-[10px] text-blue-600 font-medium">Total</div>
            <div className="text-base font-bold text-blue-900">0</div>
          </div>
          <div className="bg-green-50 rounded-md p-1.5 text-center">
            <div className="text-[10px] text-green-600 font-medium">Activas</div>
            <div className="text-base font-bold text-green-900">0</div>
          </div>
        </div>
      </div>

      {/* Usuario */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <UserButton afterSignOutUrl="/sign-in" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {currentUser?.first_name || 'Usuario'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {currentUser?.role?.display_name || 'Rol'}
            </div>
          </div>
          {/* Notificaciones */}
          <button
            className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Notificaciones"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Búsqueda rápida */}
      <div className="p-3 border-b border-gray-200">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Buscar solicitud..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
          Navegación Principal
        </div>
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={isPathActive(item.path, item.exact)}
            onClick={() => handleNavigate(item.path)}
          />
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div className="p-3 border-t border-gray-200 space-y-1.5">
        {/* Botón volver al dashboard principal */}
        <button
          onClick={handleBackToDashboard}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200 border border-gray-200"
        >
          <span className="text-lg">🏠</span>
          <span className="font-medium flex-1 text-left text-xs">Dashboard Principal</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Versión del módulo */}
        <div className="text-center text-[10px] text-gray-400">
          v1.0.0
        </div>
      </div>
    </div>
  );
};

export default TechoPropioSidebar;