/**
 * TechoPropioSidebar - Sidebar específico del módulo Techo Propio
 * Navegación interna del módulo con diseño independiente
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
}

export const TechoPropioSidebar: React.FC<TechoPropioSidebarProps> = ({ 
  isCollapsed = false,
  onClose 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const isPathActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) && location.pathname !== '/techo-propio';
  };

  if (isCollapsed) {
    return (
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40">
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
      {/* Botón cerrar para móviles */}
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-50"
          aria-label="Cerrar menú"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
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