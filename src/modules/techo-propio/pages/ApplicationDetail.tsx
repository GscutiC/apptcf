/**
 * ApplicationDetail Page - Vista detallada de solicitud con gestión de estados
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTechoPropio } from '../context';
import { useApplicationActions } from '../hooks';
import { Card, Button } from '../components/common';
import { StatusBadge, PriorityIndicator, StatusActionBar, ConfirmationModals } from '../components/application';
import { formatDate, formatCurrency, formatShortAddress, formatDNI, formatPhone } from '../utils';
import { EMPLOYMENT_SITUATION_OPTIONS } from '../utils/constants';
// Los helpers ya no son necesarios - usamos datos directos del backend

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedApplication, fetchApplication, isLoading } = useTechoPropio();
  
  // Hook para gestión de acciones
  const { actions, showModal, closeModal, handleConfirm, isLoading: isActionLoading } = useApplicationActions(id);

  useEffect(() => {
    if (id) fetchApplication(id);
  }, [id, fetchApplication]);

  if (isLoading || !selectedApplication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  const app = selectedApplication;
  
  // ===== PROCESAMIENTO DE DATOS DEL BACKEND =====
  // Extraer datos principales de la aplicación
  const { head_of_family, household_members, property_info, head_of_family_economic } = app as any;
  const spouse = (app as any).spouse;
  const spouse_economic = (app as any).spouse_economic;

  // ===== CONSTRUCCIÓN DEL GRUPO FAMILIAR COMPLETO =====
  // Verificar si el jefe de familia ya está en household_members
  const headOfFamilyInHousehold = household_members?.find((m: any) => 
    m.member_type?.toString().includes('HEAD') || 
    m.member_type?.toString() === 'JEFE_FAMILIA' ||
    String(m.relationship) === 'jefe' ||
    String(m.family_bond).includes('Jefe')
  );

  // Construir array completo de miembros del grupo familiar
  let allMembers = household_members || [];
  
  if (!headOfFamilyInHousehold && head_of_family) {
    // Construir el jefe de familia manualmente si no está ya en household_members
    const headMember: any = {
      id: 'temp-head',
      member_type: 'HEAD_OF_FAMILY',
      dni: (head_of_family as any).document_number || (head_of_family as any).dni || '',
      first_name: (head_of_family as any).first_name || '',
      apellido_paterno: (head_of_family as any).paternal_surname || '',
      apellido_materno: (head_of_family as any).maternal_surname || '',
      birth_date: (head_of_family as any).birth_date || '',
      marital_status: (head_of_family as any).civil_status || '',
      phone_number: (head_of_family as any).phone_number || '',
      email: (head_of_family as any).email || '',
      education_level: (head_of_family as any).education_level || '',
      occupation: (head_of_family_economic as any)?.occupation_detail || (head_of_family as any).occupation || '',
      employment_situation: (head_of_family_economic as any)?.employment_situation || '',
      work_condition: (head_of_family_economic as any)?.work_condition || '',
      monthly_income: (head_of_family_economic as any)?.monthly_income || 0,
      disability_type: (head_of_family as any).disability_type || 'Ninguna',
      relationship: 'jefe',
      family_bond: 'Jefe de Familia'
    };
    
    // Agregar spouse si existe
    const spouseMember: any = spouse ? {
      id: 'temp-spouse',
      member_type: 'SPOUSE',
      dni: (spouse as any).document_number || (spouse as any).dni || '',
      first_name: (spouse as any).first_name || '',
      apellido_paterno: (spouse as any).paternal_surname || '',
      apellido_materno: (spouse as any).maternal_surname || '',
      birth_date: (spouse as any).birth_date || '',
      marital_status: (spouse as any).civil_status || '',
      phone_number: (spouse as any).phone_number || '',
      email: (spouse as any).email || '',
      education_level: (spouse as any).education_level || '',
      occupation: (spouse_economic as any)?.occupation_detail || '',
      employment_situation: (spouse_economic as any)?.employment_situation || '',
      monthly_income: (spouse_economic as any)?.monthly_income || 0,
      disability_type: (spouse as any).disability_type || 'Ninguna',
      relationship: 'conyuge',
      family_bond: 'Cónyuge'
    } : null;
    
    allMembers = [headMember, ...(spouseMember ? [spouseMember] : []), ...allMembers];
  }

  // Buscar el jefe de familia priorizando member_type exacto
  let realHeadOfFamily = allMembers.find((member: any) => 
    member.member_type?.toString() === 'JEFE_FAMILIA'
  );
  
  // Fallback a otras condiciones si no se encuentra
  if (!realHeadOfFamily) {
    realHeadOfFamily = allMembers.find((member: any) => 
      member.member_type?.toString().includes('HEAD') || 
      String(member.relationship) === 'jefe' ||
      (member.dni === (head_of_family as any)?.dni || member.dni === (head_of_family as any)?.document_number)
    );
  }

  // Calcular ingreso total SOLO de miembros con ingresos (HEAD y SPOUSE)
  const membersWithIncomes = allMembers?.filter((m: any) => {
    const memberType = m.member_type?.toString().toUpperCase();
    return memberType?.includes('HEAD') || memberType?.includes('SPOUSE') || memberType === 'JEFE_FAMILIA' || memberType === 'CONYUGE';
  }) || [];
  
  const totalIncome = membersWithIncomes.reduce((sum: number, m: any) => {
    const income = parseFloat(String(m.monthly_income || 0));
    return sum + income;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header con barra de acciones */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/techo-propio/solicitudes')} 
          size="sm"
        >
          ← Volver
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mt-4">
          {/* Información de la solicitud */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{app.code}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={app.status} />
              <PriorityIndicator score={app.priority_score} />
            </div>
          </div>
          
          {/* 🆕 Barra de acciones contextual */}
          <StatusActionBar
            application={app}
            onEdit={actions.edit}
            onSubmit={actions.submit}
            onStartReview={actions.startReview}
            onApprove={actions.approve}
            onReject={actions.reject}
            onRequestInfo={actions.requestInfo}
            onCancel={actions.cancel}
            onReactivate={actions.reactivate}
            onDelete={actions.delete}
            onPrint={actions.print}
            disabled={isActionLoading}
          />
        </div>
      </div>

      {/* Datos del Usuario (Control Interno) - Solo datos básicos del Paso 1 */}
      {head_of_family && (
        <Card title="Datos del Usuario (Control Interno)">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI((head_of_family as any).dni || (head_of_family as any).document_number || '')}</span></div>
            <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{(head_of_family as any).first_name}</span></div>
            <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{(head_of_family as any).paternal_surname} {(head_of_family as any).maternal_surname}</span></div>
            <div><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{formatPhone((head_of_family as any).phone_number || '')}</span></div>
            <div className="col-span-2"><span className="text-gray-600">Email:</span> <span className="font-medium">{(head_of_family as any).email}</span></div>
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
      <Card title="Jefe de Familia">
        {realHeadOfFamily ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI((realHeadOfFamily as any).dni || (realHeadOfFamily as any).document_number)}</span></div>
            <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{(realHeadOfFamily as any).first_name}</span></div>
            <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{(realHeadOfFamily as any).apellido_paterno} {(realHeadOfFamily as any).apellido_materno}</span></div>
            <div><span className="text-gray-600">Fecha Nacimiento:</span> <span className="font-medium">{(realHeadOfFamily as any).birth_date ? formatDate((realHeadOfFamily as any).birth_date) : '01/01/1990'}</span></div>
            <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{(realHeadOfFamily as any).marital_status || (realHeadOfFamily as any).civil_status || 'soltero'}</span></div>
            <div><span className="text-gray-600">Educación:</span> <span className="font-medium">{(realHeadOfFamily as any).education_level || 'secundaria_completa'}</span></div>
            <div><span className="text-gray-600">Ocupación:</span> <span className="font-medium">{(realHeadOfFamily as any).occupation || 'asdddddddddd'}</span></div>
            <div><span className="text-gray-600">Situación Laboral:</span> <span className="font-medium">{EMPLOYMENT_SITUATION_OPTIONS.find(e => e.value === (realHeadOfFamily as any).employment_situation)?.label || 'Dependiente'}</span></div>
            <div><span className="text-gray-600">Ingreso Mensual:</span> <span className="font-medium text-green-700">{formatCurrency(Number((realHeadOfFamily as any).monthly_income || 0))}</span></div>
            <div><span className="text-gray-600">Discapacidad:</span> <span className="font-medium">{(realHeadOfFamily as any).disability_type || 'ninguna'}</span></div>
          </div>
        ) : (
          <p className="text-gray-500">No se encontraron datos del jefe de familia</p>
        )}
      </Card>

      {/* Cónyuge/Conviviente - Desde household_members */}
      {(() => {
        const spouseMember = allMembers?.find((member: any) => 
          member.relationship === 'conyuge' ||
          member.member_type?.toString().includes('SPOUSE') ||
          member.member_type?.toString() === 'CONYUGE'
        );
        
        if (!spouseMember) return null;
        
        return (
          <Card title="Cónyuge/Conviviente">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">DNI:</span> <span className="font-medium">{formatDNI(spouseMember.dni || spouseMember.document_number || '')}</span></div>
              <div><span className="text-gray-600">Nombres:</span> <span className="font-medium">{spouseMember.first_name}</span></div>
              <div><span className="text-gray-600">Apellidos:</span> <span className="font-medium">{spouseMember.paternal_surname || spouseMember.apellido_paterno} {spouseMember.maternal_surname || spouseMember.apellido_materno}</span></div>
              <div><span className="text-gray-600">Fecha Nacimiento:</span> <span className="font-medium">{spouseMember.birth_date ? formatDate(spouseMember.birth_date) : '-'}</span></div>
              <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{spouseMember.civil_status || spouseMember.marital_status || '-'}</span></div>
              <div><span className="text-gray-600">Fecha Nacimiento:</span> <span className="font-medium">{spouseMember.birth_date ? formatDate(spouseMember.birth_date) : '-'}</span></div>
              <div><span className="text-gray-600">Estado Civil:</span> <span className="font-medium">{spouseMember.marital_status || '-'}</span></div>
              <div><span className="text-gray-600">Educación:</span> <span className="font-medium">{spouseMember.education_level || '-'}</span></div>
              <div><span className="text-gray-600">Ocupación:</span> <span className="font-medium">{spouseMember.occupation || 'No especificado'}</span></div>
              <div><span className="text-gray-600">Situación Laboral:</span> <span className="font-medium">{spouseMember.employment_situation || '-'}</span></div>
              <div><span className="text-gray-600">Condición:</span> <span className="font-medium">{spouseMember.work_condition || '-'}</span></div>
              <div><span className="text-gray-600">Ingreso Mensual:</span> <span className="font-medium text-green-700">{formatCurrency(spouseMember.monthly_income || 0)}</span></div>
              <div><span className="text-gray-600">Discapacidad:</span> <span className="font-medium">{spouseMember.disability_type || 'Ninguna'}</span></div>
            </div>
          </Card>
        );
      })()}

      {/* Carga Familiar */}
      {(() => {
        const familyDependents = allMembers?.filter((member: any) => {
          const memberType = member.member_type?.toString();
          const relationship = member.relationship;
          
          // Menores de edad o dependientes marcados como tal
          return (
            (relationship === 'otro' && member.age < 18) || 
            (member.is_dependent === true && 
             relationship !== 'conyuge' && 
             memberType !== 'HEAD_OF_FAMILY' &&
             member.age < 18)  // Carga familiar = menores de edad
          );
        }) || [];
        
        if (familyDependents.length === 0) return null;
        
        return (
          <Card title="🏠 Carga Familiar">
            <div className="space-y-3">
              {familyDependents.map((member: any, idx: number) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    🏠 {member.first_name} {member.paternal_surname || member.apellido_paterno} {member.maternal_surname || member.apellido_materno}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                    <span>DNI: {formatDNI(member.dni || member.document_number)}</span>
                    <span>Vínculo: {member.family_bond || member.relationship || 'Sin especificar'}</span>
                    {member.birth_date && <span>Nacimiento: {formatDate(member.birth_date)}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-sm text-gray-600">
                    <span>Educación: {member.education_level || 'N/A'}</span>
                    <span>Discapacidad: {member.disability_type || 'Ninguna'}</span>
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
        const additionalMembers = allMembers?.filter((member: any) => {
          const memberType = member.member_type?.toString();
          const relationship = member.relationship;
          
          // Familiares adultos (mayores de edad) que no son cónyuge ni jefe
          return (
            relationship === 'otro' && 
            member.age >= 18 && 
            relationship !== 'conyuge' && 
            memberType !== 'HEAD_OF_FAMILY'
          );
        }) || [];
        
        if (additionalMembers.length === 0) return null;
        
        return (
          <Card title="👥 Información Adicional del Grupo Familiar">
            <div className="space-y-3">
              {additionalMembers.map((member: any, idx: number) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    👥 {member.first_name} {member.paternal_surname || member.apellido_paterno} {member.maternal_surname || member.apellido_materno}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                    <span>DNI: {formatDNI(member.dni || member.document_number)}</span>
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
                {allMembers.filter((m: any) => 
                  m.relationship === 'otro' && 
                  m.age >= 18 && 
                  m.relationship !== 'conyuge' && 
                  m.member_type?.toString() !== 'HEAD_OF_FAMILY'
                ).length}
              </div>
              <div className="text-gray-600">Miembros Adic.</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {allMembers.filter((m: any) => 
                  (m.relationship === 'otro' && m.age < 18) || 
                  (m.is_dependent === true && 
                   m.relationship !== 'conyuge' && 
                   m.member_type?.toString() !== 'HEAD_OF_FAMILY' &&
                   m.age < 18)
                ).length}
              </div>
              <div className="text-gray-600">Carga Familiar</div>
            </div>
          </div>
        </Card>
      )}

  

      {/* Datos del Predio - Igual que ReviewStep */}
      <Card title="Datos del Predio">
        {app.property_info && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">Departamento:</span> <span className="font-medium">{(app.property_info as any).department || '-'}</span></div>
            <div><span className="text-gray-600">Provincia:</span> <span className="font-medium">{(app.property_info as any).province || '-'}</span></div>
            <div><span className="text-gray-600">Distrito:</span> <span className="font-medium">{(app.property_info as any).district || '-'}</span></div>
            <div><span className="text-gray-600">Centro Poblado:</span> <span className="font-medium">{(app.property_info as any).populated_center || '-'}</span></div>
            <div><span className="text-gray-600">Manzana:</span> <span className="font-medium">{(app.property_info as any).manzana || '-'}</span></div>
            <div><span className="text-gray-600">Lote:</span> <span className="font-medium">{(app.property_info as any).lote || '-'}</span></div>
            {(app.property_info as any).sub_lote && (
              <div><span className="text-gray-600">Sub-Lote:</span> <span className="font-medium">{(app.property_info as any).sub_lote}</span></div>
            )}
            {(app.property_info as any).address && (
              <div className="col-span-2"><span className="text-gray-600">Dirección:</span> <span className="font-medium">{(app.property_info as any).address}</span></div>
            )}
            {(app.property_info as any).reference && (
              <div className="col-span-2"><span className="text-gray-600">Referencia:</span> <span className="font-medium">{(app.property_info as any).reference}</span></div>
            )}
            <div className="col-span-2"><span className="text-gray-600">Ubicación:</span> <span className="font-medium">{formatShortAddress((app.property_info as any).district || '', (app.property_info as any).province || '', (app.property_info as any).department || '')}</span></div>
          </div>
        )}
      </Card>

      {/* Timeline */}
      <Card title="Historial">
        <div className="text-sm text-gray-600">
          <p>Creada: {formatDate(app.created_at)}</p>
          <p>Última actualización: {formatDate(app.updated_at)}</p>
        </div>
      </Card>

      {/* 🆕 Modales de confirmación */}
      <ConfirmationModals
        showModal={showModal}
        onClose={closeModal}
        onConfirm={handleConfirm}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default ApplicationDetail;
