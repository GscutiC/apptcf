/**
 * PropertyForm - Step 4: Datos del Predio
 */

import React from 'react';
import { PropertyInfo, PropertyType, LandOwnership } from '../../types';
import { FormInput, FormSelect, Card } from '../common';
import { UbigeoSelector } from '../application';
import { PROPERTY_TYPE_OPTIONS, LAND_OWNERSHIP_OPTIONS } from '../../utils';

interface PropertyFormProps {
  data: Partial<PropertyInfo>;
  onChange: (data: Partial<PropertyInfo>) => void;
  errors?: Record<string, string>;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const handleLocationChange = (field: string, value: string) => {
    // Crear el nuevo objeto de ubicación con los valores actualizados
    const updatedLocation = {
      department: data.property_location?.department || '',
      province: data.property_location?.province || '',
      district: data.property_location?.district || '',
      address: data.property_location?.address || '',
      reference: data.property_location?.reference || ''
    };

    // Actualizar el campo específico
    updatedLocation[field as keyof typeof updatedLocation] = value;

    // Si cambia el departamento, limpiar provincia y distrito
    if (field === 'department') {
      updatedLocation.province = '';
      updatedLocation.district = '';
    }

    // Si cambia la provincia, limpiar distrito
    if (field === 'province') {
      updatedLocation.district = '';
    }

    onChange({
      ...data,
      property_location: updatedLocation
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Paso 4: Datos del Predio
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Información sobre el terreno donde se construirá la vivienda.
        </p>
      </div>

      {/* Tipo de Predio y Tenencia */}
      <Card title="Información General">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Tipo de Predio"
            required
            value={data.property_type || ''}
            onChange={(e) => onChange({ ...data, property_type: e.target.value as PropertyType })}
            options={PROPERTY_TYPE_OPTIONS}
            error={errors.property_type}
          />

          <FormSelect
            label="Tipo de Tenencia"
            required
            value={data.land_ownership || ''}
            onChange={(e) => onChange({ ...data, land_ownership: e.target.value as LandOwnership })}
            options={LAND_OWNERSHIP_OPTIONS}
            error={errors.land_ownership}
            hint="Documento que acredita la posesión del terreno"
          />
        </div>
      </Card>

      {/* Área y Servicios */}
      <Card title="Características del Terreno">
        <div className="space-y-4">
          <FormInput
            type="number"
            label="Área del Terreno (m²)"
            required
            value={data.land_area || ''}
            onChange={(e) => onChange({ ...data, land_area: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.01"
            error={errors.land_area}
            hint="Área en metros cuadrados"
          />

          <FormInput
            label="Código Catastral (Opcional)"
            value={data.cadastral_code || ''}
            onChange={(e) => onChange({ ...data, cadastral_code: e.target.value })}
            placeholder="Ej: 12345678901234"
          />

          <div>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="has_services"
                checked={data.has_services || false}
                onChange={(e) => onChange({ ...data, has_services: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="has_services" className="text-sm font-medium text-gray-700">
                El terreno cuenta con servicios básicos
              </label>
            </div>

            {data.has_services && (
              <FormInput
                label="Descripción de Servicios"
                value={data.services_description || ''}
                onChange={(e) => onChange({ ...data, services_description: e.target.value })}
                placeholder="Ej: Agua, luz, desagüe"
                hint="Indique qué servicios tiene disponibles"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Ubicación del Predio */}
      <Card title="Ubicación del Predio">
        <div className="space-y-4">
          <UbigeoSelector
            department={data.property_location?.department || ''}
            province={data.property_location?.province || ''}
            district={data.property_location?.district || ''}
            onDepartmentChange={(value) => handleLocationChange('department', value)}
            onProvinceChange={(value) => handleLocationChange('province', value)}
            onDistrictChange={(value) => handleLocationChange('district', value)}
            required
            errors={{
              department: errors['property_location.department'],
              province: errors['property_location.province'],
              district: errors['property_location.district']
            }}
          />

          <FormInput
            label="Dirección del Predio"
            required
            value={data.property_location?.address || ''}
            onChange={(e) => handleLocationChange('address', e.target.value)}
            placeholder="Av. Principal 123, Mz. A Lt. 5"
            error={errors['property_location.address']}
          />

          <FormInput
            label="Referencia (Opcional)"
            value={data.property_location?.reference || ''}
            onChange={(e) => handleLocationChange('reference', e.target.value)}
            placeholder="Cerca del mercado central, al costado de..."
          />
        </div>
      </Card>
    </div>
  );
};

export default PropertyForm;
