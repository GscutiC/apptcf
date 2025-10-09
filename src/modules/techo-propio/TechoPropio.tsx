/**
 * TechoPropio Module - Main Router Component
 * Configures all routes for the Techo Propio module
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TechoPropioProvider } from './context';
import { ModuleAccessGuard } from './components/common';
import {
  Dashboard,
  ApplicationList,
  ApplicationDetail,
  NewApplication,
  EditApplication
} from './pages';

/**
 * Main Techo Propio module component
 * All routes are relative to /techo-propio
 * Protected by ModuleAccessGuard - users need explicit module access
 */
export const TechoPropio: React.FC = () => {
  return (
    <ModuleAccessGuard>
      <TechoPropioProvider>
        <Routes>
          {/* Dashboard - Landing page */}
          <Route path="/" element={<Dashboard />} />

          {/* Applications CRUD */}
          <Route path="/solicitudes" element={<ApplicationList />} />
          <Route path="/ver/:id" element={<ApplicationDetail />} />
          <Route path="/nueva" element={<NewApplication />} />
          <Route path="/editar/:id" element={<EditApplication />} />

          {/* Redirect old paths for compatibility */}
          <Route path="/dashboard" element={<Navigate to="/techo-propio/" replace />} />
          <Route path="/lista" element={<Navigate to="/techo-propio/solicitudes" replace />} />

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/techo-propio/" replace />} />
        </Routes>
      </TechoPropioProvider>
    </ModuleAccessGuard>
  );
};

export default TechoPropio;
