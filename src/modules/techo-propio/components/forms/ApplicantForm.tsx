/**
 * ApplicantForm - Step 1: Datos del Solicitante
 */

import React, { useState } from 'react';
import { Applicant } from '../../types';
import { FormInput } from '../common';
import { DniValidator } from '../application';
import { FORM_CONSTANTS } from '../../utils';

interface ApplicantFormProps {
  data: Partial<Applicant>;
  onChange: (data: Partial<Applicant>) => void;
  errors?: Record<string, string>;
}

export const ApplicantForm: React.FC<ApplicantFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [dniValidated, setDniValidated] = useState(false);
  
  const handleDniValidated = (reniecData: {
    dni: string;
    first_name: string;
    last_name: string;
  }) => {
    setDniValidated(true);
    
    const newData = {
      ...data,
      dni: reniecData.dni,
      first_name: reniecData.first_name,
      last_name: reniecData.last_name
    };
    
    onChange(newData);
  };

  const handleFieldChange = (field: keyof Applicant, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Paso 1: Datos del Solicitante
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Ingrese los datos básicos de contacto del solicitante. El DNI será validado con RENIEC.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>Nota:</strong> Los datos adicionales como fecha de nacimiento, estado civil y dirección 
            se completarán en el <strong>Paso 2: Grupo Familiar</strong> al agregar al jefe de familia.
          </p>
        </div>
      </div>

      {/* DNI con validación RENIEC */}
      <DniValidator
        value={data.dni || ''}
        onChange={(value) => handleFieldChange('dni', value)}
        onValidated={handleDniValidated}
        label="DNI del Solicitante"
        required
      />

      {/* Nombres y Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Nombres"
          required
          value={data.first_name || ''}
          onChange={(e) => handleFieldChange('first_name', e.target.value)}
          placeholder={FORM_CONSTANTS.placeholders.applicant.firstName}
          error={errors.first_name}
          disabled={dniValidated}
          hint={dniValidated ? 'Autocompletado desde RENIEC' : undefined}
        />

        <FormInput
          label="Apellidos"
          required
          value={data.last_name || ''}
          onChange={(e) => handleFieldChange('last_name', e.target.value)}
          placeholder={FORM_CONSTANTS.placeholders.applicant.lastName}
          error={errors.last_name}
          disabled={dniValidated}
          hint={dniValidated ? 'Autocompletado desde RENIEC' : undefined}
        />
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          type="tel"
          label="Teléfono"
          required
          value={data.phone || ''}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          placeholder="987654321"
          maxLength={9}
          error={errors.phone}
          hint="Teléfono celular de 9 dígitos"
        />

        <FormInput
          type="email"
          label="Correo Electrónico"
          required
          value={data.email || ''}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          placeholder="ejemplo@correo.com"
          error={errors.email}
        />
      </div>

      {/* Nota informativa final */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 italic">
          ✅ Complete estos datos básicos y continúe al siguiente paso para registrar 
          la información completa del grupo familiar.
        </p>
      </div>
    </div>
  );
};

export default ApplicantForm;
