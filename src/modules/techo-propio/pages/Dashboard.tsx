/**
 * Dashboard Page - Vista principal del módulo Techo Propio
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTechoPropio } from '../context';
import { useTechoPropioApplications } from '../hooks';
import { Card, Button, Modal } from '../components/common';
import { ApplicationCard, StatusBadge, PriorityIndicator, ApplicationManagementTable } from '../components/application';
import { formatCurrency } from '../utils';
import { getApplicantFullName, getApplicantDNI } from '../utils/applicationHelpers';
import { ApplicationStatus } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { applications, statistics, isLoading, fetchApplications, fetchStatistics, refreshApplications } = useTechoPropio();
  const { submitApplication, changeStatus } = useTechoPropioApplications();

  // Estados para modals
  const [submitModal, setSubmitModal] = useState<{ show: boolean; id?: string }>({ show: false });
  const [startReviewModal, setStartReviewModal] = useState<{ show: boolean; id?: string }>({ show: false });
  const [approveModal, setApproveModal] = useState<{ show: boolean; id?: string }>({ show: false });
  const [rejectModal, setRejectModal] = useState<{ show: boolean; id?: string; reason?: string }>({ show: false });
  const [requestInfoModal, setRequestInfoModal] = useState<{ show: boolean; id?: string; comments?: string }>({ show: false });

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

  // Handlers para acciones
  const handleSubmit = async () => {
    if (submitModal.id) {
      const result = await submitApplication(submitModal.id);
      if (result) {
        refreshApplications();
        setSubmitModal({ show: false });
      }
    }
  };

  const handleStartReview = async () => {
    if (startReviewModal.id) {
      const result = await changeStatus(startReviewModal.id, ApplicationStatus.UNDER_REVIEW);
      if (result) {
        refreshApplications();
        setStartReviewModal({ show: false });
      }
    }
  };

  const handleApprove = async () => {
    if (approveModal.id) {
      const result = await changeStatus(approveModal.id, ApplicationStatus.APPROVED);
      if (result) {
        refreshApplications();
        setApproveModal({ show: false });
      }
    }
  };

  const handleReject = async () => {
    if (rejectModal.id && rejectModal.reason) {
      const result = await changeStatus(rejectModal.id, ApplicationStatus.REJECTED, rejectModal.reason);
      if (result) {
        refreshApplications();
        setRejectModal({ show: false, reason: '' });
      }
    }
  };

  const handleRequestInfo = async () => {
    if (requestInfoModal.id && requestInfoModal.comments) {
      const result = await changeStatus(requestInfoModal.id, ApplicationStatus.ADDITIONAL_INFO_REQUIRED, requestInfoModal.comments);
      if (result) {
        refreshApplications();
        setRequestInfoModal({ show: false, comments: '' });
      }
    }
  };

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
                        {getApplicantFullName(app)}
                      </p>
                      <p className="text-sm text-gray-500 truncate">DNI: {getApplicantDNI(app)}</p>
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
                        {getApplicantFullName(app)}
                      </p>
                      <p className="text-sm text-gray-500 truncate">DNI: {getApplicantDNI(app)}</p>
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

      {/* 🆕 NUEVA TARJETA: Gestión de Solicitudes */}
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">🛠️ Gestión de Solicitudes</h3>
            <p className="text-sm text-gray-500">Administra y cambia estados de todas las solicitudes</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {applications.length} solicitudes
          </span>
        </div>

        <ApplicationManagementTable
          applications={applications}
          isLoading={isLoading}
          onView={(id) => navigate(`/techo-propio/ver/${id}`)}
          onEdit={(id) => navigate(`/techo-propio/editar/${id}`)}
          onSubmit={(id) => setSubmitModal({ show: true, id })}
          onStartReview={(id) => setStartReviewModal({ show: true, id })}
          onApprove={(id) => setApproveModal({ show: true, id })}
          onReject={(id) => setRejectModal({ show: true, id, reason: '' })}
          onRequestInfo={(id) => setRequestInfoModal({ show: true, id, comments: '' })}
        />
      </Card>

      {/* Modals de confirmación */}

      {/* Modal: Enviar */}
      <Modal
        isOpen={submitModal.show}
        onClose={() => setSubmitModal({ show: false })}
        title="Enviar Solicitud"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSubmitModal({ show: false })}>Cancelar</Button>
            <Button variant="primary" onClick={handleSubmit}>Enviar</Button>
          </>
        }
      >
        <p>¿Está seguro de enviar esta solicitud para revisión?</p>
      </Modal>

      {/* Modal: Iniciar Revisión */}
      <Modal
        isOpen={startReviewModal.show}
        onClose={() => setStartReviewModal({ show: false })}
        title="Iniciar Revisión"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStartReviewModal({ show: false })}>Cancelar</Button>
            <Button variant="primary" onClick={handleStartReview}>Iniciar Revisión</Button>
          </>
        }
      >
        <p>¿Desea iniciar la revisión de esta solicitud?</p>
        <p className="text-sm text-gray-600 mt-2">La solicitud pasará a estado "En Revisión".</p>
      </Modal>

      {/* Modal: Aprobar */}
      <Modal
        isOpen={approveModal.show}
        onClose={() => setApproveModal({ show: false })}
        title="Aprobar Solicitud"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveModal({ show: false })}>Cancelar</Button>
            <Button variant="primary" onClick={handleApprove}>Aprobar</Button>
          </>
        }
      >
        <p className="text-green-700 font-semibold">✅ ¿Aprobar esta solicitud?</p>
        <p className="text-sm text-gray-600 mt-2">Esta es una acción final. La solicitud será marcada como APROBADA.</p>
      </Modal>

      {/* Modal: Rechazar */}
      <Modal
        isOpen={rejectModal.show}
        onClose={() => setRejectModal({ show: false, reason: '' })}
        title="Rechazar Solicitud"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectModal({ show: false, reason: '' })}>Cancelar</Button>
            <Button variant="danger" onClick={handleReject} disabled={!rejectModal.reason}>Rechazar</Button>
          </>
        }
      >
        <p className="text-red-700 font-semibold">❌ ¿Rechazar esta solicitud?</p>
        <p className="text-sm text-gray-600 mt-2 mb-4">Debe proporcionar una razón para el rechazo:</p>
        <textarea
          value={rejectModal.reason || ''}
          onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
          placeholder="Razón del rechazo..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          rows={4}
        />
      </Modal>

      {/* Modal: Solicitar Información Adicional */}
      <Modal
        isOpen={requestInfoModal.show}
        onClose={() => setRequestInfoModal({ show: false, comments: '' })}
        title="Solicitar Información Adicional"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRequestInfoModal({ show: false, comments: '' })}>Cancelar</Button>
            <Button variant="primary" onClick={handleRequestInfo} disabled={!requestInfoModal.comments}>Solicitar</Button>
          </>
        }
      >
        <p>Indique qué información adicional necesita:</p>
        <textarea
          value={requestInfoModal.comments || ''}
          onChange={(e) => setRequestInfoModal({ ...requestInfoModal, comments: e.target.value })}
          placeholder="Descripción de la información requerida..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-3"
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
