/**
 * UbigeoSelector Component - Cascading selectors for Department > Province > District
 */

import React, { useEffect, useState } from 'react';
import { FormSelect } from '../common';
import { useValidation } from '../../hooks';

interface UbigeoSelectorProps {
  department?: string;
  province?: string;
  district?: string;
  onDepartmentChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  errors?: {
    department?: string;
    province?: string;
    district?: string;
  };
  required?: boolean;
  disabled?: boolean;
}

export const UbigeoSelector: React.FC<UbigeoSelectorProps> = ({
  department = '',
  province = '',
  district = '',
  onDepartmentChange,
  onProvinceChange,
  onDistrictChange,
  errors = {},
  required = false,
  disabled = false
}) => {
  const {
    departments,
    provinces,
    districts,
    loadDepartments,
    loadProvinces,
    loadDistricts,
    clearUbigeo,
    isLoadingUbigeo,
    validationError
  } = useValidation();

  const [selectedDept, setSelectedDept] = useState(department);
  const [selectedProv, setSelectedProv] = useState(province);
  const [selectedDist, setSelectedDist] = useState(district);

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Load provinces when department changes
  useEffect(() => {
    if (selectedDept) {
      // Now selectedDept is already the department name
      loadProvinces(selectedDept);
    } else {
      clearUbigeo();
    }
  }, [selectedDept]);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProv && selectedDept) {
      // Now selectedDept and selectedProv are already the names
      loadDistricts(selectedDept, selectedProv);
    }
  }, [selectedProv, selectedDept]);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDept(value);
    setSelectedProv('');
    setSelectedDist('');
    onDepartmentChange(value);
    // NO limpiar provincia y distrito en el padre - ApplicantForm lo hará
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProv(value);
    setSelectedDist('');
    onProvinceChange(value);
    // NO limpiar distrito en el padre - ApplicantForm lo hará
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDist(value);
    onDistrictChange(value);
  };

  const departmentOptions = departments.map((dept) => ({
    value: dept.name,
    label: dept.name
  }));

  const provinceOptions = provinces.map((prov) => ({
    value: prov.name,
    label: prov.name
  }));

  const districtOptions = districts.map((dist) => ({
    value: dist.name,
    label: dist.name
  }));

  return (
    <div className="space-y-4">
      <FormSelect
        label="Departamento"
        required={required}
        value={selectedDept}
        onChange={handleDepartmentChange}
        options={departmentOptions}
        placeholder="Seleccionar departamento"
        disabled={disabled || isLoadingUbigeo}
        error={errors.department}
      />

      <FormSelect
        key={`province-${selectedDept}-${provinces.length}`}
        label="Provincia"
        required={required}
        value={selectedProv}
        onChange={handleProvinceChange}
        options={provinceOptions}
        placeholder={selectedDept ? 'Seleccionar provincia' : 'Primero selecciona un departamento'}
        disabled={!selectedDept || disabled || isLoadingUbigeo}
        error={errors.province}
      />

      <FormSelect
        key={`district-${selectedProv}-${districts.length}`}
        label="Distrito"
        required={required}
        value={selectedDist}
        onChange={handleDistrictChange}
        options={districtOptions}
        placeholder={selectedProv ? 'Seleccionar distrito' : 'Primero selecciona una provincia'}
        disabled={!selectedProv || disabled || isLoadingUbigeo}
        error={errors.district}
      />

      {validationError && (
        <p className="text-sm text-red-600 mt-2">{validationError}</p>
      )}

      {isLoadingUbigeo && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Cargando ubicaciones...</span>
        </div>
      )}
    </div>
  );
};

export default UbigeoSelector;
