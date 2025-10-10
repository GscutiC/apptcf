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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Techo Propio</h1>
          <p className="text-gray-600 mt-1">Gestión de solicitudes del programa de vivienda</p>
        </div>
        <Button onClick={() => navigate('/techo-propio/nueva')} size="lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Solicitud
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="md" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Solicitudes</p>
              <p className="text-3xl font-bold text-blue-900">{statistics?.total_applications || 0}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Aprobadas</p>
              <p className="text-3xl font-bold text-green-900">{statistics?.by_status?.[ApplicationStatus.APPROVED] || 0}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">En Proceso</p>
              <p className="text-3xl font-bold text-yellow-900">
                {(statistics?.by_status?.[ApplicationStatus.SUBMITTED] || 0) +
                 (statistics?.by_status?.[ApplicationStatus.UNDER_REVIEW] || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-500 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Promedio Prioridad</p>
              <p className="text-3xl font-bold text-purple-900">{statistics?.average_priority?.toFixed(0) || 0}</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Distribución por Estado */}
      {statistics && (
        <Card title="Distribución por Estado">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(statistics.by_status || {}).map(([status, count]) => (
              <div key={status} className="text-center">
                <StatusBadge status={status as ApplicationStatus} size="md" />
                <p className="mt-2 text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dos columnas: Recientes y Prioritarias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solicitudes Recientes */}
        <Card
          title="Solicitudes Recientes"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/techo-propio/solicitudes')}>
              Ver todas
            </Button>
          }
        >
          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onClick={() => navigate(`/techo-propio/ver/${app.id}`)}
                  showActions={false}
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No hay solicitudes recientes</p>
            )}
          </div>
        </Card>

        {/* Solicitudes Prioritarias */}
        <Card
          title="Solicitudes Prioritarias"
          subtitle="Por orden de prioridad"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/techo-propio/solicitudes')}>
              Ver todas
            </Button>
          }
        >
          <div className="space-y-3">
            {priorityApplications.length > 0 ? (
              priorityApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onClick={() => navigate(`/techo-propio/ver/${app.id}`)}
                  showActions={false}
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No hay solicitudes prioritarias</p>
            )}
          </div>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card title="Accesos Rápidos">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/techo-propio/nueva')}
            className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <svg className="w-12 h-12 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium text-blue-900">Nueva Solicitud</span>
          </button>

          <button
            onClick={() => navigate('/techo-propio/solicitudes')}
            className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <svg className="w-12 h-12 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-medium text-green-900">Ver Todas</span>
          </button>

          <button
            onClick={() => navigate('/techo-propio/estadisticas')}
            className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <svg className="w-12 h-12 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium text-purple-900">Estadísticas</span>
          </button>

          <button
            onClick={() => navigate('/techo-propio/buscar')}
            className="flex flex-col items-center justify-center p-6 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <svg className="w-12 h-12 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-medium text-yellow-900">Buscar</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
