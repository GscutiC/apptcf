/**
 * HouseholdForm - Step 2: Grupo Familiar
 */

import React, { useState } from 'react';
import { HouseholdMember, RelationshipType } from '../../types';
import { FormInput, FormSelect, Button, Card } from '../common';
import { RELATIONSHIP_OPTIONS } from '../../utils';

interface HouseholdFormProps {
  data: HouseholdMember[];
  onChange: (data: HouseholdMember[]) => void;
  errors?: Record<number, Record<string, string>>;
}

export const HouseholdForm: React.FC<HouseholdFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentMember, setCurrentMember] = useState<Partial<HouseholdMember>>({});

  const handleAddMember = () => {
    if (editingIndex !== null) {
      // Editar miembro existente
      const updated = [...data];
      updated[editingIndex] = { ...currentMember, id: data[editingIndex].id } as HouseholdMember;
      onChange(updated);
      setEditingIndex(null);
    } else {
      // Agregar nuevo miembro
      onChange([...data, { ...currentMember, id: Date.now().toString() } as HouseholdMember]);
    }
    setCurrentMember({});
  };

  const handleRemoveMember = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleEditMember = (index: number) => {
    setCurrentMember(data[index]);
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setCurrentMember({});
    setEditingIndex(null);
  };

  const isFormValid = () => {
    return (
      currentMember.dni?.length === 8 &&
      currentMember.first_name?.trim() &&
      currentMember.last_name?.trim() &&
      currentMember.birth_date &&
      currentMember.relationship &&
      currentMember.occupation?.trim() &&
      currentMember.monthly_income !== undefined &&
      currentMember.monthly_income >= 0
    );
  };

  const totalIncome = data.reduce((sum, member) => sum + (member.monthly_income || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Paso 2: Grupo Familiar
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Agregue los miembros del hogar. El ingreso familiar total se calculará automáticamente.
        </p>
      </div>

      {/* Formulario para agregar/editar miembro */}
      <Card title={editingIndex !== null ? 'Editar Miembro' : 'Agregar Miembro'}>
        <div className="space-y-4">
          {/* DNI, Nombres, Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="DNI"
              required
              value={currentMember.dni || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
              placeholder="12345678"
              maxLength={8}
            />

            <FormInput
              label="Nombres"
              required
              value={currentMember.first_name || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, first_name: e.target.value })}
              placeholder="María"
            />

            <FormInput
              label="Apellidos"
              required
              value={currentMember.last_name || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, last_name: e.target.value })}
              placeholder="García"
            />
          </div>

          {/* Fecha nacimiento, Relación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="date"
              label="Fecha de Nacimiento"
              required
              value={currentMember.birth_date || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, birth_date: e.target.value })}
            />

            <FormSelect
              label="Relación con el Solicitante"
              required
              value={currentMember.relationship || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, relationship: e.target.value as RelationshipType })}
              options={RELATIONSHIP_OPTIONS}
            />
          </div>

          {/* Ocupación, Ingreso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Ocupación"
              required
              value={currentMember.occupation || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, occupation: e.target.value })}
              placeholder="Empleado, Estudiante, etc."
            />

            <FormInput
              type="number"
              label="Ingreso Mensual (S/)"
              required
              value={currentMember.monthly_income || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, monthly_income: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddMember}
              disabled={!isFormValid()}
              variant="primary"
            >
              {editingIndex !== null ? 'Actualizar Miembro' : 'Agregar Miembro'}
            </Button>

            {editingIndex !== null && (
              <Button onClick={handleCancelEdit} variant="secondary">
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Lista de miembros */}
      {data.length > 0 && (
        <Card title="Miembros del Hogar">
          <div className="space-y-3">
            {data.map((member, index) => (
              <div
                key={member.id || index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {member.first_name} {member.last_name}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                    <span>DNI: {member.dni}</span>
                    <span>Relación: {RELATIONSHIP_OPTIONS.find(r => r.value === member.relationship)?.label}</span>
                    <span>Ocupación: {member.occupation}</span>
                    <span className="font-medium text-green-700">S/ {member.monthly_income.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditMember(index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleRemoveMember(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Total de miembros: <span className="text-gray-900">{data.length}</span>
            </span>
            <span className="text-sm font-medium text-gray-700">
              Ingreso familiar total: <span className="text-green-700 text-lg">S/ {totalIncome.toFixed(2)}</span>
            </span>
          </div>
        </Card>
      )}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-medium">No hay miembros agregados</p>
          <p className="text-sm mt-1">Agregue al menos un miembro del hogar para continuar</p>
        </div>
      )}
    </div>
  );
};

export default HouseholdForm;
