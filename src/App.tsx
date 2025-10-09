import React, { Suspense } from 'react';
import { useUser } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './modules/user-management/context/RoleContext';
import { NotificationProvider } from './shared/components/ui/Notifications';
import { InterfaceConfigProvider, ConfigLoader } from './modules/interface-config';
import { ConfigDiagnosticWrapper } from './modules/interface-config/components/ConfigDiagnosticWrapper';
import { Layout } from './shared/components/layout';  
import { ProtectedRoute } from './shared/components/guards';
import Loading from './shared/components/ui/Loading';
import LoginPage from './components/LoginPage';

// Lazy loading de páginas para optimizar el rendimiento
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const RolesPage = React.lazy(() => import('./pages/RolesPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const UnauthorizedPage = React.lazy(() => import('./pages/UnauthorizedPage'));
const UserManagementDashboard = React.lazy(() => import('./pages/UserManagementDashboard'));

function App() {
  const { user, isSignedIn } = useUser();

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
    <ConfigDiagnosticWrapper>
      <InterfaceConfigProvider>
        <ConfigLoader>
          <NotificationProvider>
            <RoleProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
            <div className="min-h-screen bg-gray-50">
              <Layout>
              <Suspense fallback={<Loading message="Cargando página..." />}>
                <Routes>
                  {/* Ruta principal - redirige a dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Ruta de acceso denegado */}
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  
                  {/* Rutas básicas - solo requieren autenticación */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <ChatPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                
                {/* Rutas con permisos específicos */}
                <Route 
                  path="/user-management" 
                  element={
                    <ProtectedRoute 
                      requireAuth={true}
                      permission="users.read"
                      unauthorizedRedirect="/unauthorized"
                    >
                      <UserManagementDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute 
                      requireAuth={true}
                      permission="users.read"
                      unauthorizedRedirect="/unauthorized"
                    >
                      <UsersPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Rutas de administrador */}
                <Route 
                  path="/roles" 
                  element={
                    <ProtectedRoute 
                      requireAuth={true}
                      anyRole={["admin", "super_admin"]}
                      unauthorizedRedirect="/unauthorized"
                    >
                      <RolesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute 
                      requireAuth={true}
                      anyRole={["admin", "super_admin"]}
                      unauthorizedRedirect="/unauthorized"
                    >
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
                
                  {/* Ruta 404 - redirige a dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </div>
          </Router>
        </RoleProvider>
      </NotificationProvider>
      </ConfigLoader>
    </InterfaceConfigProvider>
    </ConfigDiagnosticWrapper>
  );
}

export default App;