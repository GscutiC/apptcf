import React, { useState } from 'react';
import { 
  SignInButton, 
  SignUpButton, 
  useUser 
} from '@clerk/clerk-react';
import HelloWorld from './components/HelloWorld';
import AIChat from './components/AIChat';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import { UsersPage } from './modules/user-management/pages/UsersPage';
import { RoleProvider } from './modules/user-management/context/RoleContext';
import { NotificationProvider } from './shared/components/ui/Notifications';
import { Layout, Dashboard, type ModulePage } from './shared/components/layout';

function App() {
  const [currentPage, setCurrentPage] = useState<ModulePage>('dashboard');
  const { user, isSignedIn } = useUser();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'chat':
        return <AIChat />;
      case 'users-legacy':
        return <UserManagement />;
      case 'users-management':
        return <UsersPage />;
      case 'profile':
        return <UserProfile />;
      case 'roles-management':
        return (
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                🚧 Módulo en Desarrollo
              </h2>
              <p className="text-yellow-700">
                La gestión de roles está en desarrollo. Pronto estará disponible.
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                ⚙️ Configuración del Sistema
              </h2>
              <p className="text-blue-700">
                Panel de configuración en desarrollo.
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

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

  // Usuario autenticado - mostrar aplicación completa
  return (
    <NotificationProvider>
      <RoleProvider>
        <div className="min-h-screen bg-gray-50">
          <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
            {renderCurrentPage()}
          </Layout>
        </div>
      </RoleProvider>
    </NotificationProvider>
  );
}

export default App;