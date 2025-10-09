/**
 * DniValidator Component - DNI input with RENIEC validation
 */

import React, { useState } from 'react';
import { FormInput } from '../common';
import { Button } from '../common';
import { useValidation } from '../../hooks';
import { validateDNI } from '../../utils';

interface DniValidatorProps {
  value: string;
  onChange: (value: string) => void;
  onValidated?: (data: {
    dni: string;
    first_name: string;
    last_name: string;
    full_name: string;
  }) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export const DniValidator: React.FC<DniValidatorProps> = ({
  value,
  onChange,
  onValidated,
  label = 'DNI',
  required = false,
  disabled = false
}) => {
  const { validateDNI: validateWithReniec, isValidating, validationError } = useValidation();
  const [localError, setLocalError] = useState<string>('');
  const [validated, setValidated] = useState(false);

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 8);
    onChange(newValue);
    setLocalError('');
    setValidated(false);
  };

  const handleValidate = async () => {
    // Validación local primero
    const validation = validateDNI(value);
    if (!validation.isValid) {
      setLocalError(validation.error || 'DNI inválido');
      return;
    }

    // Validación con RENIEC
    const result = await validateWithReniec(value);

    if (result && result.success && result.data) {
      setValidated(true);
      setLocalError('');
      onValidated?.(result.data);
    } else {
      setLocalError(result?.error || validationError || 'No se pudo validar el DNI');
      setValidated(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValidate();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <FormInput
            label={label}
            required={required}
            value={value}
            onChange={handleDniChange}
            onKeyPress={handleKeyPress}
            placeholder="12345678"
            maxLength={8}
            error={localError || validationError || undefined}
            disabled={disabled || isValidating}
            rightElement={
              validated ? (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : null
            }
          />
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleValidate}
            disabled={value.length !== 8 || disabled || isValidating}
            isLoading={isValidating}
          >
            {validated ? 'Validado' : 'Validar'}
          </Button>
        </div>
      </div>

      {validated && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">DNI validado con RENIEC</span>
        </div>
      )}
    </div>
  );
};

export default DniValidator;
