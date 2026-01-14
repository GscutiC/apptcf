/**
 * NewApplication Page - Wizard multi-step para crear nueva solicitud
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTechoPropioApplications, useValidation } from '../hooks';
import { useTechoPropio } from '../context';
import { Card, Button, Modal } from '../components/common';
import {
  ApplicationInfoStep,
  ApplicantForm,
  HouseholdForm,
  EconomicForm,
  PropertyForm,
  ReviewStep
} from '../components/forms';
import { ApplicationFormData, MemberType } from '../types';
import { storageService } from '../services';
import { validateApplicantForm, validateEconomicForm, validatePropertyForm } from '../utils';
import { normalizeToISODate } from '../utils/applicationHelpers';

const INITIAL_FORM_DATA: ApplicationFormData = {
  application_info: {
    registration_date: new Date().toLocaleDateString('es-PE'),
    convocation_code: '',
    registration_year: new Date().getFullYear()
  },
  // Separación de datos: usuario (control) vs jefe de familia (oficial)
  user_data: undefined,          // Paso 1: Datos de usuario (control interno)
  head_of_family: undefined,     // Paso 2: Jefe de familia real
  spouse: undefined,             // Paso 2: Cónyuge 
  household_members: [],         // Paso 2: Carga familiar
  property_info: undefined,      // Paso 3: Información del predio
  head_of_family_economic: undefined,  // Paso 4: Info económica jefe de familia
  spouse_economic: undefined,    // Paso 4: Info económica cónyuge
  comments: ''
};

export const NewApplication: React.FC = () => {
  const navigate = useNavigate();
  const { createApplication, isLoading, error: apiError } = useTechoPropioApplications();
  const { validateDNI } = useValidation();
  const { selectApplication } = useTechoPropio();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<string[]>([]);
  const [exitModal, setExitModal] = useState(false);
  const [isValidatingDNI, setIsValidatingDNI] = useState(false);

  // Cargar borrador desde localStorage al montar
  useEffect(() => {
    const draft = storageService.loadDraft();
    if (draft) {
      // Preguntar si quiere continuar con el borrador
      const continueWithDraft = window.confirm(
        'Se encontró un borrador guardado. ¿Desea continuar con él?'
      );
      if (continueWithDraft) {
        setFormData(draft.data);
        setCurrentStep(draft.currentStep);
      } else {
        storageService.clearDraft();
      }
    }
  }, []);

  // Auto-guardar borrador cada vez que cambia formData
  useEffect(() => {
    if (currentStep > 0) { // No guardar en el paso 0 si está vacío
      storageService.saveDraft(formData, currentStep);
    }
  }, [formData, currentStep]);

  const totalSteps = 5;  // Total steps: 0, 1, 2, 3, 4 = 5 steps
  const lastStepIndex = 4;  // Last step index (0-based)

  const updateFormData = (partialData: Partial<ApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...partialData }));
  };

  // Función para generar DNI único para testing
  const generateUniqueDNI = (): string => {
    const timestamp = Date.now().toString();
    // Tomar los últimos 8 dígitos del timestamp
    const dni = timestamp.slice(-8);
    return dni;
  };

  // Función para mostrar mensaje más claro sobre DNI duplicado
  const handleDNIDuplicateError = (errorDetail: string) => {
    let userFriendlyMessage = 'DNI duplicado detectado';
    
    if (errorDetail.includes('DNI')) {
      // Extraer el DNI del mensaje de error
      const dniMatch = errorDetail.match(/DNI (\d{8})/);
      if (dniMatch) {
        const dni = dniMatch[1];
        userFriendlyMessage = `⚠️ El DNI ${dni} ya está registrado en otra solicitud.

🔧 SOLUCIÓN RÁPIDA:
• Haga clic en "Generar DNIs Únicos" para datos de prueba
• O cambie manualmente los DNIs por otros números

💡 Para uso real: Verifique que los DNIs sean correctos`;
      }
    }
    
    setErrors([userFriendlyMessage]);
  };

  // Función para auto-generar DNIs únicos
  const generateUniqueDNIs = () => {
    const newFormData = { ...formData };
    let generatedCount = 0;
    
    // Generar DNI único para datos de usuario
    if (newFormData.user_data) {
      newFormData.user_data.dni = generateUniqueDNI();
      generatedCount++;
    }
    
    // Generar DNI único para jefe de familia
    if (newFormData.head_of_family) {
      newFormData.head_of_family.dni = generateUniqueDNI();
      generatedCount++;
    }
    
    // Generar DNI único para cónyuge
    if (newFormData.spouse) {
      newFormData.spouse.dni = generateUniqueDNI();
      generatedCount++;
    }
    
    // Generar DNIs únicos para miembros del hogar
    if (newFormData.household_members) {
      newFormData.household_members = newFormData.household_members.map((member) => ({
        ...member,
        dni: generateUniqueDNI()
      }));
      generatedCount += newFormData.household_members.length;
    }
    
    // Actualizar formulario y limpiar errores
    setFormData(newFormData);
    setErrors([]); 
    
    // Mensaje de confirmación detallado
    const message = `✅ ¡DNIs únicos generados!

📊 Resumen:
• ${generatedCount} DNI${generatedCount > 1 ? 's' : ''} actualizado${generatedCount > 1 ? 's' : ''}
• Errores de duplicación eliminados
• Formulario listo para enviar

🎯 Puede proceder con el envío de la solicitud.`;
    
    alert(message);
    
    // Auto-scroll al botón de envío si estamos en el último paso
    if (currentStep === lastStepIndex) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: string[] = [];

    switch (currentStep) {
      case 1:
        if (!formData.head_of_family) {
          stepErrors.push('Debe completar los datos básicos del solicitante');
        } else {
          if (!formData.head_of_family.dni || formData.head_of_family.dni.length !== 8) {
            stepErrors.push('DNI debe tener 8 dígitos');
          }
          if (!formData.head_of_family.first_name || formData.head_of_family.first_name.trim().length < 2) {
            stepErrors.push('Los nombres son obligatorios');
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
        if (!formData.head_of_family) {
          stepErrors.push('Debe completar los datos del jefe de familia');
        } else {
          if (!formData.head_of_family.dni || formData.head_of_family.dni.length !== 8) {
            stepErrors.push('DNI del jefe de familia debe tener 8 dígitos');
          }
          if (!formData.head_of_family.first_name || formData.head_of_family.first_name.trim().length < 2) {
            stepErrors.push('Nombres del jefe de familia son obligatorios');
          }
        }
        
        if (formData.spouse) {
          if (!formData.spouse.dni || formData.spouse.dni.length !== 8) {
            stepErrors.push('DNI del cónyuge debe tener 8 dígitos');
          }
        }
        
        if (formData.household_members && formData.household_members.length > 0) {
          formData.household_members.forEach((member, idx) => {
            if (!member.dni || !member.first_name || !member.apellido_paterno || !member.apellido_materno) {
              stepErrors.push(`Miembro ${idx + 1}: Faltan datos obligatorios`);
            }
          });
        }
        break;
      case 3:
        if (!formData.property_info) {
          stepErrors.push('Debe completar los datos del predio');
        } else {
          const propertyErrors = validatePropertyForm(formData.property_info);
          stepErrors.push(...propertyErrors);
        }
        break;
      case 4:
        if (!formData.head_of_family || !formData.property_info) {
          stepErrors.push('Faltan datos obligatorios en la solicitud');
        }
        // Validar que haya al menos el jefe de familia con info económica
        const headOfFamily = formData.household_members?.find(member => 
          member.member_type?.toString().includes('HEAD') || 
          member.first_name === formData.head_of_family?.first_name
        );
        if (!headOfFamily || headOfFamily.monthly_income === undefined) {
          stepErrors.push('Debe completar la información económica del jefe de familia');
        }
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < lastStepIndex) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setErrors([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    const headOfFamilyMember = formData.household_members?.find(member =>
      member.first_name === formData.head_of_family?.first_name &&
      member.apellido_paterno === formData.head_of_family?.paternal_surname
    );

    if (!formData.head_of_family || !formData.property_info) {
      setErrors(['Faltan datos obligatorios en la solicitud']);
      return;
    }
    
    if (!headOfFamilyMember || headOfFamilyMember.monthly_income === undefined) {
      setErrors(['Debe completar la información económica del jefe de familia en el Paso 2']);
      return;
    }

    const transformedUserData = {
      dni: formData.head_of_family.dni || formData.head_of_family.document_number,
      names: formData.head_of_family.first_name,
      surnames: `${formData.head_of_family.paternal_surname} ${formData.head_of_family.maternal_surname}`.trim(),
      phone: formData.head_of_family.phone_number || '',
      email: formData.head_of_family.email || '',
      birth_date: normalizeToISODate(formData.head_of_family.birth_date),
      notes: 'Datos ingresados desde formulario web - Nueva solicitud Techo Propio'
    };

    const transformedHeadOfFamily = {
      document_type: 'dni',
      document_number: formData.head_of_family?.document_number || '',
      first_name: formData.head_of_family?.first_name || '',
      paternal_surname: formData.head_of_family?.paternal_surname || 'Sin Apellido',
      maternal_surname: formData.head_of_family?.maternal_surname || 'Sin Apellido',
      birth_date: normalizeToISODate(formData.head_of_family?.birth_date),
      // ✅ FIX: Priorizar el estado civil del household_members (actualizado en paso 2) sobre el inicial
      civil_status: headOfFamilyMember?.marital_status || formData.head_of_family?.civil_status || 'soltero',
      education_level: headOfFamilyMember?.education_level || formData.head_of_family?.education_level || 'secundaria_completa',
      occupation: headOfFamilyMember?.occupation || formData.head_of_family?.occupation,
      phone_number: formData.head_of_family?.phone_number,
      email: formData.head_of_family?.email,
      disability_type: headOfFamilyMember?.disability_type || formData.head_of_family?.disability_type || 'ninguna',
      disability_is_permanent: headOfFamilyMember?.disability_is_permanent || formData.head_of_family?.disability_is_permanent || false,
      disability_is_severe: headOfFamilyMember?.disability_is_severe || formData.head_of_family?.disability_is_severe || false,
      is_main_applicant: true
    };

    const transformedHeadOfFamilyEconomic = {
      employment_situation: headOfFamilyMember?.employment_situation || 'dependiente',
      monthly_income: headOfFamilyMember?.monthly_income || 0,
      work_condition: headOfFamilyMember?.work_condition || (headOfFamilyMember?.employment_condition?.toLowerCase() as any) || 'formal',
      occupation_detail: headOfFamilyMember?.occupation || 'Trabajador',
      has_additional_income: false,
      additional_income_amount: undefined,
      additional_income_source: undefined,
      employer_name: undefined,
      is_main_applicant: true
    };
    
    // ✅ FIX: Buscar cónyuge con múltiples condiciones
    const spouseMember = formData.household_members?.find(member =>
      member.member_type === MemberType.SPOUSE ||
      member.member_type?.toString() === 'CONYUGE' ||
      member.member_type?.toString().toUpperCase().includes('SPOUSE') ||
      member.family_bond === 'conyuge' ||
      (member.relationship as string) === 'conyuge'
    );

    // ✅ NUEVO: Transformar datos del cónyuge correctamente
    const transformedSpouse = spouseMember ? {
      document_type: 'dni',
      document_number: spouseMember.dni || '',
      first_name: spouseMember.first_name || '',
      paternal_surname: spouseMember.apellido_paterno || '',
      maternal_surname: spouseMember.apellido_materno || '',
      birth_date: normalizeToISODate(spouseMember.birth_date),
      civil_status: spouseMember.marital_status || 'soltero',
      education_level: spouseMember.education_level || 'secundaria_completa',
      occupation: spouseMember.occupation || '',
      disability_type: spouseMember.disability_type || 'ninguna',
      disability_is_permanent: spouseMember.disability_is_permanent || false,  // ✅ NUEVO
      disability_is_severe: spouseMember.disability_is_severe || false,  // ✅ NUEVO
      is_main_applicant: false,
      phone_number: (spouseMember as any).phone_number || null,
      email: (spouseMember as any).email || null
    } : null;

    const transformedSpouseEconomic = spouseMember ? {
      employment_situation: spouseMember.employment_situation || 'dependiente',
      monthly_income: spouseMember.monthly_income || 0,
      work_condition: spouseMember.work_condition || (spouseMember.employment_condition?.toLowerCase() as any) || 'formal',
      occupation_detail: spouseMember.occupation || 'Trabajador',
      has_additional_income: false,
      additional_income_amount: undefined,
      additional_income_source: undefined,
      employer_name: undefined,
      is_main_applicant: false
    } : null;

    // Transformar household_members: EXCLUIR jefe de familia Y cónyuge (van por separado) para evitar DNI duplicado
    const transformedHouseholdMembers = (formData.household_members || [])
      .filter(member => {
        // Filtrar el jefe de familia basado en DNI para evitar duplicación
        const isHeadOfFamily = member.dni === formData.head_of_family?.dni ||
                               member.dni === formData.head_of_family?.document_number;

        // ✅ FIX: También filtrar el cónyuge si ya se envía como objeto separado
        const isSpouse = spouseMember && (
          member.dni === spouseMember.dni ||
          member.member_type === MemberType.SPOUSE ||
          member.member_type?.toString() === 'CONYUGE'
        );

        return !isHeadOfFamily && !isSpouse;
      })
      .map((member, idx) => {
        const normalized_birth_date = normalizeToISODate(member.birth_date);

        // ✅ Mapear member_type a relationship correctamente
        let relationshipValue = 'otro';
        const memberTypeStr = String(member.member_type || '').toUpperCase();
        
        if (memberTypeStr.includes('HEAD') || memberTypeStr === 'JEFE_FAMILIA') {
          relationshipValue = 'jefe_familia';
        } else if (memberTypeStr.includes('SPOUSE') || memberTypeStr === 'CONYUGE') {
          relationshipValue = 'conyuge';
        } else if (memberTypeStr.includes('DEPENDENT') || memberTypeStr.includes('HIJO')) {
          relationshipValue = member.relationship || 'hijo';
        } else if (memberTypeStr.includes('ADDITIONAL')) {
          relationshipValue = 'otro';
        } else if (member.relationship) {
          relationshipValue = member.relationship;
        }
        
        const isDependentValue = memberTypeStr.includes('DEPENDENT') || 
                                memberTypeStr.includes('HIJO');

        return {
          first_name: member.first_name,
          paternal_surname: member.apellido_paterno,
          maternal_surname: member.apellido_materno,
          document_type: 'dni',
          document_number: member.dni,
          birth_date: normalized_birth_date,
          civil_status: member.marital_status || 'soltero',
          education_level: member.education_level || 'secundaria_completa',
          occupation: member.occupation || 'No especificado',
          employment_situation: member.employment_situation || 'dependiente',
          work_condition: member.work_condition || (member.employment_condition || 'FORMAL').toLowerCase(),
          monthly_income: member.monthly_income || 0,
          disability_type: member.disability_type || 'ninguna',
          disability_is_permanent: member.disability_is_permanent || false,
          disability_is_severe: member.disability_is_severe || false,
          relationship: relationshipValue,
          is_dependent: isDependentValue
        };
      });

    const transformedPropertyInfo = {
      department: formData.property_info?.department || '',
      province: formData.property_info?.province || '',
      district: formData.property_info?.district || '',
      lote: formData.property_info?.lote || '',
      address: formData.property_info?.address || '',
      ubigeo_code: formData.property_info?.ubigeo_code || null,
      populated_center: formData.property_info?.populated_center || null,
      manzana: formData.property_info?.manzana || null,
      sub_lote: formData.property_info?.sub_lote || null,
      reference: formData.property_info?.reference || null,
      latitude: formData.property_info?.latitude || null,
      longitude: formData.property_info?.longitude || null,
      ubigeo_validated: formData.property_info?.ubigeo_validated || false
    };

    const finalConvocationCode = formData.application_info?.convocation_code || '';
    
    if (!finalConvocationCode || finalConvocationCode.trim() === '') {
      alert('⚠️ Error: Debe seleccionar una convocatoria antes de crear la solicitud.');
      return;
    }
    
    const requestData = {
      convocation_code: finalConvocationCode,
      user_data: transformedUserData,
      head_of_family: transformedHeadOfFamily,
      head_of_family_economic: transformedHeadOfFamilyEconomic,
      spouse: transformedSpouse,  // ✅ FIX: Usar transformedSpouse en vez de transformedHeadOfFamily
      spouse_economic: transformedSpouseEconomic,
      household_members: transformedHouseholdMembers,
      property_info: transformedPropertyInfo,
      comments: formData.comments
    };

    const result = await createApplication(requestData as any);

    if (result) {
      storageService.clearDraft();
      alert(`✅ Solicitud creada exitosamente!\n\nID: ${result.id}\nCódigo de Convocatoria: ${result.convocation_code}`);
      navigate('/techo-propio/solicitudes');
    } else {
      if (apiError && apiError.includes('DNI') && apiError.includes('ya está registrado')) {
        setErrors([
          'Error de DNI duplicado: ' + apiError,
          '💡 Sugerencia: Use el botón "Generar DNIs Únicos" para resolver este problema automáticamente'
        ]);
        
        setTimeout(() => {
          if (window.confirm('¿Desea generar DNIs únicos automáticamente para continuar con la prueba?')) {
            generateUniqueDNIs();
          }
        }, 2000);
        
        handleDNIDuplicateError(apiError);
      } else {
        setErrors([apiError || 'Error al crear la solicitud. Por favor, intente nuevamente.']);
      }
    }
  };

  const handleExit = () => {
    setExitModal(true);
  };

  const confirmExit = () => {
    storageService.saveDraft(formData, currentStep); // Guardar antes de salir
    navigate('/techo-propio/solicitudes');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ApplicationInfoStep
            data={formData.application_info || {
              registration_date: new Date().toLocaleDateString('es-PE'),
              convocation_code: '',
              registration_year: new Date().getFullYear()
            }}
            onChange={(application_info) => updateFormData({ application_info })}
            errors={errors}
          />
        );
      case 1:
        return (
          <ApplicantForm
            data={{
              dni: formData.head_of_family?.dni || formData.head_of_family?.document_number || '',
              first_name: formData.head_of_family?.first_name || '',
              last_name: `${formData.head_of_family?.paternal_surname || ''} ${formData.head_of_family?.maternal_surname || ''}`.trim(),
              phone: formData.head_of_family?.phone_number || '',
              email: formData.head_of_family?.email || ''
              // ✅ Campos eliminados: birth_date, marital_status, current_address
              // Estos se capturarán en el Paso 2 (HouseholdForm)
            }}
            onChange={(applicant) => updateFormData({ 
              head_of_family: {
                document_number: applicant.dni,
                dni: applicant.dni,
                first_name: applicant.first_name,
                paternal_surname: applicant.last_name?.split(' ')[0] || '',
                maternal_surname: applicant.last_name?.split(' ')[1] || '',
                phone_number: applicant.phone,
                email: applicant.email
              }
            })}
          />
        );
      case 2:
        return (
          <HouseholdForm
            data={formData.household_members || []}
            onChange={(household_members: any) => updateFormData({ household_members })}
          />
        );
      case 3:
        return (
          <PropertyForm
            data={formData.property_info || {}}
            onChange={(property_info) => updateFormData({ property_info })}
          />
        );
      case 4:
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

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Main Content Area */}
        <div className="flex-1 p-4 space-y-4">
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
                  {/* Botón de ayuda para DNI duplicado */}
                  {errors.some(error => error.includes('DNI') && error.includes('registrado')) && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-sm text-red-700 mb-2">
                        💡 <strong>Solución rápida:</strong> Genere DNIs únicos automáticamente para pruebas
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={generateUniqueDNIs}
                        className="bg-white border-red-300 text-red-700 hover:bg-red-50"
                      >
                        🔄 Generar DNIs Únicos
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Step Content */}
          <Card>{renderStep()}</Card>

          {/* Navigation Buttons */}
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={currentStep === 0 || isLoading}
                >
                  ← Anterior
                </Button>
                
                {/* Botón de herramientas de desarrollo */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateUniqueDNIs}
                  disabled={isLoading}
                  className="text-xs text-gray-600 border border-gray-300 hover:bg-gray-50"
                  title="Generar DNIs únicos para pruebas"
                >
                  🔧 DNIs Únicos
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                Paso {currentStep + 1} de {totalSteps}
              </div>

              {currentStep < lastStepIndex ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  Siguiente →
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Solicitud'
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Progress Stepper */}
        <div className="w-80 bg-white shadow-lg border-l border-gray-200 p-6 min-h-screen">
        <div className="sticky top-6">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Nueva Solicitud</h3>
            <Button variant="ghost" onClick={handleExit} size="sm" className="text-gray-600 hover:text-gray-800">
              ✕
            </Button>
          </div>            <div className="space-y-4">
              {[0, 1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center space-x-4">
                  {/* Step Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                      step < currentStep
                        ? 'text-white shadow-lg'
                        : step === currentStep
                        ? 'text-white shadow-lg'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                    style={
                      step === currentStep
                        ? { backgroundColor: 'var(--tp-secondary, #2563eb)' }
                        : step < currentStep
                        ? { backgroundColor: 'var(--tp-primary, #16a34a)' }
                        : {}
                    }
                  >
                    {step < currentStep ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : step === 0 ? (
                      'ℹ️'
                    ) : (
                      step
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="flex-1">
                    <h4
                      className="font-medium"
                      style={{
                        color: step === currentStep
                          ? 'var(--tp-secondary, #2563eb)'
                          : step < currentStep
                          ? 'var(--tp-primary, #16a34a)'
                          : '#6b7280'
                      }}
                    >
                      {step === 0 && 'Información General'}
                      {step === 1 && 'Datos del Solicitante'}
                      {step === 2 && 'Grupo Familiar'}
                      {step === 3 && 'Información del Predio'}
                      {step === 4 && 'Revisión y Envío'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {step === 0 && 'Convocatoria y fecha'}
                      {step === 1 && 'Datos básicos de contacto'}
                      {step === 2 && 'Miembros del hogar'}
                      {step === 3 && 'Datos del terreno'}
                      {step === 4 && 'Verificar información'}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  {step < currentStep && (
                    <span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        color: 'var(--tp-primary, #16a34a)'
                      }}
                    >
                      Completado
                    </span>
                  )}
                  {step === currentStep && (
                    <span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--tp-secondary, #2563eb)'
                      }}
                    >
                      Actual
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progreso</span>
                <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                    background: 'linear-gradient(to right, var(--tp-primary, #16a34a), var(--tp-secondary, #2563eb))'
                  }}
                />
              </div>
            </div>
            
            {/* Help Text */}
            <div
              className="mt-8 p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                borderLeft: '4px solid var(--tp-secondary, #2563eb)'
              }}
            >
              <h5
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--tp-secondary, #2563eb)' }}
              >
                💡 Consejos
              </h5>
              <p className="text-xs text-gray-700">
                {currentStep === 0 && 'Seleccione la convocatoria correspondiente a su solicitud.'}
                {currentStep === 1 && 'Complete solo los datos básicos de contacto del solicitante principal.'}
                {currentStep === 2 && 'Agregue todos los miembros que vivan en el hogar.'}
                {currentStep === 3 && 'Ingrese los datos del terreno donde se construirá la vivienda.'}
                {currentStep === 4 && 'Revise toda la información antes de enviar la solicitud.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={exitModal}
        onClose={() => setExitModal(false)}
        title="Salir del Formulario"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExitModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmExit}>
              Salir y Guardar Borrador
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          ¿Está seguro de salir? Su progreso se guardará como borrador y podrá continuar más tarde.
        </p>
      </Modal>
    </>
  );
};

export default NewApplication;
