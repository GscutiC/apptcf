import React from 'react';
import { SignOutButton } from '@clerk/clerk-react';
import { useAuthProfile } from '../hooks/useAuthProfile';

const UserProfile: React.FC = () => {
  const { userProfile, loading, error, clerkUser } = useAuthProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!clerkUser) {
    return <div>Usuario no encontrado</div>;
  }
  
  const userRole = userProfile?.role?.name || 'user';
  
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrador';
      case 'cliente':
        return 'Cliente';
      case 'user':
      default:
        return 'Usuario';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cliente':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'user':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            {clerkUser.imageUrl && (
              <img
                src={clerkUser.imageUrl}
                alt={clerkUser.fullName || 'Usuario'}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
            )}
            <div className="text-white">
              <h1 className="text-2xl font-bold">
                {clerkUser.fullName || clerkUser.firstName || 'Usuario'}
              </h1>
              <p className="text-blue-100">
                {clerkUser.primaryEmailAddress?.emailAddress}
              </p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getRoleColor(userRole)}`}>
                {getRoleDisplayName(userRole)}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Información Personal
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-gray-800">
                    {userProfile?.first_name} {userProfile?.last_name} 
                    {!userProfile?.first_name && (clerkUser.fullName || 'No especificado')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">
                    {userProfile?.email || clerkUser.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-gray-800">
                    {clerkUser.primaryPhoneNumber?.phoneNumber || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de Cuenta */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Información de Cuenta
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID de Usuario</label>
                  <p className="text-gray-800 text-sm font-mono">{clerkUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rol</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(userRole)}`}>
                    {getRoleDisplayName(userRole)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Registro</label>
                  <p className="text-gray-800">
                    {userProfile?.created_at 
                      ? new Date(userProfile.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : (clerkUser.createdAt && new Date(clerkUser.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }))
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Permisos por Rol */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Permisos del Rol
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userRole === 'super_admin' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800">Super Administrador</h3>
                  <ul className="text-sm text-red-600 mt-2 space-y-1">
                    <li>• Acceso total al sistema</li>
                    <li>• Gestión de usuarios</li>
                    <li>• Configuración del sistema</li>
                    <li>• Reportes y analíticas</li>
                  </ul>
                </div>
              )}
              
              {userRole === 'cliente' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800">Cliente</h3>
                  <ul className="text-sm text-green-600 mt-2 space-y-1">
                    <li>• Acceso a servicios premium</li>
                    <li>• Chat IA avanzado</li>
                    <li>• Historial completo</li>
                    <li>• Soporte prioritario</li>
                  </ul>
                </div>
              )}
              
              {userRole === 'user' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800">Usuario</h3>
                  <ul className="text-sm text-blue-600 mt-2 space-y-1">
                    <li>• Acceso básico</li>
                    <li>• Chat IA limitado</li>
                    <li>• Perfil personal</li>
                    <li>• Funciones estándar</li>
                  </ul>
                </div>
              )}

              {/* Permisos específicos del backend */}
              {userProfile?.role?.permissions && userProfile.role.permissions.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800">Permisos Específicos</h3>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    {userProfile.role.permissions.map((permission, index) => (
                      <li key={index}>• {permission}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Sign Out */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <SignOutButton>
            <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              Cerrar Sesión
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;