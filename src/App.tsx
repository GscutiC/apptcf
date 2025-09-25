import React, { Suspense } from 'react';
import { 
  SignInButton, 
  SignUpButton, 
  useUser 
} from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './modules/user-management/context/RoleContext';
import { NotificationProvider } from './shared/components/ui/Notifications';
import { InterfaceConfigProvider, ConfigLoader } from './modules/interface-config';
import { Layout } from './shared/components/layout';  
import { ProtectedRoute } from './shared/components/guards';
import Loading from './shared/components/ui/Loading';

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

  // Si no hay usuario autenticado, mostrar página de login
  if (!isSignedIn) {
    return (
      <div className="App">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">MA</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                ¡Bienvenido a Mi App Completa!
              </h1>
              <p className="text-gray-600 mb-8">
                Inicia sesión o regístrate para acceder a todas las funcionalidades de la aplicación.
              </p>
              <div className="space-y-4">
                <SignInButton mode="modal">
                  <button className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                    Iniciar Sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full py-3 px-6 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium">
                    Crear Cuenta
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado - mostrar aplicación completa con Router
  return (
    <InterfaceConfigProvider>
      <ConfigLoader>
        <NotificationProvider>
          <RoleProvider>
            <Router>
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
  );
}

export default App;