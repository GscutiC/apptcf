/**
 * ApplicantForm - Step 1: Datos del Solicitante
 * ✅ ACTUALIZADO: Soporte para modo manual cuando RENIEC no encuentra el DNI
 */

import React, { useState } from 'react';
import { Applicant } from '../../types';
import { FormInput } from '../common';
import { DniValidator } from '../application';
import { FORM_CONSTANTS } from '../../utils';

interface ApplicantFormProps {
  data: Partial<Applicant> & { is_manual_entry?: boolean };
  onChange: (data: Partial<Applicant> & { is_manual_entry?: boolean }) => void;
  errors?: Record<string, string>;
}

export const ApplicantForm: React.FC<ApplicantFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [dniValidated, setDniValidated] = useState(false);

  // ✅ NUEVO: Estado para modo manual
  const [manualMode, setManualMode] = useState(false);
  const [manualDataConfirmed, setManualDataConfirmed] = useState(false);

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
      last_name: reniecData.last_name,
      is_manual_entry: false // ✅ Marcar como validado con RENIEC
    };

    onChange(newData);
  };

  // ✅ NUEVO: Handler para toggle de modo manual
  const handleManualModeToggle = () => {
    const newManualMode = !manualMode;
    setManualMode(newManualMode);

    if (newManualMode) {
      // Al activar modo manual, limpiar validación RENIEC
      setDniValidated(false);
      setManualDataConfirmed(false);
    } else {
      // Al desactivar modo manual, limpiar datos si no fueron validados
      if (!dniValidated) {
        onChange({
          ...data,
          first_name: '',
          last_name: '',
          is_manual_entry: false
        });
      }
    }
  };

  // ✅ NUEVO: Handler para cambio manual de DNI
  const handleManualDniChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 8);
    onChange({
      ...data,
      dni: cleanValue,
      is_manual_entry: true
    });
  };

  const handleFieldChange = (field: keyof Applicant, value: any) => {
    onChange({
      ...data,
      [field]: value,
      is_manual_entry: manualMode ? true : data.is_manual_entry
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
            value={data.dni || ''}
            onChange={(value) => handleFieldChange('dni', value)}
            onValidated={handleDniValidated}
            label="DNI del Solicitante"
            required
          />
        </>
      ) : (
        <>
          {/* DNI manual (sin validación RENIEC) */}
          <FormInput
            label="DNI del Solicitante"
            required
            value={data.dni || ''}
            onChange={(e) => handleManualDniChange(e.target.value)}
            placeholder="12345678"
            maxLength={8}
            error={errors.dni}
            hint="Ingrese el DNI de 8 dígitos (modo manual)"
          />
          {data.dni?.length === 8 && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>DNI ingresado manualmente - No validado con RENIEC</span>
            </div>
          )}
        </>
      )}

      {/* Nombres y Apellidos - Editables según modo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Nombres"
          required
          value={data.first_name || ''}
          onChange={(e) => handleFieldChange('first_name', e.target.value)}
          placeholder={FORM_CONSTANTS.placeholders.applicant.firstName}
          error={errors.first_name}
          disabled={!manualMode && dniValidated}
          hint={!manualMode && dniValidated ? 'Validado con RENIEC' : undefined}
        />

        <FormInput
          label="Apellidos"
          required
          value={data.last_name || ''}
          onChange={(e) => handleFieldChange('last_name', e.target.value)}
          placeholder={FORM_CONSTANTS.placeholders.applicant.lastName}
          error={errors.last_name}
          disabled={!manualMode && dniValidated}
          hint={!manualMode && dniValidated ? 'Validado con RENIEC' : undefined}
        />
      </div>

      {/* ✅ NUEVO: Checkbox de confirmación para modo manual */}
      {manualMode && data.dni?.length === 8 && data.first_name?.trim() && data.last_name?.trim() && (
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
        </div>
      )}

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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 italic">
            ✅ Complete estos datos básicos y continúe al siguiente paso para registrar
            la información completa del grupo familiar.
          </p>
          {/* ✅ NUEVO: Indicador de modo de ingreso */}
          {(manualMode || data.is_manual_entry) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Ingreso Manual
            </span>
          )}
          {!manualMode && dniValidated && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Validado RENIEC
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantForm;
