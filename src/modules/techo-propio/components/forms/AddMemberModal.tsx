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
  WorkCondition,
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
  WORK_CONDITION_OPTIONS,
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

  // ✅ NUEVO: Estado para modo manual (cuando RENIEC no encuentra el DNI)
  const [manualMode, setManualMode] = useState(false);
  const [manualDataConfirmed, setManualDataConfirmed] = useState(false);
  const [dniValidatedWithReniec, setDniValidatedWithReniec] = useState(false);

  // ✅ Determinar el tipo efectivo del miembro (prioridad: editingMember.member_type > prop memberType)
  const effectiveMemberType = (editingMember?.member_type || currentMember.member_type || memberType) as MemberType;

  React.useEffect(() => {
    if (isOpen) {
      const effectiveMemberType = editingMember?.member_type || memberType;
      setCurrentMember(editingMember || { member_type: effectiveMemberType });
      setActiveTab('personal');
      setErrors({});
      // ✅ NUEVO: Resetear estados de modo manual
      setManualMode(false);
      setManualDataConfirmed(false);
      // Si estamos editando, verificar si fue ingresado manualmente
      setDniValidatedWithReniec(editingMember?.is_manual_entry ? false : !!editingMember?.dni);
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

    // ✅ NUEVO: Validar confirmación en modo manual
    if (manualMode && !manualDataConfirmed) {
      newErrors.manual_confirmation = 'Debe confirmar que los datos ingresados son correctos';
    }

    // Validaciones para Carga Familiar (solo datos básicos)
    if (effectiveMemberType === MemberType.FAMILY_DEPENDENT) {
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
    else if (effectiveMemberType !== MemberType.ADDITIONAL_FAMILY) {
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
      if (!currentMember.work_condition && !currentMember.employment_condition) {
        newErrors.work_condition = 'Condición laboral es requerida';
      }
      if (!currentMember.disability_type) {
        newErrors.disability_type = 'Información de discapacidad es requerida';
      }
      if (currentMember.monthly_income === undefined || currentMember.monthly_income < 0) {
        newErrors.monthly_income = 'Ingreso mensual debe ser mayor o igual a 0';
      }
    }

    // Validación específica para familia adicional
    if (effectiveMemberType === MemberType.ADDITIONAL_FAMILY && !currentMember.family_bond?.trim()) {
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
        is_manual_entry: manualMode || currentMember.is_manual_entry || false, // ✅ NUEVO: Guardar si fue entrada manual
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
      apellido_materno,
      is_manual_entry: false // ✅ NUEVO: Marcar que fue validado con RENIEC
    });
    setDniValidatedWithReniec(true); // ✅ NUEVO: Marcar validación exitosa
  };

  // ✅ NUEVO: Handler para toggle de modo manual
  const handleManualModeToggle = () => {
    const newManualMode = !manualMode;
    setManualMode(newManualMode);

    if (newManualMode) {
      // Al activar modo manual, limpiar validación RENIEC
      setDniValidatedWithReniec(false);
      setManualDataConfirmed(false);
    } else {
      // Al desactivar modo manual, limpiar datos si no fueron validados
      if (!dniValidatedWithReniec) {
        setCurrentMember({
          ...currentMember,
          first_name: '',
          apellido_paterno: '',
          apellido_materno: '',
          is_manual_entry: false
        });
      }
    }
  };

  // ✅ NUEVO: Handler para cambio manual de DNI
  const handleManualDniChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 8);
    setCurrentMember({
      ...currentMember,
      dni: cleanValue,
      is_manual_entry: true // Marcar como entrada manual
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
    if (effectiveMemberType === MemberType.FAMILY_DEPENDENT) {
      if (!currentMember.birth_date) {
        personalErrors.birth_date = 'Fecha de nacimiento es requerida';
      }
    }
    // Validaciones adicionales solo para miembros completos
    else if (effectiveMemberType !== MemberType.ADDITIONAL_FAMILY) {
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
      if (effectiveMemberType === MemberType.FAMILY_DEPENDENT) {
        setActiveTab('familyDependent');
      }
      // Para familia adicional, ir a la pestaña adicional
      else if (effectiveMemberType === MemberType.ADDITIONAL_FAMILY) {
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

    // ✅ NUEVO: Si está en modo manual, debe confirmar los datos
    const manualModeValid = !manualMode || (manualMode && manualDataConfirmed);

    // Para carga familiar, necesita datos básicos + fecha de nacimiento
    if (effectiveMemberType === MemberType.FAMILY_DEPENDENT) {
      return basicPersonal && currentMember.birth_date && manualModeValid;
    }

    // Para familia adicional, solo necesita datos básicos
    if (effectiveMemberType === MemberType.ADDITIONAL_FAMILY) {
      return basicPersonal && manualModeValid;
    }

    // Para otros tipos, necesita todos los campos
    return (
      basicPersonal &&
      currentMember.birth_date &&
      currentMember.marital_status &&
      currentMember.education_level &&
      currentMember.occupation?.trim() &&
      manualModeValid
    );
  };

  const isEconomicDataComplete = () => {
    // Para familia adicional, no necesita datos económicos
    if (effectiveMemberType === MemberType.ADDITIONAL_FAMILY) {
      return true;
    }

    const basicComplete = (
      currentMember.employment_situation &&
      (currentMember.work_condition || currentMember.employment_condition) &&
      currentMember.disability_type &&
      currentMember.monthly_income !== undefined &&
      currentMember.monthly_income >= 0
    );

    return basicComplete;
  };

  const isAdditionalDataComplete = () => {
    // Solo para familia adicional
    if (effectiveMemberType === MemberType.ADDITIONAL_FAMILY) {
      return currentMember.family_bond?.trim();
    }
    return true;
  };

  const isFamilyDependentDataComplete = () => {
    // Solo para carga familiar
    if (effectiveMemberType === MemberType.FAMILY_DEPENDENT) {
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
            {effectiveMemberType === MemberType.FAMILY_DEPENDENT && (
              <div className={`w-3 h-3 rounded-full ${
                activeTab === 'familyDependent' ? 'bg-blue-600' : isFamilyDependentDataComplete() ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
            {effectiveMemberType !== MemberType.ADDITIONAL_FAMILY && effectiveMemberType !== MemberType.FAMILY_DEPENDENT && (
              <div className={`w-3 h-3 rounded-full ${
                activeTab === 'economic' ? 'bg-blue-600' : isEconomicDataComplete() ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
            {effectiveMemberType === MemberType.ADDITIONAL_FAMILY && (
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
          
          {effectiveMemberType === MemberType.FAMILY_DEPENDENT && (
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

          {effectiveMemberType !== MemberType.ADDITIONAL_FAMILY && effectiveMemberType !== MemberType.FAMILY_DEPENDENT && (
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

          {effectiveMemberType === MemberType.ADDITIONAL_FAMILY && (
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

            {/* ✅ NUEVO: Toggle para Modo Manual */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Modo de Ingreso Manual</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Active esta opción si el DNI no se encuentra en RENIEC (DNI nuevo o no registrado)
                    </p>
                  </div>
                </div>
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={handleManualModeToggle}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                    manualMode ? 'bg-amber-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={manualMode}
                  aria-label="Activar modo manual"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      manualMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {manualMode && (
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-xs text-amber-800 font-medium">
                    ⚠️ En modo manual, deberá ingresar todos los datos manualmente y confirmar su veracidad.
                  </p>
                </div>
              )}
            </div>

            {/* DNI - Condicional según modo */}
            {!manualMode ? (
              <>
                {/* DNI con validación RENIEC (modo normal) */}
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
              </>
            ) : (
              <>
                {/* DNI manual (sin validación RENIEC) */}
                <FormInput
                  label="DNI"
                  required
                  value={currentMember.dni || ''}
                  onChange={(e) => handleManualDniChange(e.target.value)}
                  placeholder="12345678"
                  maxLength={8}
                  error={errors.dni}
                  hint="Ingrese el DNI de 8 dígitos (modo manual)"
                />
                {currentMember.dni?.length === 8 && (
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>DNI ingresado manualmente - No validado con RENIEC</span>
                  </div>
                )}
              </>
            )}

            {/* Nombres completos - Editables según modo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Nombre(s)"
                required
                value={currentMember.first_name || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, first_name: e.target.value })}
                placeholder="María"
                error={errors.first_name}
                disabled={!manualMode && dniValidatedWithReniec}
                hint={!manualMode && dniValidatedWithReniec ? "Validado con RENIEC" : undefined}
              />

              <FormInput
                label="Apellido Paterno"
                required
                value={currentMember.apellido_paterno || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, apellido_paterno: e.target.value })}
                placeholder="García"
                error={errors.apellido_paterno}
                disabled={!manualMode && dniValidatedWithReniec}
                hint={!manualMode && dniValidatedWithReniec ? "Validado con RENIEC" : undefined}
              />

              <FormInput
                label="Apellido Materno"
                required
                value={currentMember.apellido_materno || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, apellido_materno: e.target.value })}
                placeholder="López"
                error={errors.apellido_materno}
                disabled={!manualMode && dniValidatedWithReniec}
                hint={!manualMode && dniValidatedWithReniec ? "Validado con RENIEC" : undefined}
              />
            </div>

            {/* ✅ NUEVO: Checkbox de confirmación para modo manual */}
            {manualMode && currentMember.dni?.length === 8 && currentMember.first_name?.trim() && currentMember.apellido_paterno?.trim() && currentMember.apellido_materno?.trim() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualDataConfirmed}
                    onChange={(e) => setManualDataConfirmed(e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  />
                  <span className="ml-3 text-sm text-blue-800">
                    <span className="font-medium">Confirmo que los datos ingresados son correctos</span>
                    <span className="block text-xs text-blue-600 mt-1">
                      Al marcar esta casilla, declaro que he verificado que el DNI y los nombres corresponden
                      a la persona que estoy registrando y que los datos son verídicos.
                    </span>
                  </span>
                </label>
                {errors.manual_confirmation && (
                  <p className="text-sm text-red-600 mt-2 ml-8">{errors.manual_confirmation}</p>
                )}
              </div>
            )}

            {/* Campos condicionales según el tipo de miembro */}
            
            {/* Solo fecha de nacimiento para ADDITIONAL_FAMILY y FAMILY_DEPENDENT */}
            {(effectiveMemberType === MemberType.ADDITIONAL_FAMILY || effectiveMemberType === MemberType.FAMILY_DEPENDENT) && (
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
            {(effectiveMemberType === MemberType.HEAD_OF_FAMILY || effectiveMemberType === MemberType.SPOUSE) && (
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
                {effectiveMemberType === MemberType.SPOUSE && (
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
                value={currentMember.work_condition || currentMember.employment_condition || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, work_condition: e.target.value as WorkCondition, employment_condition: undefined })}
                options={WORK_CONDITION_OPTIONS}
                hint="¿Tiene contrato formal o trabaja informalmente?"
                error={errors.work_condition}
              />
            </div>

            {/* Discapacidad e Ingreso Mensual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Tipo de Discapacidad"
                required
                value={currentMember.disability_type || ''}
                onChange={(e) => {
                  const newDisabilityType = e.target.value as DisabilityType;
                  // Si cambia a "Ninguna", limpiar los campos de permanente y severa
                  if (newDisabilityType === DisabilityType.NONE) {
                    setCurrentMember({
                      ...currentMember,
                      disability_type: newDisabilityType,
                      disability_is_permanent: false,
                      disability_is_severe: false
                    });
                  } else {
                    setCurrentMember({ ...currentMember, disability_type: newDisabilityType });
                  }
                }}
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

            {/* ✅ NUEVO: Checkboxes de Permanente y Severa - Solo si tiene discapacidad */}
            {currentMember.disability_type && currentMember.disability_type !== DisabilityType.NONE && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-3">Características de la Discapacidad</h4>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentMember.disability_is_permanent || false}
                      onChange={(e) => setCurrentMember({ ...currentMember, disability_is_permanent: e.target.checked })}
                      className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Permanente
                      <span className="block text-xs text-gray-500 font-normal">La discapacidad es de carácter permanente</span>
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentMember.disability_is_severe || false}
                      onChange={(e) => setCurrentMember({ ...currentMember, disability_is_severe: e.target.checked })}
                      className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Severa
                      <span className="block text-xs text-gray-500 font-normal">La discapacidad es de grado severo</span>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Resumen de datos personales */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Resumen</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nombre:</strong> {currentMember.first_name} {currentMember.apellido_paterno} {currentMember.apellido_materno}</p>
                <p>
                  <strong>DNI:</strong> {currentMember.dni}
                  {/* ✅ NUEVO: Indicador de entrada manual */}
                  {(manualMode || currentMember.is_manual_entry) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      Ingreso Manual
                    </span>
                  )}
                  {!manualMode && dniValidatedWithReniec && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Validado RENIEC
                    </span>
                  )}
                </p>
                <p><strong>Ocupación:</strong> {currentMember.occupation}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'additional' && effectiveMemberType === MemberType.ADDITIONAL_FAMILY && (
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

            {/* Información opcional adicional REMOVIDA - Solo campos obligatorios para Familia Adicional */}

            {/* Resumen específico para familia adicional - Solo datos obligatorios */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Resumen del Miembro Adicional</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nombre:</strong> {currentMember.first_name} {currentMember.apellido_paterno} {currentMember.apellido_materno}</p>
                <p>
                  <strong>DNI:</strong> {currentMember.dni}
                  {/* ✅ NUEVO: Indicador de entrada manual */}
                  {(manualMode || currentMember.is_manual_entry) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      Ingreso Manual
                    </span>
                  )}
                  {!manualMode && dniValidatedWithReniec && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Validado RENIEC
                    </span>
                  )}
                </p>
                <p><strong>Vínculo:</strong> {FAMILY_BOND_OPTIONS.find(b => b.value === currentMember.family_bond)?.label || 'Sin especificar'}</p>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                ℹ️ <strong>Información simplificada:</strong> Para miembros adicionales de la familia, solo se requieren datos básicos de identificación y vínculo familiar.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'familyDependent' && effectiveMemberType === MemberType.FAMILY_DEPENDENT && (
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
                      onChange={(e) => {
                        const newDisabilityType = e.target.value as DisabilityType;
                        // Si cambia a "Ninguna", limpiar los campos de permanente y severa
                        if (newDisabilityType === DisabilityType.NONE) {
                          setCurrentMember({
                            ...currentMember,
                            disability_type: newDisabilityType,
                            disability_is_permanent: false,
                            disability_is_severe: false
                          });
                        } else {
                          setCurrentMember({ ...currentMember, disability_type: newDisabilityType });
                        }
                      }}
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

            {/* ✅ NUEVO: Checkboxes de Permanente y Severa - Solo si tiene discapacidad */}
            {currentMember.disability_type && currentMember.disability_type !== DisabilityType.NONE && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-3">Características de la Discapacidad</h4>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentMember.disability_is_permanent || false}
                      onChange={(e) => setCurrentMember({ ...currentMember, disability_is_permanent: e.target.checked })}
                      className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Permanente
                      <span className="block text-xs text-gray-500 font-normal">La discapacidad es de carácter permanente</span>
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentMember.disability_is_severe || false}
                      onChange={(e) => setCurrentMember({ ...currentMember, disability_is_severe: e.target.checked })}
                      className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Severa
                      <span className="block text-xs text-gray-500 font-normal">La discapacidad es de grado severo</span>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Resumen específico para carga familiar */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Resumen de Carga Familiar</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nombre:</strong> {currentMember.first_name} {currentMember.apellido_paterno} {currentMember.apellido_materno}</p>
                <p>
                  <strong>DNI:</strong> {currentMember.dni}
                  {/* ✅ NUEVO: Indicador de entrada manual */}
                  {(manualMode || currentMember.is_manual_entry) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      Ingreso Manual
                    </span>
                  )}
                  {!manualMode && dniValidatedWithReniec && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Validado RENIEC
                    </span>
                  )}
                </p>
                <p><strong>Fecha de Nacimiento:</strong> {currentMember.birth_date ? new Date(currentMember.birth_date).toLocaleDateString('es-PE') : 'No especificada'}</p>
                <p><strong>Vínculo:</strong> {FAMILY_BOND_OPTIONS.find(b => b.value === currentMember.family_bond)?.label || 'Sin especificar'}</p>
                <p><strong>Educación:</strong> {EDUCATION_LEVEL_OPTIONS.find(e => e.value === currentMember.education_level)?.label || 'Sin especificar'}</p>
                <p>
                  <strong>Discapacidad:</strong> {DISABILITY_TYPE_OPTIONS.find(d => d.value === currentMember.disability_type)?.label || 'Sin especificar'}
                  {currentMember.disability_type && currentMember.disability_type !== DisabilityType.NONE && (
                    <span className="ml-2 text-amber-600">
                      {currentMember.disability_is_permanent && '(Permanente)'}
                      {currentMember.disability_is_permanent && currentMember.disability_is_severe && ' '}
                      {currentMember.disability_is_severe && '(Severa)'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddMemberModal;
