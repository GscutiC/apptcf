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
      console.log('🔍 Cargando solicitud con ID:', id);
      fetchApplication(id);
    }
  }, [id]);

  // Poblar formulario cuando se cargue la solicitud
  useEffect(() => {
    console.log('📋 [EditApplication] selectedApplication cambió:', selectedApplication ? 'SÍ' : 'NO');
    
    if (selectedApplication) {
      console.log('📦 [EditApplication] Datos recibidos del backend:', {
        code: selectedApplication.code,
        convocation_code: selectedApplication.convocation_code,
        registration_date: selectedApplication.registration_date,
        created_at: selectedApplication.created_at,
        applicant: {
          dni: selectedApplication.applicant?.dni,
          first_name: selectedApplication.applicant?.first_name,
          current_address: selectedApplication.applicant?.current_address
        },
        household_members_count: selectedApplication.household_members?.length || 0,
        household_members: selectedApplication.household_members,
        property_info: selectedApplication.property_info
      });
      
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
        
        // ✅ Paso 1: Solicitante (Jefe de Familia)
        head_of_family: {
          document_number: selectedApplication.applicant?.dni || '',
          dni: selectedApplication.applicant?.dni || '',
          first_name: selectedApplication.applicant?.first_name || '',
          paternal_surname: selectedApplication.applicant?.last_name?.split(' ')[0] || '',
          maternal_surname: selectedApplication.applicant?.last_name?.split(' ')[1] || '',
          birth_date: selectedApplication.applicant?.birth_date,
          civil_status: selectedApplication.applicant?.marital_status,
          phone_number: selectedApplication.applicant?.phone || '',
          email: selectedApplication.applicant?.email || '',
          // 🔧 CORREGIDO: Dirección actual desde applicant.current_address (no property_info)
          current_address: selectedApplication.applicant?.current_address || {
            department: '',
            province: '',
            district: '',
            address: '',
            reference: ''
          }
        },
        
        // ✅ Paso 2: Grupo Familiar (Miembros del hogar)
        household_members: selectedApplication.household_members || [],
        
        // ✅ Paso 3: Información del Predio
        property_info: selectedApplication.property_info,
        
        // Otros datos
        comments: selectedApplication.comments || ''
      };
      
      setFormData(mappedData);
      
      console.log('✅ [EditApplication] FormData mapeado:', {
        'Paso 0 - Convocatoria': mappedData.application_info?.convocation_code,
        'Paso 0 - Fecha': mappedData.application_info?.registration_date,
        'Paso 1 - DNI': mappedData.head_of_family?.dni,
        'Paso 1 - Nombre': mappedData.head_of_family?.first_name,
        'Paso 1 - Dirección Completa': mappedData.head_of_family?.current_address,
        'Paso 2 - Total Miembros': mappedData.household_members?.length || 0,
        'Paso 2 - Miembros Array': mappedData.household_members,
        'Paso 3 - Departamento': mappedData.property_info?.department
      });
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
        // Paso 1: Solicitante (Jefe de Familia)
        if (!formData.head_of_family) {
          stepErrors.push('Debe completar los datos del solicitante');
        } else {
          if (!formData.head_of_family.dni && !formData.head_of_family.document_number) {
            stepErrors.push('DNI del solicitante es obligatorio');
          }
          if (!formData.head_of_family.first_name || formData.head_of_family.first_name.trim().length < 2) {
            stepErrors.push('Nombres del solicitante son obligatorios');
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
      console.log('⚠️ [EditApplication] formData es null, no se puede renderizar');
      return null;
    }

    console.log('🎨 [EditApplication] Renderizando paso', currentStep, 'con datos:', {
      paso_actual: currentStep,
      application_info: formData.application_info,
      head_of_family: formData.head_of_family,
      household_members_count: formData.household_members?.length || 0,
      property_info: formData.property_info ? 'SÍ' : 'NO'
    });

    switch (currentStep) {
      case 0:
        // Paso 0: Información de la Solicitud
        console.log('📝 [Paso 0] Enviando a ApplicationInfoStep:', {
          convocation_code: formData.application_info?.convocation_code,
          registration_date: formData.application_info?.registration_date,
          application_number: formData.application_info?.application_number
        });
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
        // Paso 1: Solicitante (Jefe de Familia)
        console.log('📝 [Paso 1] Enviando a ApplicantForm:', {
          dni: formData.head_of_family?.dni,
          first_name: formData.head_of_family?.first_name,
          current_address: formData.head_of_family?.current_address
        });
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
        // Paso 2: Grupo Familiar
        console.log('📝 [Paso 2] Enviando a HouseholdForm:', {
          total_miembros: formData.household_members?.length || 0,
          household_members: formData.household_members,
          es_array: Array.isArray(formData.household_members),
          primer_miembro: formData.household_members?.[0]
        });
        return (
          <HouseholdForm
            data={formData.household_members || []}
            onChange={(household_members: any) => updateFormData({ household_members })}
          />
        );
      case 3:
        // Paso 3: Información del Predio
        console.log('📝 [Paso 3] Enviando a PropertyForm:', formData.property_info);
        return (
          <PropertyForm
            data={formData.property_info || {}}
            onChange={(property_info) => updateFormData({ property_info })}
          />
        );
      case 4:
        // Paso 4: Revisión Final
        console.log('📝 [Paso 4] Enviando a ReviewStep:', formData);
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
