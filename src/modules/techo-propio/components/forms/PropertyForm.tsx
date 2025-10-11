/**
 * PropertyForm - Step 3: Datos del Predio
 * Formulario alineado con PropertyInfoCreateDTO del backend
 */

import React from 'react';
import { PropertyInfo } from '../../types';
import { FormInput, Card } from '../common';
import { UbigeoSelector } from '../application';

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
  // ✅ FIX: Mantener una referencia actualizada para evitar problemas de React batching
  // Mismo patrón que en ApplicantForm
  const propertyRef = React.useRef(data);
  
  // Sincronizar la referencia cuando cambian las props
  React.useEffect(() => {
    propertyRef.current = data;
  }, [data]);
  
  const handleFieldChange = (field: keyof PropertyInfo, value: string | number | undefined) => {
    const updated = {
      ...propertyRef.current,
      [field]: value
    };
    propertyRef.current = updated;
    onChange(updated);
  };

  const handleUbigeoChange = (field: 'department' | 'province' | 'district', value: string) => {
    // ✅ Usar la referencia actualizada en lugar de data
    const updates: Partial<PropertyInfo> = {
      ...propertyRef.current,
      [field]: value
    };

    // Si cambia el departamento, limpiar provincia y distrito
    if (field === 'department' && value) {
      updates.province = '';
      updates.district = '';
    }

    // Si cambia la provincia, limpiar distrito
    if (field === 'province' && value) {
      updates.district = '';
    }

    // ✅ Actualizar la referencia inmediatamente
    propertyRef.current = updates;
    onChange(updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Paso 3: Datos del Predio
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Información sobre el terreno donde se construirá la vivienda.
        </p>
      </div>

      {/* Información General del Predio */}
      <Card title="Información General del Predio">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departamento, Provincia, Distrito */}
          <div className="md:col-span-2">
            <UbigeoSelector
              department={data.department || ''}
              province={data.province || ''}
              district={data.district || ''}
              onDepartmentChange={(value) => handleUbigeoChange('department', value)}
              onProvinceChange={(value) => handleUbigeoChange('province', value)}
              onDistrictChange={(value) => handleUbigeoChange('district', value)}
              required
              errors={{
                department: errors.department,
                province: errors.province,
                district: errors.district
              }}
            />
          </div>

          {/* Centro Poblado */}
          <FormInput
            label="Centro Poblado"
            value={data.populated_center || ''}
            onChange={(e) => handleFieldChange('populated_center', e.target.value)}
            placeholder="Nombre del centro poblado"
            error={errors.populated_center}
          />

          {/* Dirección */}
          <FormInput
            label="Dirección"
            required
            value={data.address || ''}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            placeholder="Av. Principal 123"
            error={errors.address}
          />

          {/* Manzana */}
          <FormInput
            label="Manzana"
            value={data.manzana || ''}
            onChange={(e) => handleFieldChange('manzana', e.target.value)}
            placeholder="A"
            error={errors.manzana}
          />

          {/* Lote */}
          <FormInput
            label="Lote"
            required
            value={data.lote || ''}
            onChange={(e) => handleFieldChange('lote', e.target.value)}
            placeholder="5"
            error={errors.lote}
          />

          {/* Sub-Lote */}
          <FormInput
            label="Sub-Lote"
            value={data.sub_lote || ''}
            onChange={(e) => handleFieldChange('sub_lote', e.target.value)}
            placeholder="A"
            error={errors.sub_lote}
          />

          {/* Referencia */}
          <div className="md:col-span-2">
            <FormInput
              label="Referencia"
              value={data.reference || ''}
              onChange={(e) => handleFieldChange('reference', e.target.value)}
              placeholder="Cerca del mercado central, al costado de la iglesia..."
              error={errors.reference}
              hint="Descripción de referencias para ubicar el predio"
            />
          </div>
        </div>
      </Card>

      {/* Coordenadas Geográficas (Opcional) */}
      <Card title="Coordenadas Geográficas (Opcional)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            type="number"
            label="Latitud"
            value={data.latitude || ''}
            onChange={(e) => handleFieldChange('latitude', parseFloat(e.target.value) || undefined)}
            placeholder="-12.0464"
            step="0.000001"
            min={-90}
            max={90}
            error={errors.latitude}
            hint="Entre -90 y 90 grados"
          />

          <FormInput
            type="number"
            label="Longitud"
            value={data.longitude || ''}
            onChange={(e) => handleFieldChange('longitude', parseFloat(e.target.value) || undefined)}
            placeholder="-77.0428"
            step="0.000001"
            min={-180}
            max={180}
            error={errors.longitude}
            hint="Entre -180 y 180 grados"
          />
        </div>
      </Card>

      {/* Información de Validación */}
      {data.ubigeo_validated && (
        <Card>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-green-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold text-green-800">Ubicación Validada</p>
                <p className="text-sm text-green-700">
                  Los datos de ubicación han sido verificados con el sistema UBIGEO.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PropertyForm;
