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
  applicant: undefined,
  household_members: [],
  economic_info: undefined,
  property_info: undefined,
  comments: ''
};

export const NewApplication: React.FC = () => {
  const navigate = useNavigate();
  const { createApplication, isLoading, error: apiError } = useTechoPropioApplications();
  const { validateDNI } = useValidation();
  const { selectApplication } = useTechoPropio();
  const [currentStep, setCurrentStep] = useState(0);  // ✅ Empezar en paso 0
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

  const totalSteps = 6;  // ✅ Incrementado para incluir paso 0

  const updateFormData = (partialData: Partial<ApplicationFormData>) => {
    // ✅ FIX: Usar función de actualización para garantizar que siempre usamos el estado más reciente
    setFormData((prev) => {
      const updated = { ...prev, ...partialData };
      console.log('🔄 updateFormData - prev:', prev);
      console.log('🔄 updateFormData - partialData:', partialData);
      console.log('🔄 updateFormData - updated:', updated);
      return updated;
    });
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
    
    // Generar DNI único para solicitante principal
    if (newFormData.applicant) {
      const oldDni = newFormData.applicant.dni;
      newFormData.applicant.dni = generateUniqueDNI();
      generatedCount++;
      console.log(`🔄 DNI Solicitante: ${oldDni} → ${newFormData.applicant.dni}`);
    }
    
    // Generar DNIs únicos para miembros del hogar
    if (newFormData.household_members) {
      newFormData.household_members = newFormData.household_members.map((member, index) => {
        const oldDni = member.dni;
        const newDni = generateUniqueDNI();
        generatedCount++;
        console.log(`🔄 DNI Miembro ${index + 1}: ${oldDni} → ${newDni}`);
        return {
          ...member,
          dni: newDni
        };
      });
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
    if (currentStep === totalSteps) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: string[] = [];

    switch (currentStep) {
      case 1:
        if (!formData.applicant) {
          stepErrors.push('Debe completar los datos del solicitante');
        } else {
          // 🐛 DEBUG: Log para diagnosticar problema de validación
          console.log('🔍 DEBUG - Validando Paso 1 (Solicitante)');
          console.log('📋 formData.applicant:', formData.applicant);
          console.log('🏠 current_address:', formData.applicant.current_address);
          
          const applicantErrors = validateApplicantForm(formData.applicant);
          
          console.log('❌ Errores encontrados:', applicantErrors);
          stepErrors.push(...applicantErrors);
        }
        break;
      case 2:
        // Grupo familiar es opcional, pero si hay miembros, validar que tengan datos completos
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
        if (!formData.economic_info) {
          stepErrors.push('Debe completar la información económica');
        } else {
          const economicErrors = validateEconomicForm(formData.economic_info);
          stepErrors.push(...economicErrors);
        }
        break;
      case 5:
        // En el paso de revisión, validar todo nuevamente
        if (!formData.applicant || !formData.economic_info || !formData.property_info) {
          stepErrors.push('Faltan datos obligatorios en la solicitud');
        }
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
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

    // Validación final
    if (!formData.applicant || !formData.economic_info || !formData.property_info) {
      setErrors(['Faltan datos obligatorios en la solicitud']);
      return;
    }

    // Transformar datos del frontend al formato que espera el backend
    const transformedApplicant = {
      document_type: 'dni', // Asumiendo DNI por defecto
      document_number: formData.applicant?.dni || '',
      first_name: formData.applicant?.first_name || '',
      paternal_surname: formData.applicant?.last_name?.split(' ')[0] || 'Sin Apellido',
      maternal_surname: formData.applicant?.last_name?.split(' ').slice(1).join(' ') || 'Sin Apellido',
      birth_date: formData.applicant?.birth_date || '1990-01-01',
      civil_status: formData.applicant?.marital_status || 'soltero',
      education_level: 'secundaria_completa', // Valor por defecto - necesita agregar campo al formulario
      phone_number: formData.applicant?.phone || '',
      email: formData.applicant?.email || '',
      disability_type: 'ninguna', // Valor por defecto
      is_main_applicant: true
    };

    const hasAdditionalIncome = (formData.economic_info?.income?.additional_income || 0) > 0;
    
    const transformedEconomic = {
      employment_situation: 'dependiente', // Valor por defecto - necesita agregar campo al formulario
      monthly_income: formData.economic_info?.income?.total_income || 0,
      work_condition: 'formal', // Valor por defecto - necesita agregar campo al formulario  
      occupation_detail: formData.economic_info?.occupation || 'Trabajador',
      has_additional_income: hasAdditionalIncome,
      additional_income_amount: hasAdditionalIncome ? (formData.economic_info?.income?.additional_income || 0) : undefined,
      additional_income_source: hasAdditionalIncome ? 'Ingreso extra no especificado' : undefined,
      employer_name: formData.economic_info?.employer_name || 'No especificado',
      is_main_applicant: true
    };

    // Transformar household_members: mapear campos del frontend al backend
    const transformedHouseholdMembers = (formData.household_members || []).map(member => ({
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

    // Preparar datos para el backend (ajustar estructura para TechoPropioApplicationCreateDTO)
    const requestData = {
      convocation_code: formData.application_info?.convocation_code || '',
      main_applicant: transformedApplicant,
      household_members: transformedHouseholdMembers,  // ✅ Usar datos transformados
      main_applicant_economic: transformedEconomic,
      property_info: formData.property_info as any, // Forzar tipo ya que validamos arriba
      comments: formData.comments
    };

    // Debug: imprimir datos que se van a enviar
    console.log('🔍 Datos originales del frontend:', JSON.stringify(formData, null, 2));
    console.log('🔍 Datos transformados para el backend:', JSON.stringify(requestData, null, 2));

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
            data={formData.applicant || {}}
            onChange={(applicant) => updateFormData({ applicant })}
          />
        );
      case 2:
        return (
          <HouseholdForm
            data={formData.household_members || []}
            onChange={(household_members) => updateFormData({ household_members })}
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
          <EconomicForm
            data={formData.economic_info || {}}
            onChange={(economic_info) => updateFormData({ economic_info })}
          />
        );
      case 5:
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
          {[0, 1, 2, 3, 4, 5].map((step) => (
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
                  {step === 4 && 'Económica'}
                  {step === 5 && 'Revisión'}
                </span>
              </div>
              {step < totalSteps && (
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
            Paso {currentStep} de {totalSteps}
          </div>

          {currentStep < totalSteps ? (
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
