import React, { Suspense } from 'react';
import { useUser } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { RoleProvider } from './modules/user-management/context/RoleContext';
import { NotificationProvider } from './shared/components/ui/Notifications';
import { InterfaceConfigProvider, OptimizedConfigLoader } from './modules/interface-config';
import { ConfigDiagnosticWrapper } from './modules/interface-config/components/ConfigDiagnosticWrapper';
import { Layout } from './shared/components/layout';
import { ProtectedRoute } from './shared/components/guards';
import { ErrorBoundary } from './shared/components/ui/ErrorBoundary';
import { usePrefetchCriticalRoutes } from './hooks/useRoutePrefetch';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import Loading from './shared/components/ui/Loading';
import LoginPage from './components/LoginPage';

// ============================================
// LAZY LOADING DE PÁGINAS CON PREFETCH
// ============================================
// Definidos fuera del componente para evitar re-creación en cada render

// Importers - Funciones para prefetch manual
const importDashboard = () => import('./pages/DashboardPage');
const importChat = () => import('./pages/ChatPage');
const importUsers = () => import('./pages/UsersPage');
const importProfile = () => import('./pages/ProfilePage');
const importRoles = () => import('./pages/RolesPage');
const importSettings = () => import('./pages/SettingsPage');
const importUnauthorized = () => import('./pages/UnauthorizedPage');
const importUserManagement = () => import('./pages/UserManagementDashboard');
const importTechoPropio = () => import('./modules/techo-propio').then(m => ({ default: m.TechoPropio }));

// Componentes lazy
const DashboardPage = React.lazy(importDashboard);
const ChatPage = React.lazy(importChat);
const UsersPage = React.lazy(importUsers);
const ProfilePage = React.lazy(importProfile);
const RolesPage = React.lazy(importRoles);
const SettingsPage = React.lazy(importSettings);
const UnauthorizedPage = React.lazy(importUnauthorized);
const UserManagementDashboard = React.lazy(importUserManagement);
const TechoPropio = React.lazy(importTechoPropio);

// ============================================
// LAYOUT WRAPPER MEMOIZADO
// ============================================
// Memoizado para evitar re-renders innecesarios
const LayoutWrapper = React.memo(() => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
});

LayoutWrapper.displayName = 'LayoutWrapper';

function App() {
  const { user, isSignedIn } = useUser();

  // ============================================
  // PREFETCH DE RUTAS CRÍTICAS
  // ============================================
  // Pre-cargar las rutas más usadas cuando la app esté idle
  usePrefetchCriticalRoutes([
    importDashboard,    // Dashboard es la ruta más común
    importProfile,      // Profile es muy accedido
    importTechoPropio,  // Módulo principal de la app
  ]);

  // CRÍTICO: Asegurar que el body sea visible en caso de error
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!document.body.classList.contains('config-loaded')) {
        document.body.classList.add('config-loaded');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Si no hay usuario autenticado, mostrar página de login dinámica
  if (!isSignedIn) {
    return <LoginPage />;
  }

  // Usuario autenticado - mostrar aplicación completa con Router
  return (
    <ErrorBoundary name="App Root">
      {/* Monitor de performance solo en desarrollo */}
      <PerformanceMonitor />
      
      <QueryClientProvider client={queryClient}>
        <ConfigDiagnosticWrapper>
          <InterfaceConfigProvider>
            {/* Router ANTES de ConfigLoader para carga no bloqueante */}
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <OptimizedConfigLoader timeout={1000}>
                <ErrorBoundary name="Providers">
                  <NotificationProvider>
                    <RoleProvider>
                      <div className="min-h-screen bg-gray-50">
                        <Routes>
                      {/* Ruta principal - redirige a dashboard */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      
                      {/* Ruta de acceso denegado */}
                      <Route 
                        path="/unauthorized" 
                        element={
                          <Suspense fallback={<Loading message="Cargando..." />}>
                            <UnauthorizedPage />
                          </Suspense>
                        } 
                      />

                      {/* ========================================
                          MÓDULO TECHO PROPIO - LAYOUT INDEPENDIENTE
                          ======================================== */}
                      <Route
                        path="/techo-propio/*"
                        element={
                          <ErrorBoundary name="Módulo Techo Propio">
                            <Suspense fallback={<Loading message="Cargando Techo Propio..." />}>
                              <ProtectedRoute requireAuth={true}>
                                <TechoPropio />
                              </ProtectedRoute>
                            </Suspense>
                          </ErrorBoundary>
                        }
                      />                      {/* ========================================
                          RUTAS CON LAYOUT PRINCIPAL
                          ======================================== */}
                      <Route element={<LayoutWrapper />}>
                        {/* Rutas básicas - solo requieren autenticación */}
                        <Route 
                          path="/dashboard"
                          element={
                            <Suspense fallback={<Loading message="Cargando dashboard..." />}>
                              <ProtectedRoute requireAuth={true}>
                                <DashboardPage />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path="/chat" 
                          element={
                            <Suspense fallback={<Loading message="Cargando chat..." />}>
                              <ProtectedRoute requireAuth={true}>
                                <ChatPage />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path="/profile" 
                          element={
                            <Suspense fallback={<Loading message="Cargando perfil..." />}>
                              <ProtectedRoute requireAuth={true}>
                                <ProfilePage />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />

                        {/* Rutas con permisos específicos */}
                        <Route 
                          path="/user-management"
                          element={
                            <Suspense fallback={<Loading message="Cargando gestión de usuarios..." />}>
                              <ProtectedRoute
                                requireAuth={true}
                                permission="users.read"
                                unauthorizedRedirect="/unauthorized"
                              >
                                <UserManagementDashboard />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path="/users" 
                          element={
                            <Suspense fallback={<Loading message="Cargando usuarios..." />}>
                              <ProtectedRoute
                                requireAuth={true}
                                permission="users.read"
                                unauthorizedRedirect="/unauthorized"
                              >
                                <UsersPage />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />

                        {/* Rutas de administrador */}
                        <Route
                          path="/roles"
                          element={
                            <Suspense fallback={<Loading message="Cargando roles..." />}>
                              <ProtectedRoute
                                requireAuth={true}
                                anyRole={["admin", "super_admin"]}
                                unauthorizedRedirect="/unauthorized"
                              >
                                <RolesPage />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <Suspense fallback={<Loading message="Cargando configuración..." />}>
                              <ProtectedRoute
                                requireAuth={true}
                                anyRole={["admin", "super_admin"]}
                                unauthorizedRedirect="/unauthorized"
                              >
                                <SettingsPage />
                              </ProtectedRoute>
                            </Suspense>
                          }
                        />

                        {/* Ruta 404 - redirige a dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Route>
                      </Routes>
                    </div>
                    </RoleProvider>
                  </NotificationProvider>
                </ErrorBoundary>
              </OptimizedConfigLoader>
            </Router>
          </InterfaceConfigProvider>
        </ConfigDiagnosticWrapper>
        {/* React Query Devtools - solo visible en desarrollo */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;