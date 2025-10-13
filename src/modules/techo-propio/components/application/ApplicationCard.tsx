/**
 * ApplicationCard Component - Display application summary in card format
 */

import React from 'react';
import { TechoPropioApplication, ApplicationStatus } from '../../types';
import { formatDate, formatCurrency, formatShortAddress } from '../../utils';
import { 
  getApplicantFullName, 
  getApplicantDNI, 
  getTotalIncome,
  hasRequiredApplicantData 
} from '../../utils/applicationHelpers';
import { StatusBadge } from './StatusBadge';
import { PriorityIndicator } from './PriorityIndicator';
import { Card } from '../common';

interface ApplicationCardProps {
  application: TechoPropioApplication;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  showActions?: boolean;
  isLoading?: boolean; // ✅ Nuevo prop para estado de carga
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onClick,
  onEdit,
  onDelete,
  onSubmit,
  showActions = true,
  isLoading = false
}) => {
  const { property_info } = application;

  // ✅ CORREGIDO: Verificar que la aplicación tenga datos mínimos requeridos
  if (!hasRequiredApplicantData(application)) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">
          <p>⚠️ Datos de solicitante incompletos</p>
          <p className="text-sm">ID: {application.id}</p>
        </div>
      </Card>
    );
  }

  // Determinar si se puede enviar (debe estar en DRAFT)
  const canSubmit = application.status === ApplicationStatus.DRAFT && onSubmit;

  // Determinar si se puede editar (solo DRAFT y ADDITIONAL_INFO_REQUIRED)
  const canEdit = onEdit && (
    application.status === ApplicationStatus.DRAFT ||
    application.status === ApplicationStatus.ADDITIONAL_INFO_REQUIRED
  );

  // Determinar si se puede eliminar (solo DRAFT)
  const canDelete = onDelete && application.status === ApplicationStatus.DRAFT;

  const actions = showActions ? (
    <div className="flex gap-2">
      {canSubmit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSubmit();
          }}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Enviar Solicitud"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      )}
      {canEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  ) : undefined;

  return (
    <Card hover onClick={onClick} actions={actions} className="transition-all relative">
      {/* ✅ Indicador de carga visual */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Actualizando...</span>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Header: Code and Status */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {application.code}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {getApplicantFullName(application)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={application.status} size="sm" />
            <PriorityIndicator score={application.priority_score} size="sm" />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">DNI</p>
            <p className="font-medium text-gray-900">{getApplicantDNI(application)}</p>
          </div>

          <div>
            <p className="text-gray-500">Ubicación</p>
            <p className="font-medium text-gray-900">
              {formatShortAddress(
                property_info.district || '',
                property_info.province || '',
                property_info.department || ''
              )}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Ingreso Familiar</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(getTotalIncome(application))}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Tamaño del Hogar</p>
            <p className="font-medium text-gray-900">
              {application.household_size} {application.household_size === 1 ? 'persona' : 'personas'}
            </p>
          </div>
        </div>

        {/* Footer: Dates */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Creada: {formatDate(application.created_at)}</span>
          <span>Actualizada: {formatDate(application.updated_at)}</span>
        </div>
      </div>
    </Card>
  );
};

export default ApplicationCard;
