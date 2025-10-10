/**
 * AddMemberModal - Modal compacto y profesional para agregar miembros del hogar
 */

import React, { useState } from 'react';
import { 
  HouseholdMember, 
  FamilyRelationship,
  CivilStatus,
  EducationLevel,
  EmploymentSituation,
  EmploymentCondition,
  DisabilityType,
  MemberType
} from '../../types';
import { FormInput, FormSelect, Button, Modal } from '../common';
import { DniValidator } from '../application';
import { 
  FAMILY_RELATIONSHIP_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_SITUATION_OPTIONS,
  EMPLOYMENT_CONDITION_OPTIONS,
  DISABILITY_TYPE_OPTIONS,
  MEMBER_TYPE_OPTIONS,
  FAMILY_BOND_OPTIONS
} from '../../utils';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: HouseholdMember) => void;
  editingMember?: HouseholdMember | null;
  memberIndex?: number;
  memberType: MemberType; // Nuevo: tipo de miembro a agregar
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember = null,
  memberIndex,
  memberType
}) => {
  const [currentMember, setCurrentMember] = useState<Partial<HouseholdMember>>(
    editingMember || {}
  );
  const [activeTab, setActiveTab] = useState<'personal' | 'economic' | 'additional' | 'familyDependent'>('personal');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setCurrentMember(editingMember || { member_type: memberType });
      setActiveTab('personal');
      setErrors({});
    }
  }, [isOpen, editingMember, memberType]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones básicas siempre requeridas
    if (!currentMember.dni || currentMember.dni.length !== 8) {
      newErrors.dni = 'DNI debe tener 8 dígitos';
    }
    if (!currentMember.first_name?.trim()) {
      newErrors.first_name = 'Nombre es requerido';
    }
    if (!currentMember.apellido_paterno?.trim()) {
      newErrors.apellido_paterno = 'Apellido paterno es requerido';
    }
    if (!currentMember.apellido_materno?.trim()) {
      newErrors.apellido_materno = 'Apellido materno es requerido';
    }

    // Validaciones para Carga Familiar (solo datos básicos)
    if (memberType === MemberType.FAMILY_DEPENDENT) {
      if (!currentMember.birth_date) {
        newErrors.birth_date = 'Fecha de nacimiento es requerida';
      }
      if (!currentMember.family_bond?.trim()) {
        newErrors.family_bond = 'Vínculo familiar es requerido';
      }
      if (!currentMember.education_level) {
        newErrors.education_level = 'Grado de instrucción es requerido';
      }
      if (!currentMember.disability_type) {
        newErrors.disability_type = 'Información de discapacidad es requerida';
      }
    }
    // Validaciones solo para miembros completos (HEAD_OF_FAMILY y SPOUSE)
    else if (memberType !== MemberType.ADDITIONAL_FAMILY) {
      if (!currentMember.birth_date) {
        newErrors.birth_date = 'Fecha de nacimiento es requerida';
      }
      if (!currentMember.marital_status) {
        newErrors.marital_status = 'Estado civil es requerido';
      }
      if (!currentMember.education_level) {
        newErrors.education_level = 'Grado de instrucción es requerido';
      }
      if (!currentMember.occupation?.trim()) {
        newErrors.occupation = 'Ocupación es requerida';
      }
      if (!currentMember.employment_situation) {
        newErrors.employment_situation = 'Situación laboral es requerida';
      }
      if (!currentMember.employment_condition) {
        newErrors.employment_condition = 'Condición laboral es requerida';
      }
      if (!currentMember.disability_type) {
        newErrors.disability_type = 'Información de discapacidad es requerida';
      }
      if (currentMember.monthly_income === undefined || currentMember.monthly_income < 0) {
        newErrors.monthly_income = 'Ingreso mensual debe ser mayor o igual a 0';
      }
    }

    // Validación específica para familia adicional
    if (memberType === MemberType.ADDITIONAL_FAMILY && !currentMember.family_bond?.trim()) {
      newErrors.family_bond = 'Vínculo familiar es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const memberData: HouseholdMember = {
        ...currentMember,
        id: editingMember?.id || Date.now().toString(),
        member_type: memberType,
      } as HouseholdMember;
      
      onSave(memberData);
      onClose();
    }
  };

  const handleDniValidated = (reniecData: {
    dni: string;
    first_name: string;
    last_name: string;
  }) => {
    const apellidos = reniecData.last_name.split(' ');
    const apellido_paterno = apellidos[0] || '';
    const apellido_materno = apellidos.slice(1).join(' ') || '';

    setCurrentMember({
      ...currentMember,
      dni: reniecData.dni,
      first_name: reniecData.first_name,
      apellido_paterno,
      apellido_materno
    });
  };

  const handleNext = () => {
    // Validar solo los campos de la pestaña personal antes de continuar
    const personalErrors: Record<string, string> = {};
    
    if (!currentMember.dni || currentMember.dni.length !== 8) {
      personalErrors.dni = 'DNI debe tener 8 dígitos';
    }
    if (!currentMember.first_name?.trim()) {
      personalErrors.first_name = 'Nombre es requerido';
    }
    if (!currentMember.apellido_paterno?.trim()) {
      personalErrors.apellido_paterno = 'Apellido paterno es requerido';
    }
    if (!currentMember.apellido_materno?.trim()) {
      personalErrors.apellido_materno = 'Apellido materno es requerido';
    }

    // Validaciones para Carga Familiar
    if (memberType === MemberType.FAMILY_DEPENDENT) {
      if (!currentMember.birth_date) {
        personalErrors.birth_date = 'Fecha de nacimiento es requerida';
      }
    }
    // Validaciones adicionales solo para miembros completos
    else if (memberType !== MemberType.ADDITIONAL_FAMILY) {
      if (!currentMember.birth_date) {
        personalErrors.birth_date = 'Fecha de nacimiento es requerida';
      }
      if (!currentMember.marital_status) {
        personalErrors.marital_status = 'Estado civil es requerido';
      }
      if (!currentMember.education_level) {
        personalErrors.education_level = 'Grado de instrucción es requerido';
      }
      if (!currentMember.occupation?.trim()) {
        personalErrors.occupation = 'Ocupación es requerida';
      }
    }

    setErrors(personalErrors);
    
    if (Object.keys(personalErrors).length === 0) {
      // Para carga familiar, ir directamente a la pestaña específica
      if (memberType === MemberType.FAMILY_DEPENDENT) {
        setActiveTab('familyDependent');
      }
      // Para familia adicional, ir a la pestaña adicional
      else if (memberType === MemberType.ADDITIONAL_FAMILY) {
        setActiveTab('additional');
      } else {
        setActiveTab('economic');
      }
    }
  };

  const isPersonalDataComplete = () => {
    const basicPersonal = (
      currentMember.dni?.length === 8 &&
      currentMember.first_name?.trim() &&
      currentMember.apellido_paterno?.trim() &&
      currentMember.apellido_materno?.trim()
    );

    // Para carga familiar, necesita datos básicos + fecha de nacimiento
    if (memberType === MemberType.FAMILY_DEPENDENT) {
      return basicPersonal && currentMember.birth_date;
    }

    // Para familia adicional, solo necesita datos básicos
    if (memberType === MemberType.ADDITIONAL_FAMILY) {
      return basicPersonal;
    }

    // Para otros tipos, necesita todos los campos
    return (
      basicPersonal &&
      currentMember.birth_date &&
      currentMember.marital_status &&
      currentMember.education_level &&
      currentMember.occupation?.trim()
    );
  };

  const isEconomicDataComplete = () => {
    // Para familia adicional, no necesita datos económicos
    if (memberType === MemberType.ADDITIONAL_FAMILY) {
      return true;
    }

    const basicComplete = (
      currentMember.employment_situation &&
      currentMember.employment_condition &&
      currentMember.disability_type &&
      currentMember.monthly_income !== undefined &&
      currentMember.monthly_income >= 0
    );

    return basicComplete;
  };

  const isAdditionalDataComplete = () => {
    // Solo para familia adicional
    if (memberType === MemberType.ADDITIONAL_FAMILY) {
      return currentMember.family_bond?.trim();
    }
    return true;
  };

  const isFamilyDependentDataComplete = () => {
    // Solo para carga familiar
    if (memberType === MemberType.FAMILY_DEPENDENT) {
      return (
        currentMember.family_bond?.trim() &&
        currentMember.education_level &&
        currentMember.disability_type
      );
    }
    return true;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMember 
        ? `Editar ${MEMBER_TYPE_OPTIONS.find(t => t.value === memberType)?.label}` 
        : `Agregar ${MEMBER_TYPE_OPTIONS.find(t => t.value === memberType)?.label}`
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              activeTab === 'personal' ? 'bg-blue-600' : isPersonalDataComplete() ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            {memberType === MemberType.FAMILY_DEPENDENT && (
              <div className={`w-3 h-3 rounded-full ${
                activeTab === 'familyDependent' ? 'bg-blue-600' : isFamilyDependentDataComplete() ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
            {memberType !== MemberType.ADDITIONAL_FAMILY && memberType !== MemberType.FAMILY_DEPENDENT && (
              <div className={`w-3 h-3 rounded-full ${
                activeTab === 'economic' ? 'bg-blue-600' : isEconomicDataComplete() ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
            {memberType === MemberType.ADDITIONAL_FAMILY && (
              <div className={`w-3 h-3 rounded-full ${
                activeTab === 'additional' ? 'bg-blue-600' : isAdditionalDataComplete() ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            
            {activeTab === 'personal' ? (
              <Button 
                onClick={handleNext}
                disabled={!isPersonalDataComplete()}
              >
                Siguiente →
              </Button>
            ) : activeTab === 'economic' ? (
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab('personal')}
                >
                  ← Anterior
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!isPersonalDataComplete() || !isEconomicDataComplete()}
                >
                  {editingMember ? 'Actualizar' : 'Agregar'} Miembro
                </Button>
              </div>
            ) : activeTab === 'additional' ? (
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab('personal')}
                >
                  ← Anterior
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!isPersonalDataComplete() || !isAdditionalDataComplete()}
                >
                  {editingMember ? 'Actualizar' : 'Agregar'} Miembro
                </Button>
              </div>
            ) : activeTab === 'familyDependent' ? (
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab('personal')}
                >
                  ← Anterior
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!isPersonalDataComplete() || !isFamilyDependentDataComplete()}
                >
                  {editingMember ? 'Actualizar' : 'Agregar'} Miembro
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'personal'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Datos Personales
            {isPersonalDataComplete() && activeTab !== 'personal' && (
              <span className="ml-2 text-green-500">✓</span>
            )}
          </button>
          
          {memberType === MemberType.FAMILY_DEPENDENT && (
            <button
              onClick={() => setActiveTab('familyDependent')}
              disabled={!isPersonalDataComplete()}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'familyDependent'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : isPersonalDataComplete() 
                  ? 'text-gray-600 hover:text-gray-900' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              👥 Carga Familiar
              {isFamilyDependentDataComplete() && activeTab !== 'familyDependent' && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </button>
          )}

          {memberType !== MemberType.ADDITIONAL_FAMILY && memberType !== MemberType.FAMILY_DEPENDENT && (
            <button
              onClick={() => setActiveTab('economic')}
              disabled={!isPersonalDataComplete()}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'economic'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : isPersonalDataComplete() 
                  ? 'text-gray-600 hover:text-gray-900' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              💼 Información Económica
              {isEconomicDataComplete() && activeTab !== 'economic' && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </button>
          )}

          {memberType === MemberType.ADDITIONAL_FAMILY && (
            <button
              onClick={() => setActiveTab('additional')}
              disabled={!isPersonalDataComplete()}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'additional'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : isPersonalDataComplete() 
                  ? 'text-gray-600 hover:text-gray-900' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              👥 Información Familiar
              {isAdditionalDataComplete() && activeTab !== 'additional' && (
                <span className="ml-2 text-green-500">✓</span>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Información Personal
            </h3>

            {/* DNI con validación RENIEC */}
            <DniValidator
              value={currentMember.dni || ''}
              onChange={(value) => setCurrentMember({ ...currentMember, dni: value })}
              onValidated={handleDniValidated}
              label="DNI"
              required
            />
            {errors.dni && (
              <p className="text-sm text-red-600 mt-1">{errors.dni}</p>
            )}

            {/* Nombres completos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Nombre(s)"
                required
                value={currentMember.first_name || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, first_name: e.target.value })}
                placeholder="María"
                error={errors.first_name}
              />

              <FormInput
                label="Apellido Paterno"
                required
                value={currentMember.apellido_paterno || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, apellido_paterno: e.target.value })}
                placeholder="García"
                error={errors.apellido_paterno}
              />

              <FormInput
                label="Apellido Materno"
                required
                value={currentMember.apellido_materno || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, apellido_materno: e.target.value })}
                placeholder="López"
                error={errors.apellido_materno}
              />
            </div>

            {/* Campos condicionales según el tipo de miembro */}
            
            {/* Solo fecha de nacimiento para ADDITIONAL_FAMILY y FAMILY_DEPENDENT */}
            {(memberType === MemberType.ADDITIONAL_FAMILY || memberType === MemberType.FAMILY_DEPENDENT) && (
              <FormInput
                type="date"
                label="Fecha de Nacimiento"
                required
                value={currentMember.birth_date || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, birth_date: e.target.value })}
                error={errors.birth_date}
              />
            )}

            {/* Campos completos para HEAD_OF_FAMILY y SPOUSE */}
            {(memberType === MemberType.HEAD_OF_FAMILY || memberType === MemberType.SPOUSE) && (
              <>
                {/* Fecha, Estado Civil, Grado de Instrucción */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    type="date"
                    label="Fecha de Nacimiento"
                    required
                    value={currentMember.birth_date || ''}
                    onChange={(e) => setCurrentMember({ ...currentMember, birth_date: e.target.value })}
                    error={errors.birth_date}
                  />

                  <FormSelect
                    label="Estado Civil"
                    required
                    value={currentMember.marital_status || ''}
                    onChange={(e) => setCurrentMember({ ...currentMember, marital_status: e.target.value as CivilStatus })}
                    options={CIVIL_STATUS_OPTIONS}
                    error={errors.marital_status}
                  />

                  <FormSelect
                    label="Grado de Instrucción"
                    required
                    value={currentMember.education_level || ''}
                    onChange={(e) => setCurrentMember({ ...currentMember, education_level: e.target.value as EducationLevel })}
                    options={EDUCATION_LEVEL_OPTIONS}
                    error={errors.education_level}
                  />
                </div>

                {/* Ocupación */}
                <FormInput
                  label="Ocupación"
                  required
                  value={currentMember.occupation || ''}
                  onChange={(e) => setCurrentMember({ ...currentMember, occupation: e.target.value })}
                  placeholder="Ej: Comerciante, Profesor, Ama de casa, etc."
                  error={errors.occupation}
                />

                {/* Relación (Solo para Cónyuge, no para Jefe de Familia) */}
                {memberType === MemberType.SPOUSE && (
                  <FormSelect
                    label="Relación con el Solicitante"
                    value={currentMember.relationship || ''}
                    onChange={(e) => setCurrentMember({ ...currentMember, relationship: e.target.value as FamilyRelationship })}
                    options={FAMILY_RELATIONSHIP_OPTIONS}
                    placeholder="Seleccionar relación (opcional)"
                    hint="Este campo es opcional y se usa solo para referencia interna"
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'economic' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Información Económica
            </h3>

            {/* Situación Laboral y Condición */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Situación Laboral"
                required
                value={currentMember.employment_situation || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, employment_situation: e.target.value as EmploymentSituation })}
                options={EMPLOYMENT_SITUATION_OPTIONS}
                hint="¿Trabaja por cuenta propia o para alguien más?"
                error={errors.employment_situation}
              />

              <FormSelect
                label="Condición Laboral"
                required
                value={currentMember.employment_condition || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, employment_condition: e.target.value as EmploymentCondition })}
                options={EMPLOYMENT_CONDITION_OPTIONS}
                hint="¿Tiene contrato formal o trabaja informalmente?"
                error={errors.employment_condition}
              />
            </div>

            {/* Discapacidad e Ingreso Mensual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Tipo de Discapacidad"
                required
                value={currentMember.disability_type || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, disability_type: e.target.value as DisabilityType })}
                options={DISABILITY_TYPE_OPTIONS}
                error={errors.disability_type}
              />

              <FormInput
                type="number"
                label="Ingreso Mensual (S/.)"
                required
                value={currentMember.monthly_income || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, monthly_income: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
                step="0.01"
                error={errors.monthly_income}
              />
            </div>

            {/* Resumen de datos personales */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Resumen</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nombre:</strong> {currentMember.first_name} {currentMember.apellido_paterno} {currentMember.apellido_materno}</p>
                <p><strong>DNI:</strong> {currentMember.dni}</p>
                <p><strong>Ocupación:</strong> {currentMember.occupation}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'additional' && memberType === MemberType.ADDITIONAL_FAMILY && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              👥 Información Adicional del Grupo Familiar
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Información simplificada</p>
                  <p>Para miembros adicionales de la familia, solo se requieren datos básicos de identificación y vínculo familiar.</p>
                </div>
              </div>
            </div>

            {/* Vínculo Familiar */}
            <FormSelect
              label="Vínculo Familiar"
              required
              value={currentMember.family_bond || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, family_bond: e.target.value })}
              options={FAMILY_BOND_OPTIONS}
              placeholder="Seleccionar vínculo familiar"
              hint="Relación que tiene este miembro con el jefe de familia"
              error={errors.family_bond}
            />

            {/* Información opcional adicional */}
            <div className="border-t pt-4">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                📝 Información Adicional (Opcional)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  type="date"
                  label="Fecha de Nacimiento"
                  value={currentMember.birth_date || ''}
                  onChange={(e) => setCurrentMember({ ...currentMember, birth_date: e.target.value })}
                  hint="Opcional - solo si se conoce"
                />

                <FormSelect
                  label="Estado Civil"
                  value={currentMember.marital_status || ''}
                  onChange={(e) => setCurrentMember({ ...currentMember, marital_status: e.target.value as CivilStatus })}
                  options={CIVIL_STATUS_OPTIONS}
                  placeholder="Seleccionar (opcional)"
                  hint="Opcional"
                />
              </div>
            </div>

            {/* Resumen específico para familia adicional */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Resumen del Miembro Adicional</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nombre:</strong> {currentMember.first_name} {currentMember.apellido_paterno} {currentMember.apellido_materno}</p>
                <p><strong>DNI:</strong> {currentMember.dni}</p>
                <p><strong>Vínculo:</strong> {FAMILY_BOND_OPTIONS.find(b => b.value === currentMember.family_bond)?.label || 'Sin especificar'}</p>
                {currentMember.birth_date && (
                  <p><strong>Fecha de Nacimiento:</strong> {new Date(currentMember.birth_date).toLocaleDateString('es-PE')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'familyDependent' && memberType === MemberType.FAMILY_DEPENDENT && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              👥 Información de Carga Familiar
            </h3>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-orange-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-orange-800">
                  <p className="font-medium">Carga Familiar</p>
                  <p>Registra únicamente los datos básicos requeridos: vínculo familiar, educación y discapacidad. No se requiere información laboral.</p>
                </div>
              </div>
            </div>

            {/* Vínculo Familiar */}
            <FormSelect
              label="Vínculo Familiar"
              required
              value={currentMember.family_bond || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, family_bond: e.target.value })}
              options={FAMILY_BOND_OPTIONS}
              placeholder="Seleccionar vínculo familiar"
              hint="Relación que tiene este miembro con el jefe de familia"
              error={errors.family_bond}
            />

            {/* Grado de Instrucción */}
            <FormSelect
              label="Grado de Instrucción"
              required
              value={currentMember.education_level || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, education_level: e.target.value as EducationLevel })}
              options={EDUCATION_LEVEL_OPTIONS}
              placeholder="Seleccionar grado de instrucción"
              error={errors.education_level}
            />

            {/* Discapacidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discapacidad <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DISABILITY_TYPE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="disability_type"
                      value={option.value}
                      checked={currentMember.disability_type === option.value}
                      onChange={(e) => setCurrentMember({ ...currentMember, disability_type: e.target.value as DisabilityType })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.disability_type && (
                <p className="text-sm text-red-600 mt-1">{errors.disability_type}</p>
              )}
            </div>

            {/* Resumen específico para carga familiar */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Resumen de Carga Familiar</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nombre:</strong> {currentMember.first_name} {currentMember.apellido_paterno} {currentMember.apellido_materno}</p>
                <p><strong>DNI:</strong> {currentMember.dni}</p>
                <p><strong>Fecha de Nacimiento:</strong> {currentMember.birth_date ? new Date(currentMember.birth_date).toLocaleDateString('es-PE') : 'No especificada'}</p>
                <p><strong>Vínculo:</strong> {FAMILY_BOND_OPTIONS.find(b => b.value === currentMember.family_bond)?.label || 'Sin especificar'}</p>
                <p><strong>Educación:</strong> {EDUCATION_LEVEL_OPTIONS.find(e => e.value === currentMember.education_level)?.label || 'Sin especificar'}</p>
                <p><strong>Discapacidad:</strong> {DISABILITY_TYPE_OPTIONS.find(d => d.value === currentMember.disability_type)?.label || 'Sin especificar'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddMemberModal;