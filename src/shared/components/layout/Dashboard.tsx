/**
 * Página del Dashboard principal
 */

import React from 'react';
import { useAuthProfile } from '../../../hooks/useAuthProfile';
import { adaptUserProfileToUser } from '../../utils/userAdapter';
import { type ModulePage } from './Layout';

interface DashboardProps {
  onNavigate?: (page: ModulePage) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { userProfile, loading } = useAuthProfile();
  const currentUser = adaptUserProfileToUser(userProfile);

  const handleQuickAccess = (page: ModulePage) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'super_admin';

  return (
    <div className="p-6 space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              ¡Bienvenido, {currentUser?.first_name || 'Usuario'}! 👋
            </h1>
            <p className="text-blue-100">
              {isAdmin 
                ? 'Tienes permisos de administrador. Puedes gestionar usuarios, roles y configuración del sistema.'
                : 'Explora las funcionalidades disponibles según tus permisos.'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Rol actual:</div>
            <div className="text-lg font-semibold">
              {currentUser?.role?.display_name || 'Usuario'}
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 mt-2">
              {currentUser?.role?.permissions.length || 0} permisos
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chat IA Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Chat IA</p>
                <p className="text-2xl font-bold text-blue-900">Disponible</p>
              </div>
            </div>
            <div className="text-blue-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-blue-600">Interactúa con la inteligencia artificial</p>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
              <span className="text-xs text-blue-500 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Gestión Usuarios Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Gestión de Usuarios</p>
                <p className="text-2xl font-bold text-green-900">
                  {currentUser?.role?.permissions.includes('users.read') ? 'Activo' : 'Limitado'}
                </p>
              </div>
            </div>
            <div className="text-green-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600">
              {currentUser?.role?.permissions.includes('users.read') 
                ? 'Administra usuarios del sistema'
                : 'Permisos limitados'
              }
            </p>
            <div className="mt-2 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                currentUser?.role?.permissions.includes('users.read') ? 'bg-green-400' : 'bg-yellow-400'
              }`}></div>
              <span className={`text-xs font-medium ${
                currentUser?.role?.permissions.includes('users.read') ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {currentUser?.role?.permissions.includes('users.read') ? 'Acceso Completo' : 'Acceso Restringido'}
              </span>
            </div>
          </div>
        </div>

        {/* Roles y Permisos Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                <span className="text-2xl">🔐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Roles y Permisos</p>
                <p className="text-2xl font-bold text-purple-900">
                  {isAdmin ? 'Admin' : 'Usuario'}
                </p>
              </div>
            </div>
            <div className="text-purple-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-purple-600">
              {isAdmin ? 'Control total del sistema' : 'Acceso básico'}
            </p>
            <div className="mt-2 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isAdmin ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
              <span className={`text-xs font-medium ${isAdmin ? 'text-purple-500' : 'text-blue-500'}`}>
                {currentUser?.role?.permissions.length || 0} permisos
              </span>
            </div>
          </div>
        </div>

        {/* Configuración Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-700">Configuración</p>
                <p className="text-2xl font-bold text-orange-900">
                  {isAdmin ? 'Completo' : 'Básico'}
                </p>
              </div>
            </div>
            <div className="text-orange-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-orange-600">
              {isAdmin ? 'Configuración avanzada del sistema' : 'Solo perfil personal'}
            </p>
            <div className="mt-2 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isAdmin ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span className={`text-xs font-medium ${isAdmin ? 'text-green-500' : 'text-orange-500'}`}>
                {isAdmin ? 'Acceso Total' : 'Acceso Limitado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Accesos Rápidos</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>Todo funcionando</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Chat IA */}
            <div 
              onClick={() => handleQuickAccess('chat')}
              className="group p-5 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                  <span className="text-2xl">💬</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Chat con IA</h3>
                  <p className="text-sm text-gray-500 group-hover:text-blue-600">Conversa con la inteligencia artificial</p>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Gestión de Usuarios */}
            {currentUser?.role?.permissions.includes('users.read') && (
              <div 
                onClick={() => handleQuickAccess('users-management')}
                className="group p-5 border-2 border-gray-100 rounded-xl hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-700">Gestión de Usuarios</h3>
                    <p className="text-sm text-gray-500 group-hover:text-green-600">Administrar usuarios del sistema</p>
                  </div>
                  <div className="text-gray-400 group-hover:text-green-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Gestión de Roles */}
            {isAdmin && (
              <div 
                onClick={() => handleQuickAccess('roles-management')}
                className="group p-5 border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">Gestión de Roles</h3>
                    <p className="text-sm text-gray-500 group-hover:text-purple-600">Configurar roles y permisos</p>
                  </div>
                  <div className="text-gray-400 group-hover:text-purple-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Mi Perfil */}
            <div 
              onClick={() => handleQuickAccess('profile')}
              className="group p-5 border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white group-hover:from-indigo-600 group-hover:to-indigo-700 transition-all duration-300">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700">Mi Perfil</h3>
                  <p className="text-sm text-gray-500 group-hover:text-indigo-600">Ver y editar información personal</p>
                </div>
                <div className="text-gray-400 group-hover:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sistema Legacy */}
            <div 
              onClick={() => handleQuickAccess('users-legacy')}
              className="group p-5 border-2 border-gray-100 rounded-xl hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-300 transform hover:scale-105 opacity-90"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white group-hover:from-gray-600 group-hover:to-gray-700 transition-all duration-300">
                  <span className="text-2xl">🔄</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">Sistema Legacy</h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600">Acceso al sistema anterior</p>
                </div>
                <div className="text-gray-400 group-hover:text-gray-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Configuración */}
            {isAdmin && (
              <div 
                onClick={() => handleQuickAccess('settings')}
                className="group p-5 border-2 border-gray-100 rounded-xl hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-700">Configuración</h3>
                    <p className="text-sm text-gray-500 group-hover:text-orange-600">Configuración del sistema</p>
                  </div>
                  <div className="text-gray-400 group-hover:text-orange-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Información del Usuario */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white bg-opacity-20">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Información de Sesión</h2>
              <p className="text-gray-300 text-sm">Detalles de tu cuenta y permisos</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Datos Personales */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-800">Datos Personales</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-gray-500 font-medium w-20">Nombre:</span>
                  <span className="text-gray-900 font-semibold flex-1">
                    {currentUser?.full_name || `${currentUser?.first_name} ${currentUser?.last_name}`}
                  </span>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-gray-500 font-medium w-20">Email:</span>
                  <span className="text-gray-900 font-semibold flex-1">{currentUser?.email}</span>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-gray-500 font-medium w-20">ID:</span>
                  <code className="bg-gray-100 px-3 py-1 rounded-md text-sm font-mono text-gray-700 flex-1">
                    {currentUser?.id}
                  </code>
                </div>
              </div>
            </div>

            {/* Permisos y Rol */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <h3 className="text-lg font-semibold text-gray-800">Permisos y Rol</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-gray-500 font-medium w-16">Rol:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 ml-2">
                    {currentUser?.role?.display_name}
                  </span>
                </div>
                
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-gray-500 font-medium w-16">Nivel:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 ml-2">
                    {currentUser?.role?.name}
                  </span>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 font-medium">Permisos:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {currentUser?.role?.permissions.length || 0} activos
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {currentUser?.role?.permissions.map((permission, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Estadísticas de Sesión */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{isAdmin ? 'Admin' : 'User'}</div>
                <div className="text-sm text-blue-500">Tipo de Cuenta</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{currentUser?.role?.permissions.length || 0}</div>
                <div className="text-sm text-green-500">Permisos Activos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">Online</div>
                <div className="text-sm text-purple-500">Estado de Sesión</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};