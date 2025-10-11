/**
 * ApplicationInfoStep - Paso 0: Información de la Solicitud
 * Captura código de convocatoria y muestra datos generados automáticamente
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Card, FormInput, FormSelect, Button } from '../common';
import { convocationService, ConvocationOption } from '../../../../services/convocationService';

interface ApplicationInfo {
  application_number?: string;
  registration_date: string;
  convocation_code: string;
  registration_year: number;
}

interface ApplicationInfoStepProps {
  data: ApplicationInfo;
  onChange: (data: ApplicationInfo) => void;
  onNext: () => void;
  errors: string[];
}

// Tipos importados desde el servicio

export const ApplicationInfoStep: React.FC<ApplicationInfoStepProps> = ({
  data,
  onChange,
  onNext,
  errors
}) => {
  // Hook de autenticación de Clerk
  const { getToken } = useAuth();

  // Estados para convocatorias
  const [availableConvocations, setAvailableConvocations] = useState<ConvocationOption[]>([]);
  const [loadingConvocations, setLoadingConvocations] = useState(true);
  const [convocationError, setConvocationError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ApplicationInfo>({
    registration_date: new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    convocation_code: data.convocation_code || '',
    registration_year: new Date().getFullYear(),
    application_number: data.application_number || 'Se generará automáticamente'
  });

  // Cargar convocatorias disponibles
  useEffect(() => {
    const loadConvocations = async () => {
      try {
        setLoadingConvocations(true);
        setConvocationError(null);

        // Configurar el token de autenticación en el servicio
        convocationService.setGetToken(getToken);

        // Usar el servicio para cargar convocatorias
        const convocations = await convocationService.getConvocationOptions();
        
        // Filtrar solo convocatorias activas
        const activeConvocations = convocations.filter(conv => conv.is_active);
        setAvailableConvocations(activeConvocations);

      } catch (error) {
        console.error('Error cargando convocatorias:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setConvocationError(`Error al cargar las convocatorias: ${errorMessage}`);
        
        // Fallback a lista mínima
        setAvailableConvocations([
          { 
            value: 'CONV-2025-01', 
            label: 'CONV-2025-01 - Convocatoria por Defecto',
            is_active: true,
            is_current: true
          }
        ]);
      } finally {
        setLoadingConvocations(false);
      }
    };

    loadConvocations();
  }, [getToken]); // Agregar getToken como dependencia


  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  }, [data]);

  const handleChange = (field: keyof ApplicationInfo, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleNext = () => {
    if (!formData.convocation_code || loadingConvocations) {
      return; // Validación básica
    }
    onNext();
  };

  const isValid = formData.convocation_code && 
                  formData.convocation_code.length > 0 && 
                  !loadingConvocations && 
                  !convocationError;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información de la Solicitud
        </h2>
        <p className="text-gray-600">
          Datos de registro y seguimiento de su postulación al programa Techo Propio
        </p>
      </div>

      {/* Form Card */}
      <Card padding="lg">
        <div className="space-y-6">
          
          {/* Información Automática */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Información Generada Automáticamente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha de Registro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 Fecha de Registro
                </label>
                <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 font-medium">
                  {formData.registration_date}
                </div>
                <p className="text-xs text-gray-500 mt-1">Generada automáticamente</p>
              </div>

              {/* Número de Solicitud */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏷️ Número de Solicitud
                </label>
                <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 font-medium">
                  {formData.application_number}
                </div>
                <p className="text-xs text-gray-500 mt-1">Se generará al crear la solicitud</p>
              </div>
            </div>
          </div>

          {/* Campo de Convocatoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 Código de Convocatoria *
            </label>
            
            {loadingConvocations ? (
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-md bg-gray-50">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Cargando convocatorias...</span>
              </div>
            ) : convocationError ? (
              <div className="p-3 border border-red-300 rounded-md bg-red-50">
                <p className="text-red-600 text-sm">{convocationError}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-red-700 underline text-sm mt-1"
                >
                  Recargar página
                </button>
              </div>
            ) : (
              <FormSelect
                label=""
                value={formData.convocation_code}
                onChange={(e) => handleChange('convocation_code', e.target.value)}
                options={availableConvocations}
                placeholder="Seleccione la convocatoria..."
                required
              />
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              Seleccione la convocatoria correspondiente al período de postulación actual.
              {availableConvocations.length > 0 && (
                <span className="block mt-1">
                  {availableConvocations.length} convocatoria{availableConvocations.length !== 1 ? 's' : ''} disponible{availableConvocations.length !== 1 ? 's' : ''}.
                </span>
              )}
            </p>
          </div>

          {/* Información de Convocatoria Seleccionada */}
          {formData.convocation_code && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Convocatoria Seleccionada
              </h4>
              {(() => {
                const selectedConvocation = availableConvocations.find(
                  conv => conv.value === formData.convocation_code
                );
                return selectedConvocation ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-700">
                      <strong>Código:</strong> {selectedConvocation.value}
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Descripción:</strong> {selectedConvocation.label}
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Estado:</strong> {selectedConvocation.is_current ? 'Vigente' : 'Disponible'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-green-700">Convocatoria: {formData.convocation_code}</p>
                );
              })()}
            </div>
          )}

          {/* Información Adicional */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">ℹ️ Información Importante</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• La fecha de registro se genera automáticamente al momento de crear la solicitud</li>
              <li>• El número de solicitud será único y permitirá hacer seguimiento de su postulación</li>
              <li>• La convocatoria debe corresponder al período vigente de postulaciones</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium text-red-800 mb-1">Errores encontrados:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={!isValid}
          className="min-w-[200px]"
        >
          Continuar al Paso 1
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default ApplicationInfoStep;