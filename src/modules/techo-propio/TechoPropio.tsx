/**
 * TechoPropio Module - Main Router Component
 * Configures all routes for the Techo Propio module
 * Uses independent layout (TechoPropioLayout) separate from main app layout
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TechoPropioProvider } from './context';
import { ModuleAccessGuard } from './components/common';
import { TechoPropioLayout } from './components/layout';
import {
  Dashboard,
  ApplicationList,
  ApplicationDetail,
  NewApplication,
  EditApplication
} from './pages';
import { ConvocationManagement } from './components';

/**
 * Main Techo Propio module component
 * All routes are relative to /techo-propio
 * Protected by ModuleAccessGuard - users need explicit module access
 * Uses TechoPropioLayout for independent sidebar and header
 */
export const TechoPropio: React.FC = () => {
  return (
    <ModuleAccessGuard>
      <TechoPropioProvider>
        <TechoPropioLayout>
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

            {/* Redirect old paths for compatibility */}
            <Route path="/dashboard" element={<Navigate to="/techo-propio/" replace />} />
            <Route path="/lista" element={<Navigate to="/techo-propio/solicitudes" replace />} />

            {/* 404 - Redirect to dashboard */}
            <Route path="*" element={<Navigate to="/techo-propio/" replace />} />
          </Routes>
        </TechoPropioLayout>
      </TechoPropioProvider>
    </ModuleAccessGuard>
  );
};

export default TechoPropio;
