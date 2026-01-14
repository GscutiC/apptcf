/**
 * ReviewStep - Step 5: Revisión y Envío
 */

import React from 'react';
import { ApplicationFormData } from '../../types';
import { Card } from '../common';
import { formatDate, formatCurrency, formatDNI, formatPhone, formatShortAddress } from '../../utils';
import {
  CIVIL_STATUS_OPTIONS,
  GENDER_OPTIONS,
  FAMILY_RELATIONSHIP_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  DISABILITY_TYPE_OPTIONS
} from '../../utils';
import { formatDisabilityWithCharacteristics } from '../../utils/pdfFieldMapping';
import { DisabilityType } from '../../types';

interface ReviewStepProps {
  data: ApplicationFormData;
  onEdit: (step: number) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onEdit }) => {
  const { user_data, head_of_family, spouse, household_members, property_info, comments, head_of_family_economic } = data;

  // Verificar si el jefe de familia ya está en household_members
  const headOfFamilyInHousehold = household_members?.find(m => 
    m.member_type?.toString().includes('HEAD') || 
    m.member_type?.toString() === 'JEFE_FAMILIA' ||
    String(m.relationship) === 'jefe' ||
    String(m.family_bond).includes('Jefe')
  );

  // Construir array completo de miembros
  let allMembers = household_members || [];
  
  if (!headOfFamilyInHousehold && head_of_family) {
    // Construir el jefe de familia manualmente si no está ya en household_members
    const headMember: any = {
      id: 'temp-head',
      member_type: 'HEAD_OF_FAMILY',
      dni: head_of_family.document_number || head_of_family.dni || '',
      first_name: head_of_family.first_name || '',
      apellido_paterno: head_of_family.paternal_surname || '',
      apellido_materno: head_of_family.maternal_surname || '',
      birth_date: head_of_family.birth_date || '',
      marital_status: head_of_family.civil_status || '',
      phone_number: head_of_family.phone_number || '',
      email: head_of_family.email || '',
      education_level: head_of_family.education_level || '',
      occupation: head_of_family_economic?.occupation_detail || head_of_family.occupation || '',
      employment_situation: head_of_family_economic?.employment_situation || '',
      work_condition: head_of_family_economic?.work_condition || '',
      monthly_income: head_of_family_economic?.monthly_income || 0,
      disability_type: head_of_family.disability_type || 'Ninguna',
      relationship: 'jefe',
      family_bond: 'Jefe de Familia'
    };
    
    // Agregar spouse si existe
    const spouseMember: any = spouse ? {
      id: 'temp-spouse',
      member_type: 'SPOUSE',
      dni: spouse.document_number || spouse.dni || '',
      first_name: spouse.first_name || '',
      apellido_paterno: spouse.paternal_surname || '',
      apellido_materno: spouse.maternal_surname || '',
      birth_date: spouse.birth_date || '',
      marital_status: spouse.civil_status || '',
      phone_number: spouse.phone_number || '',
      email: spouse.email || '',
      education_level: spouse.education_level || '',
      occupation: (data.spouse_economic as any)?.occupation_detail || '',
      employment_situation: (data.spouse_economic as any)?.employment_situation || '',
      monthly_income: (data.spouse_economic as any)?.monthly_income || 0,
      disability_type: spouse.disability_type || 'Ninguna',
      relationship: 'conyuge',
      family_bond: 'Cónyuge'
    } : null;
    
    allMembers = [headMember, ...(spouseMember ? [spouseMember] : []), ...allMembers];
  }

  // Buscar el jefe de familia priorizando member_type exacto
  let realHeadOfFamily = allMembers.find(member => 
    member.member_type?.toString() === 'JEFE_FAMILIA'
  );
  
  // Fallback a otras condiciones si no se encuentra
  if (!realHeadOfFamily) {
    realHeadOfFamily = allMembers.find(member => 
      member.member_type?.toString().includes('HEAD') || 
      String(member.relationship) === 'jefe' ||
      (member.dni === head_of_family?.dni || member.dni === head_of_family?.document_number)
    );
  }

  // Calcular ingreso total SOLO de miembros con ingresos (HEAD y SPOUSE)
  const membersWithIncomes = allMembers?.filter(m => {
    const memberType = m.member_type?.toString().toUpperCase();
    return memberType?.includes('HEAD') || memberType?.includes('SPOUSE') || memberType === 'JEFE_FAMILIA' || memberType === 'CONYUGE';
  }) || [];
  
  const totalIncome = membersWithIncomes.reduce((sum, m) => {
    const income = parseFloat(String(m.monthly_income || 0));
    return sum + income;
  }, 0);

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

      {/* Datos del Usuario (Control Interno) - Solo datos básicos del Paso 1 */}
      {head_of_family && (
        <Card title="Datos del Usuario (Control Interno)" actions={<EditButton step={1} />}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(head_of_family.dni || head_of_family.document_number || '')}</span></div>
            <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{head_of_family.first_name}</span></div>
            <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{head_of_family.paternal_surname} {head_of_family.maternal_surname}</span></div>
            <div><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{formatPhone(head_of_family.phone_number || '')}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Email:</span> <span className="font-medium">{head_of_family.email}</span></div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 italic">
              ℹ️ Estos son los datos básicos de contacto capturados en el Paso 1. 
              Los datos completos del jefe de familia se muestran en la sección "Jefe de Familia" a continuación.
            </p>
          </div>
        </Card>
      )}

      {/* Jefe de Familia - DATOS COMPLETOS desde household_members */}
      <Card title="Jefe de Familia" actions={<EditButton step={2} />}>
        {realHeadOfFamily ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(realHeadOfFamily?.dni || '')}</span></div>
            <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{realHeadOfFamily?.first_name}</span></div>
            <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{realHeadOfFamily?.apellido_paterno} {realHeadOfFamily?.apellido_materno}</span></div>
            <div><span className="text-gray-600">Fecha Nacimiento:</span> <span className="font-medium">{realHeadOfFamily?.birth_date ? formatDate(realHeadOfFamily.birth_date) : '-'}</span></div>
            <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{CIVIL_STATUS_OPTIONS.find(m => m.value === realHeadOfFamily?.marital_status)?.label || '-'}</span></div>
            <div><span className="text-gray-600">Educación:</span> <span className="font-medium">{EDUCATION_LEVEL_OPTIONS.find(e => e.value === realHeadOfFamily?.education_level)?.label || realHeadOfFamily?.education_level || '-'}</span></div>
            <div><span className="text-gray-600">Ocupación:</span> <span className="font-medium">{realHeadOfFamily?.occupation || '-'}</span></div>
            <div><span className="text-gray-600">Situación Laboral:</span> <span className="font-medium">{realHeadOfFamily?.employment_situation || '-'}</span></div>
            <div><span className="text-gray-600">Ingreso Mensual:</span> <span className="font-medium text-green-700">{formatCurrency(realHeadOfFamily?.monthly_income || 0)}</span></div>
            <div>
              <span className="text-gray-600">Discapacidad:</span>{' '}
              <span className="font-medium">
                {formatDisabilityWithCharacteristics(
                  realHeadOfFamily?.disability_type,
                  realHeadOfFamily?.disability_is_permanent,
                  realHeadOfFamily?.disability_is_severe
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">⚠️ No se encontró el jefe de familia en el grupo familiar.</p>
            <p className="text-sm text-gray-400 mt-2">Debe agregar al jefe de familia en el Paso 2: Grupo Familiar</p>
          </div>
        )}
      </Card>

      {/* Cónyuge/Conviviente - Desde household_members */}
      {(() => {
        const spouseMember = allMembers?.find(member => 
          member.member_type?.toString().includes('SPOUSE') ||
          member.member_type?.toString() === 'CONYUGE' ||
          member.member_type?.toString() === 'SPOUSE' ||
          member.relationship === 'conyuge'
        );
        
        if (!spouseMember) return null;
        
        return (
          <Card title="Cónyuge/Conviviente" actions={<EditButton step={2} />}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(spouseMember.dni || '')}</span></div>
              <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{spouseMember.first_name}</span></div>
              <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{spouseMember.apellido_paterno} {spouseMember.apellido_materno}</span></div>
              <div><span className="text-gray-600">Fecha Nacimiento:</span> <span className="font-medium">{spouseMember.birth_date ? formatDate(spouseMember.birth_date) : '-'}</span></div>
              <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{CIVIL_STATUS_OPTIONS.find(m => m.value === spouseMember.marital_status)?.label || '-'}</span></div>
              <div><span className="text-gray-600">Educación:</span> <span className="font-medium">{spouseMember.education_level || '-'}</span></div>
              <div><span className="text-gray-600">Ocupación:</span> <span className="font-medium">{spouseMember.occupation || 'No especificado'}</span></div>
              <div><span className="text-gray-600">Situación Laboral:</span> <span className="font-medium">{spouseMember.employment_situation || '-'}</span></div>
              <div><span className="text-gray-600">Condición:</span> <span className="font-medium">{spouseMember.work_condition || '-'}</span></div>
              <div><span className="text-gray-600">Ingreso Mensual:</span> <span className="font-medium text-green-700">{formatCurrency(spouseMember.monthly_income || 0)}</span></div>
              <div>
                <span className="text-gray-600">Discapacidad:</span>{' '}
                <span className="font-medium">
                  {formatDisabilityWithCharacteristics(
                    spouseMember.disability_type,
                    spouseMember.disability_is_permanent,
                    spouseMember.disability_is_severe
                  )}
                </span>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Carga Familiar */}
      {(() => {
        const familyDependents = allMembers?.filter(member => 
          member.member_type?.toString().includes('DEPENDENT') ||
          member.member_type?.toString() === 'FAMILY_DEPENDENT' ||
          member.member_type?.toString() === 'CARGA_FAMILIAR'
        ) || [];
        
        if (familyDependents.length === 0) return null;
        
        return (
          <Card title="🏠 Carga Familiar" actions={<EditButton step={2} />}>
            <div className="space-y-3">
              {familyDependents.map((member, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    🏠 {member.first_name} {member.apellido_paterno} {member.apellido_materno}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                    <span>DNI: {formatDNI(member.dni)}</span>
                    <span>Vínculo: {member.family_bond || member.relationship || 'Sin especificar'}</span>
                    {member.birth_date && <span>Nacimiento: {formatDate(member.birth_date)}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-sm text-gray-600">
                    <span>Educación: {EDUCATION_LEVEL_OPTIONS.find(e => e.value === member.education_level)?.label || 'N/A'}</span>
                    <span>
                      Discapacidad: {formatDisabilityWithCharacteristics(
                        member.disability_type,
                        member.disability_is_permanent,
                        member.disability_is_severe
                      )}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-orange-600 italic">
                    🏠 Carga familiar - Datos básicos + educación y discapacidad
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t text-sm text-gray-600">
                <span>Total carga familiar: <strong>{familyDependents.length}</strong></span>
                <span className="text-xs italic ml-2">*Hijos, hermanos, nietos menores de 25 años o mayores con discapacidad permanente</span>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Información Adicional del Grupo Familiar */}
      {(() => {
        const additionalMembers = allMembers?.filter(member => 
          member.member_type?.toString().includes('ADDITIONAL') ||
          member.member_type?.toString() === 'ADDITIONAL_FAMILY' ||
          member.member_type?.toString() === 'FAMILIA_ADICIONAL'
        ) || [];
        
        if (additionalMembers.length === 0) return null;
        
        return (
          <Card title="👥 Información Adicional del Grupo Familiar" actions={<EditButton step={2} />}>
            <div className="space-y-3">
              {additionalMembers.map((member, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    👥 {member.first_name} {member.apellido_paterno} {member.apellido_materno}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                    <span>DNI: {formatDNI(member.dni)}</span>
                    <span>Vínculo: {member.family_bond || member.relationship || 'Sin especificar'}</span>
                  </div>
                  <div className="mt-2 text-xs text-blue-600 italic">
                    ℹ️ Información simplificada - Solo datos básicos requeridos
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t text-sm text-gray-600">
                <span>Total miembros adicionales: <strong>{additionalMembers.length}</strong></span>
                <span className="text-xs italic ml-2">*Información simplificada - Solo datos básicos</span>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Resumen del Grupo Familiar */}
      {allMembers && allMembers.length > 0 && (
        <Card title="📊 Resumen del Grupo Familiar">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{allMembers.length}</div>
              <div className="text-gray-600">Total Miembros</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
              <div className="text-gray-600">Ingreso Total</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{membersWithIncomes.length}</div>
              <div className="text-gray-600">Con Ingresos</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {allMembers.filter(m => 
                  m.member_type?.toString().includes('ADDITIONAL') ||
                  m.member_type?.toString() === 'ADDITIONAL_FAMILY' ||
                  m.member_type?.toString() === 'FAMILIA_ADICIONAL'
                ).length}
              </div>
              <div className="text-gray-600">Familia Adicional</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {allMembers.filter(m => 
                  m.member_type?.toString().includes('DEPENDENT') ||
                  m.member_type?.toString() === 'FAMILY_DEPENDENT' ||
                  m.member_type?.toString() === 'CARGA_FAMILIAR'
                ).length}
              </div>
              <div className="text-gray-600">Carga Familiar</div>
            </div>
          </div>
        </Card>
      )}

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
