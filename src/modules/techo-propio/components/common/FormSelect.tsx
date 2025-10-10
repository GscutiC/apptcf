/**
 * FormSelect Component - Select dropdown with label and error handling
 */

import React, { SelectHTMLAttributes } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: Option[];
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  hint,
  required,
  options,
  placeholder = 'Seleccionar...',
  className = '',
  ...selectProps
}) => {
  const selectId = selectProps.id || selectProps.name || `select-${Math.random()}`;
  const hasError = !!error;

  const selectClasses = `
    w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
    ${hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
    }
    ${selectProps.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        id={selectId}
        className={selectClasses}
        {...selectProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>

      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;
