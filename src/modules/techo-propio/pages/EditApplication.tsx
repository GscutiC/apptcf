/**
 * EditApplication Page - Wizard multi-step para editar solicitud existente
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTechoPropio } from '../context';
import { useTechoPropioApplications } from '../hooks';
import { Card, Button, Modal } from '../components/common';
import {
  ApplicantForm,
  HouseholdForm,
  EconomicForm,
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
  const [currentStep, setCurrentStep] = useState(1);
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
      setFormData({
        applicant: selectedApplication.applicant,
        household_members: selectedApplication.household_members,
        economic_info: selectedApplication.economic_info,
        property_info: selectedApplication.property_info,
        comments: selectedApplication.comments || ''
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
      case 1:
        if (!formData.applicant) {
          stepErrors.push('Debe completar los datos del solicitante');
        } else {
          const applicantErrors = validateApplicantForm(formData.applicant);
          stepErrors.push(...applicantErrors);
        }
        break;
      case 2:
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
    if (!id || !formData || !validateCurrentStep()) {
      return;
    }

    // Validación final
    if (!formData.applicant || !formData.economic_info || !formData.property_info) {
      setErrors(['Faltan datos obligatorios en la solicitud']);
      return;
    }

    // Preparar datos para el backend
    const requestData = {
      applicant: formData.applicant,
      household_members: formData.household_members || [],
      economic_info: formData.economic_info,
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
    if (!formData) return null;

    switch (currentStep) {
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
          {[1, 2, 3, 4, 5].map((step) => (
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
                    step
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
                  {step === 1 && 'Solicitante'}
                  {step === 2 && 'Grupo Familiar'}
                  {step === 3 && 'Económica'}
                  {step === 4 && 'Predio'}
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
            disabled={currentStep === 1 || isLoading}
          >
            ← Anterior
          </Button>

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
