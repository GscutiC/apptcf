/**
 * HouseholdForm - Step 2: Grupo Familiar
 */

import React, { useState } from 'react';
import { 
  HouseholdMember, 
  MaritalStatus,
  EducationLevel,
  EmploymentSituation,
  EmploymentCondition,
  DisabilityType,
  MemberType
} from '../../types';
import { Button, Card } from '../common';
import { AddMemberModal } from './AddMemberModal';
import { 
  MARITAL_STATUS_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_SITUATION_OPTIONS,
  EMPLOYMENT_CONDITION_OPTIONS,
  DISABILITY_TYPE_OPTIONS,
  MEMBER_TYPE_OPTIONS,
  FAMILY_BOND_OPTIONS
} from '../../utils';

interface HouseholdFormProps {
  data: HouseholdMember[];
  onChange: (data: HouseholdMember[]) => void;
  errors?: Record<number, Record<string, string>>;
}

export const HouseholdForm: React.FC<HouseholdFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedMemberType, setSelectedMemberType] = useState<MemberType>(MemberType.SPOUSE);

  const handleAddMember = (member: HouseholdMember) => {
    if (editingIndex !== null) {
      // Editar miembro existente
      const updated = [...data];
      updated[editingIndex] = member;
      onChange(updated);
    } else {
      // Agregar nuevo miembro
      onChange([...data, member]);
    }
    handleCloseModal();
  };

  const handleRemoveMember = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleEditMember = (index: number) => {
    setEditingMember(data[index]);
    setEditingIndex(index);
    setSelectedMemberType(data[index].member_type);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = (memberType: MemberType) => {
    setEditingMember(null);
    setEditingIndex(null);
    setSelectedMemberType(memberType);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setEditingIndex(null);
  };

  const totalIncome = data.reduce((sum, member) => sum + (member.monthly_income || 0), 0);

  // Agrupar miembros por tipo
  const headOfFamily = data.find(member => member.member_type === MemberType.HEAD_OF_FAMILY);
  const spouse = data.find(member => member.member_type === MemberType.SPOUSE);
  const additionalFamily = data.filter(member => member.member_type === MemberType.ADDITIONAL_FAMILY);
  const familyDependents = data.filter(member => member.member_type === MemberType.FAMILY_DEPENDENT);
  const otherMembers = data.filter(member => member.member_type === MemberType.OTHER);

  const renderMemberCard = (member: HouseholdMember, index: number, isSimplified = false) => (
    <div
      key={member.id || index}
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          {member.member_type === MemberType.HEAD_OF_FAMILY && '👨‍💼'}
          {member.member_type === MemberType.SPOUSE && '💑'}
          {member.member_type === MemberType.ADDITIONAL_FAMILY && '👥'}
          {member.member_type === MemberType.FAMILY_DEPENDENT && '🏠'}
          {member.member_type === MemberType.OTHER && '👥'}
          {member.first_name} {member.apellido_paterno} {member.apellido_materno}
        </h4>
        
        {/* Información para miembros completos */}
        {!isSimplified && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
              <span>DNI: {member.dni}</span>
              <span>Estado Civil: {MARITAL_STATUS_OPTIONS.find(s => s.value === member.marital_status)?.label || 'N/A'}</span>
              <span>Educación: {EDUCATION_LEVEL_OPTIONS.find(e => e.value === member.education_level)?.label || 'N/A'}</span>
              <span>Ocupación: {member.occupation || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-sm text-gray-600">
              <span>Situación: {EMPLOYMENT_SITUATION_OPTIONS.find(e => e.value === member.employment_situation)?.label || 'N/A'}</span>
              <span>Condición: {EMPLOYMENT_CONDITION_OPTIONS.find(c => c.value === member.employment_condition)?.label || 'N/A'}</span>
              <span>Discapacidad: {DISABILITY_TYPE_OPTIONS.find(d => d.value === member.disability_type)?.label || 'N/A'}</span>
              <span className="font-medium text-green-700">S/ {(member.monthly_income || 0).toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Información simplificada para familia adicional y carga familiar */}
        {isSimplified && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
            <span>DNI: {member.dni}</span>
            <span>Vínculo: {FAMILY_BOND_OPTIONS.find(b => b.value === member.family_bond)?.label || 'Sin especificar'}</span>
            {member.birth_date && (
              <span>Nacimiento: {new Date(member.birth_date).toLocaleDateString('es-PE')}</span>
            )}
            {member.marital_status && (
              <span>Estado Civil: {MARITAL_STATUS_OPTIONS.find(s => s.value === member.marital_status)?.label}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 ml-4">
        <button
          onClick={() => handleEditMember(index)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          onClick={() => handleRemoveMember(index)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderMembersByType = () => {
    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-medium">No hay miembros agregados</p>
          <p className="text-sm mt-1">Agregue miembros del hogar para continuar</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Jefe de Familia */}
        {headOfFamily && (
          <Card title="👨‍💼 Jefe de Familia" className="border-l-4 border-l-blue-500">
            {renderMemberCard(headOfFamily, data.indexOf(headOfFamily))}
          </Card>
        )}

        {/* Cónyuge/Conviviente */}
        {spouse && (
          <Card title="💑 Cónyuge/Conviviente" className="border-l-4 border-l-pink-500">
            {renderMemberCard(spouse, data.indexOf(spouse))}
          </Card>
        )}

        {/* Familia Adicional */}
        {additionalFamily.length > 0 && (
          <Card title="👥 Información Adicional del Grupo Familiar" className="border-l-4 border-l-orange-500">
            <div className="space-y-3">
              {additionalFamily.map((member, idx) => 
                renderMemberCard(member, data.indexOf(member), true)
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total miembros adicionales: <strong>{additionalFamily.length}</strong></span>
                <span className="text-xs italic">*Información simplificada - Solo datos básicos</span>
              </div>
            </div>
          </Card>
        )}

        {/* Carga Familiar */}
        {familyDependents.length > 0 && (
          <Card title="🏠 Carga Familiar" className="border-l-4 border-l-yellow-500">
            <div className="space-y-3">
              {familyDependents.map((member, idx) => 
                renderMemberCard(member, data.indexOf(member), true)
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total carga familiar: <strong>{familyDependents.length}</strong></span>
                <span className="text-xs italic">*Hijos, hermanos, nietos menores de 25 años o mayores con discapacidad permanente</span>
              </div>
            </div>
          </Card>
        )}

        {/* Otros Miembros */}
        {otherMembers.length > 0 && (
          <Card title="👥 Otros Miembros" className="border-l-4 border-l-gray-500">
            <div className="space-y-3">
              {otherMembers.map((member, idx) => 
                renderMemberCard(member, data.indexOf(member))
              )}
            </div>
          </Card>
        )}

        {/* Resumen */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{data.length}</div>
                <div className="text-sm text-gray-600">Miembros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">S/ {totalIncome.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Ingreso Total</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Jefe: {headOfFamily ? '✓' : '✗'}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                <span>Cónyuge: {spouse ? '✓' : '✗'}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span>Familia Adicional: {additionalFamily.length}</span>
              </div>
              {otherMembers.length > 0 && (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <span>Otros: {otherMembers.length}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Paso 2: Grupo Familiar
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Agregue los miembros del hogar. El ingreso familiar total se calculará automáticamente.
        </p>
      </div>

      {/* Botones para agregar diferentes tipos de miembros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => handleOpenAddModal(MemberType.HEAD_OF_FAMILY)}
          variant="primary"
          size="lg"
          className="flex items-center justify-center space-x-2 py-6"
          disabled={data.some(member => member.member_type === MemberType.HEAD_OF_FAMILY)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div className="text-left">
            <div className="font-semibold">👨‍💼 Jefe de Familia</div>
            <div className="text-sm opacity-90">Titular principal del hogar</div>
          </div>
        </Button>

        <Button
          onClick={() => handleOpenAddModal(MemberType.SPOUSE)}
          variant="secondary"
          size="lg"
          className="flex items-center justify-center space-x-2 py-6"
          disabled={data.some(member => member.member_type === MemberType.SPOUSE)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <div className="text-left">
            <div className="font-semibold">💑 Cónyuge/Conviviente</div>
            <div className="text-sm opacity-90">Pareja del jefe de familia</div>
          </div>
        </Button>

        <Button
          onClick={() => handleOpenAddModal(MemberType.ADDITIONAL_FAMILY)}
          variant="ghost"
          size="lg"
          className="flex items-center justify-center space-x-2 py-6 border-2 border-dashed border-gray-300 hover:border-blue-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="text-left">
            <div className="font-semibold">👥 Familia Adicional</div>
            <div className="text-sm opacity-90">Otros miembros del hogar</div>
          </div>
        </Button>

        <Button
          onClick={() => handleOpenAddModal(MemberType.FAMILY_DEPENDENT)}
          variant="ghost"
          size="lg"
          className="flex items-center justify-center space-x-2 py-6 border-2 border-dashed border-orange-300 hover:border-orange-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7m18 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2m18 0v2M3 7v2m0 0v10a2 2 0 002 2h14a2 2 0 002-2V9M3 9V7" />
          </svg>
          <div className="text-left">
            <div className="font-semibold">🏠 Carga Familiar</div>
            <div className="text-sm opacity-90">Dependientes menores de 25 años</div>
          </div>
        </Button>
      </div>

      {/* Modal para agregar/editar miembro */}
      <AddMemberModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleAddMember}
        editingMember={editingMember}
        memberIndex={editingIndex || undefined}
        memberType={selectedMemberType}
      />

      {/* Miembros organizados por tipo */}
      {renderMembersByType()}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-medium">No hay miembros agregados</p>
          <p className="text-sm mt-1">Agregue al menos un miembro del hogar para continuar</p>
        </div>
      )}
    </div>
  );
};

export default HouseholdForm;
