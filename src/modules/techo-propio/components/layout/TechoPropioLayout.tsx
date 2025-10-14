/**
 * TechoPropioLayout - Layout independiente para el módulo Techo Propio
 * Incluye sidebar y header específicos del módulo
 *
 * Este layout reemplaza completamente el layout principal cuando
 * el usuario navega dentro del módulo Techo Propio
 */

import React, { useState, useEffect } from 'react';
import { TechoPropioSidebar } from './TechoPropioSidebar';
import { TechoPropioHeader } from './TechoPropioHeader';
import { TechoPropioConfigProvider } from '../../config/context/TechoPropioConfigContext';

interface TechoPropioLayoutProps {
  children: React.ReactNode;
}

export const TechoPropioLayout: React.FC<TechoPropioLayoutProps> = ({ children }) => {
  // Cargar el estado del sidebar desde localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('techopropio_sidebar_collapsed');
    return saved === 'true';
  });

  // Estado para móviles - sidebar abierto/cerrado
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Guardar el estado en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('techopropio_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    // En móviles, toggle el menú móvil
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      // En desktop, toggle collapse
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <TechoPropioConfigProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Overlay para móviles */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Sidebar del módulo - Desktop */}
        <div className="hidden lg:block">
          <TechoPropioSidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>

        {/* Sidebar del módulo - Móvil */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <TechoPropioSidebar
            isCollapsed={false}
            onClose={closeMobileSidebar}
            onToggle={toggleSidebar}
          />
        </div>

        {/* Contenido principal */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-56'
          }`}
        >
          {/* Área de contenido scrolleable */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="h-full px-4 py-4">
              {children}
            </div>
          </main>

          {/* Footer opcional */}
          <footer className="bg-white border-t border-gray-200 py-3 px-4 lg:py-4 lg:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2 sm:gap-4">
                <span>© 2025 Techo Propio</span>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="hidden sm:inline">Sistema de Gestión de Solicitudes</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <button className="hover:text-green-600 transition-colors">
                  📖 Ayuda
                </button>
                <button className="hover:text-green-600 transition-colors">
                  💬 Soporte
                </button>
                <button className="hidden sm:inline hover:text-green-600 transition-colors">
                  📋 Documentación
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </TechoPropioConfigProvider>
  );
};

export default TechoPropioLayout;