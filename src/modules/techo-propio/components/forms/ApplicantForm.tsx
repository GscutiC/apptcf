/**
 * ApplicantForm - Step 1: Datos del Solicitante
 */

import React, { useState } from 'react';
import { Applicant, Gender, MaritalStatus } from '../../types';
import { FormInput, FormSelect } from '../common';
import { DniValidator, UbigeoSelector } from '../application';
import { MARITAL_STATUS_OPTIONS, GENDER_OPTIONS } from '../../utils';

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

  const handleLocationChange = (field: string, value: string) => {
    // Crear el nuevo objeto de dirección con los valores actualizados
    const updatedAddress = {
      department: data.current_address?.department || '',
      province: data.current_address?.province || '',
      district: data.current_address?.district || '',
      address: data.current_address?.address || '',
      reference: data.current_address?.reference || ''
    };

    // Actualizar el campo específico
    updatedAddress[field as keyof typeof updatedAddress] = value;

    // Si cambia el departamento, limpiar provincia y distrito
    if (field === 'department') {
      updatedAddress.province = '';
      updatedAddress.district = '';
    }

    // Si cambia la provincia, limpiar distrito
    if (field === 'province') {
      updatedAddress.district = '';
    }

    onChange({
      ...data,
      current_address: updatedAddress
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Paso 1: Datos del Solicitante
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Ingrese los datos personales del solicitante. El DNI será validado con RENIEC.
        </p>
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
          placeholder="Juan Carlos"
          error={errors.first_name}
          disabled={dniValidated}
          hint={dniValidated ? 'Autocompletado desde RENIEC' : undefined}
        />

        <FormInput
          label="Apellidos"
          required
          value={data.last_name || ''}
          onChange={(e) => handleFieldChange('last_name', e.target.value)}
          placeholder="Pérez López"
          error={errors.last_name}
          disabled={dniValidated}
          hint={dniValidated ? 'Autocompletado desde RENIEC' : undefined}
        />
      </div>

      {/* Fecha de nacimiento, Género, Estado Civil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          type="date"
          label="Fecha de Nacimiento"
          required
          value={data.birth_date || ''}
          onChange={(e) => handleFieldChange('birth_date', e.target.value)}
          error={errors.birth_date}
        />

        <FormSelect
          label="Género"
          required
          value={data.gender || ''}
          onChange={(e) => handleFieldChange('gender', e.target.value as Gender)}
          options={GENDER_OPTIONS}
          error={errors.gender}
        />

        <FormSelect
          label="Estado Civil"
          required
          value={data.marital_status || ''}
          onChange={(e) => handleFieldChange('marital_status', e.target.value as MaritalStatus)}
          options={MARITAL_STATUS_OPTIONS}
          error={errors.marital_status}
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

      {/* Dirección Actual */}
      <div className="border-t pt-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Dirección Actual
        </h4>

        <UbigeoSelector
          department={data.current_address?.department || ''}
          province={data.current_address?.province || ''}
          district={data.current_address?.district || ''}
          onDepartmentChange={(value) => handleLocationChange('department', value)}
          onProvinceChange={(value) => handleLocationChange('province', value)}
          onDistrictChange={(value) => handleLocationChange('district', value)}
          required
          errors={{
            department: errors['current_address.department'],
            province: errors['current_address.province'],
            district: errors['current_address.district']
          }}
        />

        <div className="mt-4 space-y-4">
          <FormInput
            label="Dirección"
            required
            value={data.current_address?.address || ''}
            onChange={(e) => handleLocationChange('address', e.target.value)}
            placeholder="Av. Principal 123, Mz. A Lt. 5"
            error={errors['current_address.address']}
          />

          <FormInput
            label="Referencia (Opcional)"
            value={data.current_address?.reference || ''}
            onChange={(e) => handleLocationChange('reference', e.target.value)}
            placeholder="Cerca del mercado central"
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicantForm;
