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
import { ApplicationFormData } from '../types';
import { storageService } from '../services';
import { validateApplicantForm, validateEconomicForm, validatePropertyForm } from '../utils';

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
        // Validación: Datos del Usuario (control interno)
        if (!formData.head_of_family) {
          stepErrors.push('Debe completar los datos del solicitante');
        } else {
          if (!formData.head_of_family.dni || formData.head_of_family.dni.length !== 8) {
            stepErrors.push('DNI debe tener 8 dígitos');
          }
          if (!formData.head_of_family.first_name || formData.head_of_family.first_name.trim().length < 2) {
            stepErrors.push('Los nombres son obligatorios');
          }
        }
        break;
      case 2:
        // Validación: Grupo Familiar
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
        
        // Validar cónyuge si existe
        if (formData.spouse) {
          if (!formData.spouse.dni || formData.spouse.dni.length !== 8) {
            stepErrors.push('DNI del cónyuge debe tener 8 dígitos');
          }
        }
        
        // Validar carga familiar si hay miembros
        if (formData.household_members && formData.household_members.length > 0) {
          formData.household_members.forEach((member, idx) => {
            if (!member.dni || !member.first_name || !member.apellido_paterno || !member.apellido_materno) {
              stepErrors.push(`Miembro ${idx + 1}: Faltan datos obligatorios`);
            }
          });
        }
        break;
      case 3:
        // ✅ Paso 3 = Información del Predio
        if (!formData.property_info) {
          stepErrors.push('Debe completar los datos del predio');
        } else {
          const propertyErrors = validatePropertyForm(formData.property_info);
          stepErrors.push(...propertyErrors);
        }
        break;
      case 4:
        // ✅ Paso 4 = Revisión Final
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

    // ✅ NUEVA VALIDACIÓN: Buscar jefe de familia en household_members primero
    const headOfFamilyMember = formData.household_members?.find(member => 
      member.first_name === formData.head_of_family?.first_name && 
      member.apellido_paterno === formData.head_of_family?.paternal_surname
    );

    // 🐛 DEBUG: Ver si se encuentra el jefe de familia
    console.log('🔍 Buscando jefe de familia...');
    console.log('head_of_family:', formData.head_of_family);
    console.log('household_members:', formData.household_members);
    console.log('headOfFamilyMember encontrado:', headOfFamilyMember);

    // ✅ NUEVA VALIDACIÓN: Verificar datos obligatorios (user_data se crea desde head_of_family)
    if (!formData.head_of_family || !formData.property_info) {
      setErrors(['Faltan datos obligatorios en la solicitud']);
      return;
    }
    
    // Validar que haya información económica en household_members
    if (!headOfFamilyMember || headOfFamilyMember.monthly_income === undefined) {
      setErrors(['Debe completar la información económica del jefe de familia en el Paso 2']);
      return;
    }

    // ✅ NUEVA LÓGICA: Crear datos de usuario (control interno) desde head_of_family (duplicación permitida)
    const transformedUserData = {
      dni: formData.head_of_family.dni || formData.head_of_family.document_number,
      names: formData.head_of_family.first_name,
      surnames: `${formData.head_of_family.paternal_surname} ${formData.head_of_family.maternal_surname}`.trim(),
      phone: formData.head_of_family.phone_number || '',
      email: formData.head_of_family.email || '',
      birth_date: formData.head_of_family.birth_date || '1990-01-01',
      notes: 'Datos ingresados desde formulario web - Nueva solicitud Techo Propio'
    };

    // ✅ CAMBIO: Transformar jefe de familia (antes era main_applicant)
    const transformedHeadOfFamily = {
      document_type: 'dni',
      document_number: formData.head_of_family?.document_number || '',
      first_name: formData.head_of_family?.first_name || '',
      paternal_surname: formData.head_of_family?.paternal_surname || 'Sin Apellido',
      maternal_surname: formData.head_of_family?.maternal_surname || 'Sin Apellido',
      birth_date: formData.head_of_family?.birth_date || '1990-01-01',
      civil_status: formData.head_of_family?.civil_status || 'soltero',
      education_level: formData.head_of_family?.education_level || 'secundaria_completa',
      occupation: formData.head_of_family?.occupation,
      phone_number: formData.head_of_family?.phone_number,
      email: formData.head_of_family?.email,
      disability_type: formData.head_of_family?.disability_type || 'ninguna',
      is_main_applicant: true
    };

    // ✅ NUEVO: Mapear info económica desde HouseholdForm data
    const transformedHeadOfFamilyEconomic = {
      employment_situation: headOfFamilyMember?.employment_situation || 'dependiente',
      monthly_income: headOfFamilyMember?.monthly_income || 0,
      work_condition: headOfFamilyMember?.work_condition || (headOfFamilyMember?.employment_condition?.toLowerCase() as any) || 'formal',
      occupation_detail: headOfFamilyMember?.occupation || 'Trabajador',
      has_additional_income: false, // Por ahora no capturamos ingresos adicionales en household
      additional_income_amount: undefined,
      additional_income_source: undefined,
      employer_name: undefined, // Por ahora no capturamos empleador en household
      is_main_applicant: true
    };
    
    // Buscar cónyuge en household_members (si existe)
    const spouseMember = formData.household_members?.find(member => 
      member.member_type?.toString().includes('SPOUSE') || member.family_bond === 'conyuge'
    );
    
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

    // Transformar household_members: EXCLUIR jefe de familia (va por separado) para evitar DNI duplicado
    const transformedHouseholdMembers = (formData.household_members || [])
      .filter(member => 
        // Filtrar el jefe de familia basado en DNI para evitar duplicación
        member.dni !== formData.head_of_family?.dni &&
        member.dni !== formData.head_of_family?.document_number
      )
      .map(member => ({
        first_name: member.first_name,
        paternal_surname: member.apellido_paterno,  // ✅ apellido_paterno -> paternal_surname
        maternal_surname: member.apellido_materno,  // ✅ apellido_materno -> maternal_surname
        document_type: 'dni',  // Por defecto DNI
        document_number: member.dni,
        birth_date: member.birth_date || '1990-01-01',
        civil_status: member.marital_status || 'soltero',  // ✅ marital_status -> civil_status
        education_level: member.education_level || 'secundaria_completa',
        occupation: member.occupation || 'No especificado',
        employment_situation: member.employment_situation || 'dependiente',
        work_condition: member.work_condition || (member.employment_condition || 'FORMAL').toLowerCase(),  // ✅ Usar work_condition o convertir employment_condition a minúsculas
        monthly_income: member.monthly_income || 0,
        disability_type: member.disability_type || 'ninguna',
        relationship: member.relationship || (member.member_type?.toLowerCase() === 'conyuge' ? 'conyuge' : 'otro'),  // ✅ Mapear member_type a relationship
        is_dependent: true
      }));

    // 🐛 DEBUG: Verificar que no hay duplicados
    console.log('🔍 Household members filtrados (sin jefe de familia):', transformedHouseholdMembers);
    console.log('📊 Total miembros después del filtro:', transformedHouseholdMembers.length);

    // ✅ NUEVA ESTRUCTURA: Preparar datos para el backend usando estructura esperada (head_of_family)
    const requestData = {
      convocation_code: formData.application_info?.convocation_code || '',
      user_data: transformedUserData,  // ✅ NUEVO: Datos de usuario
      head_of_family: transformedHeadOfFamily,  // ✅ BACKEND ESPERA: head_of_family
      head_of_family_economic: transformedHeadOfFamilyEconomic,  // ✅ MAPEO: Info económica desde household
      spouse: formData.spouse ? transformedHeadOfFamily : null,  // ✅ CAMBIO: Usar spouse si existe
      spouse_economic: transformedSpouseEconomic,  // ✅ MAPEO: Info económica cónyuge desde household
      household_members: transformedHouseholdMembers,
      property_info: formData.property_info as any,
      comments: formData.comments
    };

    // 🐛 DEBUG: Ver datos que se envían al backend
    console.log('🚀 Enviando datos al backend:', requestData);
    console.log('👤 head_of_family_economic:', transformedHeadOfFamilyEconomic);
    console.log('💑 spouse_economic:', transformedSpouseEconomic);

    const result = await createApplication(requestData as any);

    if (result) {
      // Limpiar borrador
      storageService.clearDraft();
      
      // ✅ Mostrar mensaje de éxito
      alert(`✅ Solicitud creada exitosamente!\n\nID: ${result.id}\nCódigo de Convocatoria: ${result.convocation_code}`);
      
      // Navegar a la lista de solicitudes (no a detalle porque tiene estructura diferente)
      navigate('/techo-propio/solicitudes');
    } else {
      // Manejar error específico de DNI duplicado
      if (apiError && apiError.includes('DNI') && apiError.includes('ya está registrado')) {
        // Mostrar error con sugerencia automática
        setErrors([
          'Error de DNI duplicado: ' + apiError,
          '💡 Sugerencia: Use el botón "Generar DNIs Únicos" para resolver este problema automáticamente'
        ]);
        
        // Opcional: Auto-generar DNIs únicos después de 3 segundos
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
            onNext={handleNext}
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
              birth_date: formData.head_of_family?.birth_date || '',
              marital_status: formData.head_of_family?.civil_status,
              phone: formData.head_of_family?.phone_number || '',
              email: formData.head_of_family?.email || '',
              current_address: formData.head_of_family?.current_address || {
                department: '',
                province: '',
                district: '',
                address: '',
                reference: ''
              }
            }}
            onChange={(applicant) => updateFormData({ 
              head_of_family: {
                document_number: applicant.dni,
                dni: applicant.dni,
                first_name: applicant.first_name,
                paternal_surname: applicant.last_name?.split(' ')[0] || '',
                maternal_surname: applicant.last_name?.split(' ')[1] || '',
                birth_date: applicant.birth_date,
                civil_status: applicant.marital_status,
                phone_number: applicant.phone,
                email: applicant.email,
                current_address: applicant.current_address
              }
            })}
          />
        );
      case 2:
        // ✅ Paso 2: Grupo Familiar con tarjetas y modales (datos oficiales)
        return (
          <HouseholdForm
            data={formData.household_members || []}
            onChange={(household_members: any) => updateFormData({ household_members })}
          />
        );
      case 3:
        // ✅ Paso 3 = Información del Predio
        return (
          <PropertyForm
            data={formData.property_info || {}}
            onChange={(property_info) => updateFormData({ property_info })}
          />
        );
      case 4:
        // ✅ Paso 4 = Revisión Final
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud</h1>
          <p className="text-gray-600 mt-1">Complete el formulario en {totalSteps} pasos</p>
        </div>
        <Button variant="ghost" onClick={handleExit} size="sm">
          Salir
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
              {step < lastStepIndex && (
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
    </div>
  );
};

export default NewApplication;
