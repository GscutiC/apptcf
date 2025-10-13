/**
 * EditApplication Page - Wizard multi-step para editar solicitud existente
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTechoPropio } from '../context';
import { useTechoPropioApplications } from '../hooks';
import { Card, Button, Modal } from '../components/common';
import {
  ApplicationInfoStep,
  ApplicantForm,
  HouseholdForm,
  PropertyForm,
  ReviewStep
} from '../components/forms';
import { ApplicationFormData } from '../types';
import { validateApplicantForm, validateEconomicForm, validatePropertyForm } from '../utils';
import { getHouseholdMembers } from '../utils/applicationHelpers';

export const EditApplication: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedApplication, fetchApplication, isLoading: contextLoading } = useTechoPropio();
  const { updateApplication, isLoading: updateLoading } = useTechoPropioApplications();
  const [currentStep, setCurrentStep] = useState(0);  // Iniciar en paso 0
  const [formData, setFormData] = useState<ApplicationFormData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [exitModal, setExitModal] = useState(false);

  const isLoading = contextLoading || updateLoading;

  // Cargar solicitud al montar
  useEffect(() => {
    if (id) {
      fetchApplication(id);
    }
  }, [id]);

  // Poblar formulario cuando se cargue la solicitud
  useEffect(() => {
    if (selectedApplication) {
      // ✅ CORREGIDO: Buscar jefe de familia en TODOS los campos posibles (backend envía con diferentes nombres)
      const headOfFamilyFromAPI: any = 
        selectedApplication.head_of_family ||      // Nombre nuevo del backend
        selectedApplication.main_applicant ||      // Nombre en MongoDB (legacy)
        selectedApplication.applicant;              // Nombre antiguo del frontend
      
      // Buscar también en household_members como fallback (si está ahí)
      const headOfFamilyFromHousehold: any = selectedApplication.household_members?.find(
        (member: any) => 
          member.member_type?.toString().includes('HEAD') || 
          member.member_type?.toString() === 'JEFE_FAMILIA' ||
          member.relationship === 'jefe_familia' ||
          member.document_number === headOfFamilyFromAPI?.document_number
      );
      
      // ✅ PRIORIDAD: Usar el del API primero, luego el de household_members
      const realHeadOfFamily: any = headOfFamilyFromAPI || headOfFamilyFromHousehold;
      
      // Mapear datos de la solicitud existente al formato del formulario
      const mappedData: ApplicationFormData = {
        // ✅ Paso 0: Información de la solicitud
        application_info: {
          registration_date: selectedApplication.registration_date || selectedApplication.created_at || new Date().toLocaleDateString('es-PE'),
          convocation_code: selectedApplication.convocation_code || '',
          registration_year: selectedApplication.registration_year || new Date(selectedApplication.created_at || new Date()).getFullYear(),
          application_number: selectedApplication.code,
          sequential_number: selectedApplication.sequential_number || parseInt(selectedApplication.code?.split('-').pop() || '0')
        },
        
        // ✅ Paso 1: Solicitante - SOLO datos básicos de contacto (simplificado)
        head_of_family: {
          // ✅ CORREGIDO: Mapeo flexible de todos los campos posibles
          document_number: realHeadOfFamily?.document_number || realHeadOfFamily?.dni || '',
          dni: realHeadOfFamily?.document_number || realHeadOfFamily?.dni || '',
          first_name: realHeadOfFamily?.first_name || '',
          paternal_surname: realHeadOfFamily?.paternal_surname || realHeadOfFamily?.apellido_paterno || '',
          maternal_surname: realHeadOfFamily?.maternal_surname || realHeadOfFamily?.apellido_materno || '',
          phone_number: realHeadOfFamily?.phone_number || realHeadOfFamily?.phone || '',
          email: realHeadOfFamily?.email || '',
          // ✅ Campos completos para Paso 2 (ahora sí los incluimos para que estén disponibles)
          birth_date: realHeadOfFamily?.birth_date || '',
          civil_status: realHeadOfFamily?.civil_status || 'soltero',
          education_level: realHeadOfFamily?.education_level || 'secundaria_completa',
          occupation: realHeadOfFamily?.occupation || '',
          disability_type: realHeadOfFamily?.disability_type || 'ninguna'
        },
        
        // ✅ Paso 2: Grupo Familiar
        // Transformar household_members del backend al formato del frontend
        household_members: (() => {
          const allMembers: any[] = [];
          
          // 1️⃣ PRIMERO: Agregar al jefe de familia (que NO viene en household_members del backend)
          if (realHeadOfFamily) {
            allMembers.push({
              dni: realHeadOfFamily.document_number || realHeadOfFamily.dni,
              first_name: realHeadOfFamily.first_name,
              apellido_paterno: realHeadOfFamily.paternal_surname,
              apellido_materno: realHeadOfFamily.maternal_surname,
              birth_date: realHeadOfFamily.birth_date,
              marital_status: realHeadOfFamily.civil_status,
              education_level: realHeadOfFamily.education_level,
              occupation: realHeadOfFamily.occupation,
              disability_type: realHeadOfFamily.disability_type,
              member_type: 'HEAD_OF_FAMILY',  // ✅ Enum correcto
              relationship: 'jefe_familia',
              // Info económica desde head_of_family_economic
              employment_situation: (selectedApplication as any).head_of_family_economic?.employment_situation || 
                                   (selectedApplication as any).main_applicant_economic?.employment_situation || 
                                   (selectedApplication as any).economic_info?.employment_situation || 
                                   'dependiente',
              work_condition: (selectedApplication as any).head_of_family_economic?.work_condition || 
                             (selectedApplication as any).main_applicant_economic?.work_condition || 
                             (selectedApplication as any).economic_info?.work_condition || 
                             'formal',
              monthly_income: (selectedApplication as any).head_of_family_economic?.monthly_income || 
                             (selectedApplication as any).main_applicant_economic?.monthly_income || 
                             (selectedApplication as any).economic_info?.monthly_income || 
                             0,
              employment_condition: ((selectedApplication as any).head_of_family_economic?.work_condition || 
                                   (selectedApplication as any).main_applicant_economic?.work_condition || 
                                   'FORMAL').toUpperCase() as any,
              family_bond: 'jefe_familia',
              is_dependent: false  // Jefe de familia no es dependiente
            });
          }
          
          // 2️⃣ SEGUNDO: Obtener y transformar household_members del backend
          const membersFromBackend = getHouseholdMembers(selectedApplication);
          
          if (membersFromBackend && membersFromBackend.length > 0) {
            // Transformar cada miembro del formato backend al frontend
            const transformedMembers = membersFromBackend.map((member: any) => {
              // ✅ PRIORIDAD 1: Si el backend ya tiene member_type válido, usarlo
              let memberType = member.member_type;
              
              // ✅ PRIORIDAD 2: Si no hay member_type, derivarlo desde relationship
              if (!memberType) {
                const rel = (member.relationship || '').toLowerCase();
                
                if (rel === 'jefe_familia' || rel === 'jefe de familia' || rel === 'head_of_family') {
                  memberType = 'HEAD_OF_FAMILY';
                } else if (rel === 'conyuge' || rel === 'cónyuge' || rel === 'spouse') {
                  memberType = 'SPOUSE';
                } else if (rel === 'hijo' || rel === 'hija' || rel === 'dependiente') {
                  memberType = 'FAMILY_DEPENDENT';
                } else if (rel === 'otro') {
                  // 🔍 Heurística mejorada para relationship='otro':
                  // PRIORIDAD 1: Edad (más confiable que is_dependent histórico)
                  const birthDate = member.birth_date ? new Date(member.birth_date) : null;
                  const age = birthDate ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
                  
                  if (age !== null) {
                    // Menores de 18 → siempre DEPENDENT
                    // Entre 18-24 con is_dependent=true → DEPENDENT
                    // 25 años o más → ADDITIONAL_FAMILY
                    if (age < 18) {
                      memberType = 'FAMILY_DEPENDENT';
                    } else if (age < 25 && member.is_dependent) {
                      memberType = 'FAMILY_DEPENDENT';
                    } else {
                      memberType = 'ADDITIONAL_FAMILY';
                    }
                  } else {
                    // Si no hay edad, usar is_dependent
                    memberType = member.is_dependent ? 'FAMILY_DEPENDENT' : 'ADDITIONAL_FAMILY';
                  }
                } else {
                  memberType = 'ADDITIONAL_FAMILY';
                }
              }
              
              return {
                // ✅ Mapeo backend -> frontend
                dni: member.document_number || member.dni || '',
                first_name: member.first_name || '',
                apellido_paterno: member.paternal_surname || member.apellido_paterno || '',
                apellido_materno: member.maternal_surname || member.apellido_materno || '',
                birth_date: member.birth_date || '',
                marital_status: member.civil_status || member.marital_status || 'soltero',
                education_level: member.education_level || 'secundaria_completa',
                occupation: member.occupation || '',
                disability_type: member.disability_type || 'ninguna',
                member_type: memberType,
                relationship: member.relationship || 'otro',
                // Info económica
                employment_situation: member.employment_situation || 'dependiente',
                work_condition: member.work_condition || 'formal',
                monthly_income: member.monthly_income || 0,
                employment_condition: (member.work_condition || 'FORMAL').toUpperCase() as any,
                family_bond: member.relationship || member.family_bond || '',
                is_dependent: member.is_dependent !== undefined ? member.is_dependent : true
              };
            });
            
            // Agregar miembros transformados al array
            allMembers.push(...transformedMembers);
          }
          
          console.log('📋 [EDIT APPLICATION] Total miembros cargados (incluyendo jefe):', allMembers.length);
          allMembers.forEach((m, idx) => {
            console.log(`  ${idx + 1}. ${m.first_name} ${m.apellido_paterno} - member_type: ${m.member_type}, relationship: ${m.relationship}, is_dependent: ${m.is_dependent}`);
          });
          
          return allMembers;
        })() as any,
        
        // ✅ Paso 3: Información del Predio
        property_info: selectedApplication.property_info,
        
        // Otros datos
        comments: selectedApplication.comments || ''
      };
      
      setFormData(mappedData);
    }
  }, [selectedApplication]);

  const totalSteps = 5;

  const updateFormData = (partialData: Partial<ApplicationFormData>) => {
    setFormData((prev) => (prev ? { ...prev, ...partialData } : null));
  };

  const validateCurrentStep = (): boolean => {
    if (!formData) return false;

    const stepErrors: string[] = [];

    switch (currentStep) {
      case 0:
        // Paso 0: Información - validaciones básicas
        if (!formData.application_info || !formData.application_info.convocation_code) {
          stepErrors.push('Debe seleccionar una convocatoria');
        }
        break;
      case 1:
        // Paso 1: Solicitante - VALIDACIÓN SIMPLIFICADA (solo datos básicos)
        if (!formData.head_of_family) {
          stepErrors.push('Debe completar los datos básicos del solicitante');
        } else {
          if (!formData.head_of_family.dni && !formData.head_of_family.document_number) {
            stepErrors.push('DNI del solicitante es obligatorio');
          }
          if (!formData.head_of_family.first_name || formData.head_of_family.first_name.trim().length < 2) {
            stepErrors.push('Nombres del solicitante son obligatorios');
          }
          if (!formData.head_of_family.phone_number || formData.head_of_family.phone_number.length < 9) {
            stepErrors.push('El teléfono es obligatorio (9 dígitos)');
          }
          if (!formData.head_of_family.email || !formData.head_of_family.email.includes('@')) {
            stepErrors.push('El correo electrónico es obligatorio y debe ser válido');
          }
        }
        break;
      case 2:
        // Paso 2: Grupo Familiar
        // Validaciones opcionales del grupo familiar
        if (formData.household_members && formData.household_members.length > 0) {
          formData.household_members.forEach((member, idx) => {
            if (!member.dni || !member.first_name) {
              stepErrors.push(`Miembro ${idx + 1}: Faltan datos obligatorios`);
            }
          });
        }
        break;
      case 3:
        // Paso 3: Predio
        if (!formData.property_info) {
          stepErrors.push('Debe completar los datos del predio');
        } else {
          const propertyErrors = validatePropertyForm(formData.property_info);
          stepErrors.push(...propertyErrors);
        }
        break;
      case 4:
        // Paso 4: Revisión Final
        if (!formData.head_of_family || !formData.property_info) {
          stepErrors.push('Faltan datos obligatorios en la solicitud');
        }
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {  // Último paso es 4
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {  // Permitir retroceder hasta paso 0
      setCurrentStep((prev) => prev - 1);
      setErrors([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!id || !formData || !validateCurrentStep()) {
      return;
    }

    // Validación final
    if (!formData.head_of_family || !formData.head_of_family_economic || !formData.property_info) {
      setErrors(['Faltan datos obligatorios en la solicitud']);
      return;
    }

    // Preparar datos para el backend con nueva estructura
    const requestData = {
      user_data: formData.user_data,
      head_of_family: formData.head_of_family,
      spouse: formData.spouse,
      household_members: formData.household_members || [],
      head_of_family_economic: formData.head_of_family_economic,
      spouse_economic: formData.spouse_economic,
      property_info: formData.property_info,
      comments: formData.comments
    };

    const result = await updateApplication(id, requestData);

    if (result) {
      // Navegar a la vista de detalle
      navigate(`/techo-propio/ver/${id}`);
    } else {
      setErrors(['Error al actualizar la solicitud. Por favor, intente nuevamente.']);
    }
  };

  const handleExit = () => {
    setExitModal(true);
  };

  const confirmExit = () => {
    navigate(`/techo-propio/ver/${id}`);
  };

  const renderStep = () => {
    if (!formData) {
      return null;
    }

    switch (currentStep) {
      case 0:
        // Paso 0: Información de la Solicitud
        return (
          <ApplicationInfoStep
            data={{
              registration_date: formData.application_info?.registration_date || new Date().toLocaleDateString('es-PE'),
              convocation_code: formData.application_info?.convocation_code || '',
              registration_year: formData.application_info?.registration_year || new Date().getFullYear(),
              application_number: formData.application_info?.application_number || ''
            }}
            onChange={(application_info) => updateFormData({ application_info })}
            errors={errors}
          />
        );
      case 1:
        // Paso 1: Solicitante - SIMPLIFICADO (solo datos básicos de contacto)
        return (
          <ApplicantForm
            data={{
              dni: formData.head_of_family?.dni || formData.head_of_family?.document_number || '',
              first_name: formData.head_of_family?.first_name || '',
              last_name: `${formData.head_of_family?.paternal_surname || ''} ${formData.head_of_family?.maternal_surname || ''}`.trim(),
              phone: formData.head_of_family?.phone_number || '',
              email: formData.head_of_family?.email || ''
              // ✅ Campos eliminados (se capturan en Paso 2):
              // birth_date, marital_status, current_address
            }}
            onChange={(applicant) => updateFormData({ 
              head_of_family: {
                ...formData.head_of_family, // Preservar datos existentes
                document_number: applicant.dni,
                dni: applicant.dni,
                first_name: applicant.first_name,
                paternal_surname: applicant.last_name?.split(' ')[0] || '',
                maternal_surname: applicant.last_name?.split(' ')[1] || '',
                phone_number: applicant.phone,
                email: applicant.email
                // ✅ No sobrescribir birth_date, civil_status que vienen del Paso 2
              }
            })}
          />
        );
      case 2:
        // Paso 2: Grupo Familiar
        return (
          <HouseholdForm
            data={formData.household_members || []}
            onChange={(household_members: any) => updateFormData({ household_members })}
          />
        );
      case 3:
        // Paso 3: Información del Predio
        return (
          <PropertyForm
            data={formData.property_info || {}}
            onChange={(property_info) => updateFormData({ property_info })}
          />
        );
      case 4:
        // Paso 4: Revisión Final
        return (
          <ReviewStep
            data={formData}
            onEdit={(step) => setCurrentStep(step)}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">No se pudo cargar la solicitud</p>
        <Button onClick={() => navigate('/techo-propio/solicitudes')} className="mt-4">
          Volver a la Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Solicitud</h1>
          <p className="text-gray-600 mt-1">
            {selectedApplication?.code || 'Modificando solicitud'}
          </p>
        </div>
        <Button variant="ghost" onClick={handleExit} size="sm">
          Cancelar
        </Button>
      </div>

      {/* Stepper */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          {[0, 1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step === currentStep
                      ? 'bg-blue-600 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step < currentStep ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step === 0 ? 'ℹ️' : step
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    step === currentStep
                      ? 'text-blue-600'
                      : step < currentStep
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step === 0 && 'Información'}
                  {step === 1 && 'Solicitante'}
                  {step === 2 && 'Grupo Familiar'}
                  {step === 3 && 'Predio'}
                  {step === 4 && 'Revisión'}
                </span>
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-colors ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-red-800 mb-1">
                Por favor corrija los siguientes errores:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form Step Content */}
      <Card>{renderStep()}</Card>

      {/* Navigation Buttons */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
          >
            ← Anterior
          </Button>

          <div className="text-sm text-gray-600">
            Paso {currentStep + 1} de 5
          </div>

          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Siguiente →
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={exitModal}
        onClose={() => setExitModal(false)}
        title="Cancelar Edición"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExitModal(false)}>
              Continuar Editando
            </Button>
            <Button variant="danger" onClick={confirmExit}>
              Descartar Cambios
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          ¿Está seguro de cancelar? Los cambios no guardados se perderán.
        </p>
      </Modal>
    </div>
  );
};

export default EditApplication;
