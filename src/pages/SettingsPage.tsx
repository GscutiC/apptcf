/**
 * Página de Configuración del Sistema
 * Ruta: /settings
 * Protegida: Solo administradores
 */

import React from 'react';
import { useProtectedRoute } from '../hooks/useProtectedRoute';

export const SettingsPage: React.FC = () => {
  const { user, userRole, userPermissions, isAdmin } = useProtectedRoute();
  return (
    <div className="p-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-800">
              Configuración del Sistema
            </h1>
            <p className="text-blue-600">
              Panel de administración y configuración
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">🎨 Configuración de Interfaz</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Temas de color personalizados</li>
              <li>• Configuración de idioma</li>
              <li>• Preferencias de visualización</li>
              <li>• Configuración de notificaciones</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">🔧 Configuración del Sistema</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Configuración de base de datos</li>
              <li>• Parámetros de seguridad</li>
              <li>• Configuración de API</li>
              <li>• Logs del sistema</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">📊 Monitoreo</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Estado de servicios</li>
              <li>• Métricas de rendimiento</li>
              <li>• Estadísticas de uso</li>
              <li>• Alertas del sistema</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">🛡️ Seguridad</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Políticas de contraseñas</li>
              <li>• Configuración 2FA</li>
              <li>• Sesiones activas</li>
              <li>• Auditoria de accesos</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-700">
            <strong>🚨 Acceso restringido:</strong> Esta página solo está disponible para administradores del sistema.
          </p>
        </div>
        
        {/* Información del usuario actual */}
        {user && (
          <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">✅ Acceso autorizado</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Usuario:</strong> {user.first_name} {user.last_name}</p>
              <p><strong>Rol:</strong> {userRole}</p>
              <p><strong>Es Admin:</strong> {isAdmin ? 'Sí' : 'No'}</p>
              <p><strong>Permisos:</strong> {userPermissions.length} activos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;