import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { apiService, User, CreateUserData } from '../services/apiService';
import UserProfile from './UserProfile';

const UserManagement: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<CreateUserData>({ name: '', email: '' });
  const [activeTab, setActiveTab] = useState<'profile' | 'management'>('profile');

  // Obtener rol del usuario
  const userRole = user?.publicMetadata?.role as string || 'user';
  const isSuperAdmin = userRole === 'super_admin';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const usersData = await apiService.getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error cargando usuarios. Verifica que el backend esté ejecutándose.');
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;

    try {
      setError(null);
      const createdUser = await apiService.createUser(newUser);
      setUsers(prev => [...prev, createdUser]);
      setNewUser({ name: '', email: '' });
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Error creando usuario. Verifica que el email no esté en uso.');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      setError(null);
      await apiService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Error eliminando usuario.');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cargando...</h3>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header con Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {activeTab === 'profile' ? 'Mi Perfil' : 'Gestión de Usuarios'}
                </h1>
                <p className="text-gray-600">
                  {activeTab === 'profile' 
                    ? 'Información de tu cuenta y permisos' 
                    : 'Administra los usuarios del sistema'
                  }
                </p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                👤 Mi Perfil
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab('management')}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                    activeTab === 'management'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  👥 Gestión de Usuarios
                </button>
              )}
            </div>

            {/* Mostrar mensaje si no es super admin */}
            {!isSuperAdmin && activeTab === 'management' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <span className="font-medium">Acceso restringido:</span> Solo los Super Administradores pueden gestionar usuarios.
                </p>
              </div>
            )}
          </div>

          {/* Content based on active tab */}
          {activeTab === 'profile' && <UserProfile />}
          
          {activeTab === 'management' && isSuperAdmin && (
            <>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <p className="text-red-700">{error}</p>
                    <button
                      onClick={loadUsers}
                      className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}

              {/* Create User Button */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Administración</h2>
                    <p className="text-gray-600">Gestiona los usuarios del sistema</p>
                  </div>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>Nuevo Usuario</span>
                  </button>
                </div>
              </div>

              {/* Create User Form */}
              {isCreating && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Nuevo Usuario</h2>
                  <form onSubmit={createUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ej: Juan Pérez"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Ej: juan@ejemplo.com"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <span>✅</span>
                        <span>Crear Usuario</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreating(false);
                          setNewUser({ name: '', email: '' });
                        }}
                        className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Loading State for User List */}
              {isLoading ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando usuarios...</p>
                </div>
              ) : (
                /* Users List */
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Lista de Usuarios ({users.length})
                      </h2>
                      <button
                        onClick={loadUsers}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <span>🔄</span>
                        <span>Actualizar</span>
                      </button>
                    </div>
                  </div>

                  {users.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay usuarios registrados</h3>
                      <p className="text-gray-500 mb-6">Crea el primer usuario para comenzar</p>
                      <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
                      >
                        Crear Primer Usuario
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Usuario
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha de Creación
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {user.created_at ? formatDate(user.created_at) : 'No disponible'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors duration-200 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100"
                                >
                                  🗑️ Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;