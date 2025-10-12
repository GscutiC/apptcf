/**
 * Dashboard Page - Vista principal del módulo Techo Propio
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTechoPropio } from '../context';
import { Card, Button } from '../components/common';
import { ApplicationCard, StatusBadge, PriorityIndicator } from '../components/application';
import { formatCurrency } from '../utils';
import { ApplicationStatus } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { applications, statistics, isLoading, fetchApplications, fetchStatistics } = useTechoPropio();

  useEffect(() => {
    fetchApplications();
    fetchStatistics();
  }, []);

  // Solicitudes recientes (últimas 5)
  const recentApplications = applications.slice(0, 5);

  // Solicitudes prioritarias (top 5)
  const priorityApplications = [...applications]
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón de acción rápida - Móvil */}
      <div className="lg:hidden">
        <Button onClick={() => navigate('/techo-propio/nueva')} size="lg" className="w-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Solicitud
        </Button>
      </div>

      {/* Distribución por Estado - Compacta */}
      {statistics && (
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Distribución por Estado</h3>
            <span className="text-sm text-gray-500">{statistics.total_applications || 0} solicitudes totales</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(statistics.by_status || {}).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <StatusBadge status={status as ApplicationStatus} size="sm" />
                <p className="mt-2 text-xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dos columnas: Recientes y Prioritarias */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Solicitudes Recientes */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Solicitudes Recientes</h3>
              <p className="text-sm text-gray-500">Últimas actualizaciones</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/techo-propio/solicitudes')}>
              Ver todas →
            </Button>
          </div>
          <div className="space-y-2">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/techo-propio/ver/${app.id}`)}
                  className="p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-700">
                        {app.applicant.first_name} {app.applicant.last_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">DNI: {app.applicant.dni}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <StatusBadge status={app.status} size="sm" />
                      {app.priority_score > 70 && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                          Alta prioridad
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No hay solicitudes recientes</p>
            )}
          </div>
        </Card>

        {/* Solicitudes Prioritarias */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Solicitudes Prioritarias</h3>
              <p className="text-sm text-gray-500">Requieren atención inmediata</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/techo-propio/solicitudes')}>
              Ver todas →
            </Button>
          </div>
          <div className="space-y-2">
            {priorityApplications.length > 0 ? (
              priorityApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/techo-propio/ver/${app.id}`)}
                  className="p-3 bg-gray-50 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-red-700">
                        {app.applicant.first_name} {app.applicant.last_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">DNI: {app.applicant.dni}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-semibold text-red-700">{app.priority_score}</span>
                      </div>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No hay solicitudes prioritarias</p>
            )}
          </div>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card className="hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/techo-propio/nueva')}
            className="group flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-200 hover:border-blue-300 hover:shadow-sm"
          >
            <div className="p-3 bg-blue-500 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-900 text-center">Nueva Solicitud</span>
          </button>

          <button
            onClick={() => navigate('/techo-propio/solicitudes')}
            className="group flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-all border border-green-200 hover:border-green-300 hover:shadow-sm"
          >
            <div className="p-3 bg-green-500 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-900 text-center">Ver Todas</span>
          </button>

          <button
            onClick={() => navigate('/techo-propio/estadisticas')}
            className="group flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all border border-purple-200 hover:border-purple-300 hover:shadow-sm"
          >
            <div className="p-3 bg-purple-500 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-purple-900 text-center">Estadísticas</span>
          </button>

          <button
            onClick={() => navigate('/techo-propio/buscar')}
            className="group flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all border border-yellow-200 hover:border-yellow-300 hover:shadow-sm"
          >
            <div className="p-3 bg-yellow-500 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-yellow-900 text-center">Buscar</span>
          </button>

          <button
            onClick={() => navigate('/techo-propio/convocatorias')}
            className="group flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all border border-orange-200 hover:border-orange-300 hover:shadow-sm"
          >
            <div className="p-3 bg-orange-500 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-orange-900 text-center">Convocatorias</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
