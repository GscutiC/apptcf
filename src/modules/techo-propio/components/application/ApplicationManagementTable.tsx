/**
 * ApplicationManagementTable - Tabla completa para gestionar solicitudes
 * Centro de control para cambiar estados y realizar acciones masivas
 */

import React, { useState } from 'react';
import { TechoPropioApplication, ApplicationStatus } from '../../types';
import { StatusBadge, PriorityIndicator } from './';
import { formatDate, formatDNI, STATUS_CONFIG } from '../../utils';
import { 
  getApplicantDNI, 
  getApplicantFullName,
  getApplicantFirstName,
  getApplicantLastName 
} from '../../utils/applicationHelpers';

interface ApplicationManagementTableProps {
  applications: TechoPropioApplication[];
  isLoading?: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onSubmit: (id: string) => void;
  onStartReview: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestInfo: (id: string) => void;
}

export const ApplicationManagementTable: React.FC<ApplicationManagementTableProps> = ({
  applications,
  isLoading,
  onView,
  onEdit,
  onSubmit,
  onStartReview,
  onApprove,
  onReject,
  onRequestInfo
}) => {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar aplicaciones
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = !searchTerm ||
      getApplicantDNI(app).includes(searchTerm) ||
      getApplicantFirstName(app).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getApplicantLastName(app).toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.code.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Renderizar acciones según estado
  const renderActions = (app: TechoPropioApplication) => {
    // Verificar que el ID existe antes de renderizar acciones
    if (!app.id) {
      return (
        <span className="text-xs text-gray-400 italic">Sin ID</span>
      );
    }

    switch (app.status) {
      case ApplicationStatus.DRAFT:
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onSubmit(app.id!)}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Enviar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(app.id!)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onView(app.id!)}
              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
              title="Ver"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        );

      case ApplicationStatus.SUBMITTED:
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onStartReview(app.id!)}
              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
              title="Iniciar Revisión"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={() => onView(app.id!)}
              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
              title="Ver"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        );

      case ApplicationStatus.UNDER_REVIEW:
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onApprove(app.id!)}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Aprobar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={() => onReject(app.id!)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Rechazar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={() => onRequestInfo(app.id!)}
              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
              title="Solicitar Info"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={() => onView(app.id!)}
              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
              title="Ver"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        );

      case ApplicationStatus.ADDITIONAL_INFO_REQUIRED:
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(app.id!)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onView(app.id!)}
              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
              title="Ver"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        );

      default:
        // APPROVED, REJECTED, CANCELLED - Solo ver
        return (
          <button
            onClick={() => onView(app.id!)}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Ver"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por DNI, nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos los estados</option>
          {Object.values(ApplicationStatus).map(status => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-2 text-gray-500">Cargando...</p>
                </td>
              </tr>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 font-mono">
                        {app.code}
                      </span>
                      {app.convocation_code && (
                        <span className="text-xs text-gray-500">
                          {app.convocation_code} - #{app.sequential_number || '-'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {getApplicantFullName(app)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDNI(getApplicantDNI(app))}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PriorityIndicator score={app.priority_score} size="sm" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(app.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {renderActions(app)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No se encontraron solicitudes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info de resultados */}
      <div className="text-sm text-gray-600 text-center">
        Mostrando {filteredApplications.length} de {applications.length} solicitudes
      </div>
    </div>
  );
};

export default ApplicationManagementTable;
