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
  // 🐛 DEBUG: Ver qué datos están llegando al componente
  React.useEffect(() => {
    console.log('📋 ReviewStep - data:', data);
    console.log('👤 user_data:', data.user_data);
    console.log('👨‍👩‍👧‍👦 head_of_family:', data.head_of_family);
    console.log('💑 spouse:', data.spouse);
    console.log('👥 household_members:', data.household_members);
    console.log('🏠 property_info:', data.property_info);
  }, [data]);

  const { user_data, head_of_family, spouse, household_members, property_info, comments } = data;

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

      {/* Datos del Usuario (Control Interno) */}
      <Card title="Datos del Usuario (Control Interno)" actions={<EditButton step={1} />}>
        {user_data && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(user_data.dni || '')}</span></div>
            <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{user_data.names}</span></div>
            <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{user_data.surnames}</span></div>
            <div><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{formatPhone(user_data.phone || '')}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Email:</span> <span className="font-medium">{user_data.email}</span></div>
            {user_data.notes && (
              <div className="col-span-2"><span className="text-gray-600">Notas:</span> <span className="font-medium">{user_data.notes}</span></div>
            )}
          </div>
        )}
      </Card>

      {/* Jefe de Familia */}
      <Card title="Jefe de Familia" actions={<EditButton step={2} />}>
        {head_of_family && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(head_of_family.dni || head_of_family.document_number || '')}</span></div>
            <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{head_of_family.first_name}</span></div>
            <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{head_of_family.paternal_surname} {head_of_family.maternal_surname}</span></div>
            <div><span className="text-gray-600">Fecha Nacimiento:</span> <span className="font-medium">{head_of_family.birth_date ? formatDate(head_of_family.birth_date) : '-'}</span></div>
            <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{CIVIL_STATUS_OPTIONS.find(m => m.value === head_of_family.civil_status)?.label || '-'}</span></div>
            <div><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{formatPhone(head_of_family.phone_number || '')}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Email:</span> <span className="font-medium">{head_of_family.email}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Ocupación:</span> <span className="font-medium">{head_of_family.occupation}</span></div>
          </div>
        )}
      </Card>

      {/* Cónyuge */}
      {spouse && (
        <Card title="Cónyuge/Conviviente" actions={<EditButton step={2} />}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(spouse.dni || spouse.document_number || '')}</span></div>
            <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{spouse.first_name}</span></div>
            <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{spouse.paternal_surname} {spouse.maternal_surname}</span></div>
            <div><span className="text-gray-600">Fecha Nacimiento:</span> <span className="font-medium">{spouse.birth_date ? formatDate(spouse.birth_date) : '-'}</span></div>
            <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{CIVIL_STATUS_OPTIONS.find(m => m.value === spouse.civil_status)?.label || '-'}</span></div>
            <div><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{formatPhone(spouse.phone_number || '')}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Email:</span> <span className="font-medium">{spouse.email}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Ocupación:</span> <span className="font-medium">{spouse.occupation}</span></div>
          </div>
        </Card>
      )}

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
      <Card title="Datos del Predio" actions={<EditButton step={4} />}>
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
