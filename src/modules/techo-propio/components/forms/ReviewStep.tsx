/**
 * ReviewStep - Step 5: Revisión y Envío
 */

import React from 'react';
import { ApplicationFormData } from '../../types';
import { Card } from '../common';
import { formatDate, formatCurrency, formatDNI, formatPhone, formatShortAddress } from '../../utils';
import { CIVIL_STATUS_OPTIONS, GENDER_OPTIONS, FAMILY_RELATIONSHIP_OPTIONS } from '../../utils';

interface ReviewStepProps {
  data: ApplicationFormData;
  onEdit: (step: number) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onEdit }) => {
  const { applicant, household_members, economic_info, property_info, comments } = data;

  const EditButton: React.FC<{ step: number }> = ({ step }) => (
    <button
      onClick={() => onEdit(step)}
      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
    >
      Editar
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Paso 5: Revisión y Envío
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Revise toda la información antes de enviar la solicitud.
        </p>
      </div>

      {/* Datos del Solicitante */}
      <Card title="Datos del Solicitante" actions={<EditButton step={1} />}>
        {applicant && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(applicant.dni || '')}</span></div>
            <div><span className="text-gray-600">Nombre:</span> <span className="font-medium">{applicant.first_name} {applicant.last_name}</span></div>
            <div><span className="text-gray-600">Fecha Nacimiento:</span> <span className="font-medium">{applicant.birth_date ? formatDate(applicant.birth_date) : '-'}</span></div>
            <div><span className="text-gray-600">Género:</span> <span className="font-medium">{GENDER_OPTIONS.find(g => g.value === applicant.gender)?.label || '-'}</span></div>
            <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{CIVIL_STATUS_OPTIONS.find(m => m.value === applicant.marital_status)?.label || '-'}</span></div>
            <div><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{formatPhone(applicant.phone || '')}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Email:</span> <span className="font-medium">{applicant.email}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Dirección:</span> <span className="font-medium">{applicant.current_address?.address}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Ubicación:</span> <span className="font-medium">{applicant.current_address && formatShortAddress(applicant.current_address.district, applicant.current_address.province, applicant.current_address.department)}</span></div>
          </div>
        )}
      </Card>

      {/* Grupo Familiar */}
      <Card title="Grupo Familiar" actions={<EditButton step={2} />}>
        {household_members && household_members.length > 0 ? (
          <div className="space-y-3">
            {household_members.map((member, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{member.first_name} {member.apellido_paterno} {member.apellido_materno}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                  <span>DNI: {formatDNI(member.dni)}</span>
                  <span>Relación: {FAMILY_RELATIONSHIP_OPTIONS.find(r => r.value === member.relationship)?.label}</span>
                  <span>Ocupación: {member.occupation || 'N/A'}</span>
                  <span className="text-green-700 font-medium">{formatCurrency(member.monthly_income || 0)}</span>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t text-right">
              <span className="text-sm font-medium">Total: {household_members.length} miembro(s) | Ingreso: <span className="text-green-700 text-lg">{formatCurrency(household_members.reduce((sum, m) => sum + (m.monthly_income || 0), 0))}</span></span>
            </div>
          </div>
        ) : <p className="text-gray-500">Sin miembros agregados</p>}
      </Card>

      {/* Datos del Predio */}
      <Card title="Datos del Predio" actions={<EditButton step={3} />}>
        {property_info && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">Departamento:</span> <span className="font-medium">{property_info.department || '-'}</span></div>
            <div><span className="text-gray-600">Provincia:</span> <span className="font-medium">{property_info.province || '-'}</span></div>
            <div><span className="text-gray-600">Distrito:</span> <span className="font-medium">{property_info.district || '-'}</span></div>
            <div><span className="text-gray-600">Centro Poblado:</span> <span className="font-medium">{property_info.populated_center || '-'}</span></div>
            <div><span className="text-gray-600">Manzana:</span> <span className="font-medium">{property_info.manzana || '-'}</span></div>
            <div><span className="text-gray-600">Lote:</span> <span className="font-medium">{property_info.lote || '-'}</span></div>
            {property_info.sub_lote && (
              <div><span className="text-gray-600">Sub-Lote:</span> <span className="font-medium">{property_info.sub_lote}</span></div>
            )}
            {property_info.address && (
              <div className="col-span-2"><span className="text-gray-600">Dirección:</span> <span className="font-medium">{property_info.address}</span></div>
            )}
            {property_info.reference && (
              <div className="col-span-2"><span className="text-gray-600">Referencia:</span> <span className="font-medium">{property_info.reference}</span></div>
            )}
            <div className="col-span-2"><span className="text-gray-600">Ubicación:</span> <span className="font-medium">{formatShortAddress(property_info.district || '', property_info.province || '', property_info.department || '')}</span></div>
          </div>
        )}
      </Card>

      {/* Información Económica */}
      <Card title="Información Económica" actions={<EditButton step={4} />}>
        {economic_info && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">Ocupación:</span> <span className="font-medium">{economic_info.occupation}</span></div>
              <div><span className="text-gray-600">Años Experiencia:</span> <span className="font-medium">{economic_info.employment_years} años</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Ingresos</p>
                <p className="text-sm">Principal: {formatCurrency(economic_info.income?.main_income || 0)}</p>
                <p className="text-sm">Adicional: {formatCurrency(economic_info.income?.additional_income || 0)}</p>
                <p className="text-sm font-bold text-green-700 mt-1">Total: {formatCurrency(economic_info.income?.total_income || 0)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Gastos</p>
                <p className="text-sm">Vivienda: {formatCurrency(economic_info.expenses?.housing || 0)}</p>
                <p className="text-sm">Alimentación: {formatCurrency(economic_info.expenses?.food || 0)}</p>
                <p className="text-sm font-bold text-red-700 mt-1">Total: {formatCurrency(economic_info.expenses?.total_expenses || 0)}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-center font-bold">
                Balance: <span className={`text-lg ${((economic_info.income?.total_income || 0) - (economic_info.expenses?.total_expenses || 0)) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency((economic_info.income?.total_income || 0) - (economic_info.expenses?.total_expenses || 0))}
                </span>
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Comentarios */}
      {comments && (
        <Card title="Comentarios Adicionales">
          <p className="text-sm text-gray-700">{comments}</p>
        </Card>
      )}

      {/* Aviso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Antes de enviar, verifique que:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Toda la información sea correcta y esté completa</li>
              <li>Los datos del DNI coincidan con RENIEC</li>
              <li>Las ubicaciones (UBIGEO) sean precisas</li>
              <li>Los montos económicos sean correctos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
