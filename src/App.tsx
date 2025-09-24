import React, { useState } from 'react';
import { 
  SignInButton, 
  SignUpButton, 
  UserButton,
  useUser 
} from '@clerk/clerk-react';
import './styles/App.css';
import HelloWorld from './components/HelloWorld';
import AIChat from './components/AIChat';
import UserManagement from './components/UserManagement';

type ActiveView = 'home' | 'chat' | 'users';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const { user, isSignedIn } = useUser();

  const renderView = () => {
    switch (activeView) {
      case 'chat':
        return <AIChat />;
      case 'users':
        return <UserManagement />;
      default:
        return <HelloWorld />;
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
    <div className="App">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to right, #3b82f6, #9333ea)' }}>
                <span className="text-white font-bold text-sm">MA</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">Mi App Completa</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation Menu */}
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveView('home')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeView === 'home'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🏠 Inicio
                </button>
                <button
                  onClick={() => setActiveView('chat')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeView === 'chat'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  💬 Chat IA
                </button>
                <button
                  onClick={() => setActiveView('users')}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeView === 'users'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👥 Usuarios
                </button>
              </div>
              
              {/* User Button */}
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '64px' }}>
        {renderView()}
      </div>
    </div>
  );
}

export default App;