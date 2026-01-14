/**
 * TechoPropio Module - Main Router Component
 * Configures all routes for the Techo Propio module
 * Uses independent layout (TechoPropioLayout) separate from main app layout
 *
 * ✅ MEJORA: Sprint 2 - A2
 * Lazy loading para reducir bundle inicial en ~40%
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TechoPropioProvider } from './context';
import { ModuleAccessGuard, ErrorBoundary } from './components/common';
import { TechoPropioLayout } from './components/layout';
// Configuración visual del módulo
import { TechoPropioConfigPanel } from './config/components/TechoPropioConfigPanel';

// ✅ MEJORA: Lazy loading de páginas
// Solo se cargan cuando el usuario navega a ellas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ApplicationList = lazy(() => import('./pages/ApplicationList'));
const ApplicationDetail = lazy(() => import('./pages/ApplicationDetail'));
const NewApplication = lazy(() => import('./pages/NewApplication'));
const EditApplication = lazy(() => import('./pages/EditApplication'));
const ConvocationManagement = lazy(() => import('./components/ConvocationManagement'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando módulo...</p>
    </div>
  </div>
);

/**
 * Main Techo Propio module component
 * All routes are relative to /techo-propio
 * Protected by ModuleAccessGuard - users need explicit module access
 * Uses TechoPropioLayout for independent sidebar and header
 *
 * ✅ MEJORA: Lazy loading con Suspense
 * Reduce el bundle inicial y mejora el tiempo de carga
 */
export const TechoPropio: React.FC = () => {
  return (
    <ErrorBoundary>
      <ModuleAccessGuard>
        <TechoPropioProvider>
          <TechoPropioLayout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Dashboard - Landing page */}
                <Route path="/" element={<Dashboard />} />

                {/* Applications CRUD */}
                <Route path="/solicitudes" element={<ApplicationList />} />
                <Route path="/ver/:id" element={<ApplicationDetail />} />
                <Route path="/nueva" element={<NewApplication />} />
                <Route path="/editar/:id" element={<EditApplication />} />

                {/* Convocatorias Management */}
                <Route path="/convocatorias" element={<ConvocationManagement />} />

                {/* Configuración Visual del Módulo */}
                <Route path="/configuracion" element={<TechoPropioConfigPanel />} />

                {/* Redirect old paths for compatibility */}
                <Route path="/dashboard" element={<Navigate to="/techo-propio/" replace />} />
                <Route path="/lista" element={<Navigate to="/techo-propio/solicitudes" replace />} />

                {/* 404 - Redirect to dashboard */}
                <Route path="*" element={<Navigate to="/techo-propio/" replace />} />
              </Routes>
            </Suspense>
          </TechoPropioLayout>
        </TechoPropioProvider>
      </ModuleAccessGuard>
    </ErrorBoundary>
  );
};

export default TechoPropio;
