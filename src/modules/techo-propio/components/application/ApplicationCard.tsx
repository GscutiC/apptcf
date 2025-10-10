/**
 * ApplicationCard Component - Display application summary in card format
 */

import React from 'react';
import { TechoPropioApplication } from '../../types';
import { formatDate, formatCurrency, formatShortAddress } from '../../utils';
import { StatusBadge } from './StatusBadge';
import { PriorityIndicator } from './PriorityIndicator';
import { Card } from '../common';

interface ApplicationCardProps {
  application: TechoPropioApplication;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onClick,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const { applicant, property_info, economic_info } = application;

  const actions = showActions ? (
    <div className="flex gap-2">
      {onEdit && (
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
      {onDelete && (
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
    <Card hover onClick={onClick} actions={actions} className="transition-all">
      <div className="space-y-4">
        {/* Header: Code and Status */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {application.code}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {applicant.first_name} {applicant.last_name}
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
            <p className="font-medium text-gray-900">{applicant.dni}</p>
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
              {formatCurrency(economic_info.income.total_income)}
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
