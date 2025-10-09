/**
 * EconomicForm - Step 3: Información Económica
 */

import React, { useEffect } from 'react';
import { EconomicInfo, MonthlyIncome, MonthlyExpenses } from '../../types';
import { FormInput, Card } from '../common';
import { formatCurrency } from '../../utils';

interface EconomicFormProps {
  data: Partial<EconomicInfo>;
  onChange: (data: Partial<EconomicInfo>) => void;
  errors?: Record<string, string>;
}

export const EconomicForm: React.FC<EconomicFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const handleIncomeChange = (field: keyof MonthlyIncome, value: number) => {
    const income = { ...data.income, [field]: value } as MonthlyIncome;
    income.total_income = income.main_income + income.additional_income;
    onChange({ ...data, income });
  };

  const handleExpenseChange = (field: keyof MonthlyExpenses, value: number) => {
    const expenses = { ...data.expenses, [field]: value } as MonthlyExpenses;
    expenses.total_expenses =
      expenses.housing + expenses.food + expenses.education +
      expenses.health + expenses.transport + expenses.other;
    onChange({ ...data, expenses });
  };

  const balance = (data.income?.total_income || 0) - (data.expenses?.total_expenses || 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Paso 3: Información Económica
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Registre los ingresos y gastos mensuales del hogar.
        </p>
      </div>

      {/* Información Laboral */}
      <Card title="Información Laboral">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Ocupación Principal"
              required
              value={data.occupation || ''}
              onChange={(e) => onChange({ ...data, occupation: e.target.value })}
              error={errors.occupation}
            />
            <FormInput
              label="Nombre del Empleador (Opcional)"
              value={data.employer_name || ''}
              onChange={(e) => onChange({ ...data, employer_name: e.target.value })}
            />
          </div>
          <FormInput
            type="number"
            label="Años de Experiencia"
            required
            value={data.employment_years || ''}
            onChange={(e) => onChange({ ...data, employment_years: parseInt(e.target.value) || 0 })}
            min="0"
            error={errors.employment_years}
          />
        </div>
      </Card>

      {/* Ingresos */}
      <Card title="Ingresos Mensuales (S/)">
        <div className="space-y-4">
          <FormInput
            type="number"
            label="Ingreso Principal"
            required
            value={data.income?.main_income || ''}
            onChange={(e) => handleIncomeChange('main_income', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            error={errors['income.main_income']}
          />
          <FormInput
            type="number"
            label="Ingresos Adicionales"
            value={data.income?.additional_income || ''}
            onChange={(e) => handleIncomeChange('additional_income', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
          <div className="pt-3 border-t">
            <p className="font-semibold text-green-700">
              Ingreso Total: {formatCurrency(data.income?.total_income || 0)}
            </p>
          </div>
        </div>
      </Card>

      {/* Gastos */}
      <Card title="Gastos Mensuales (S/)">
        <div className="grid grid-cols-2 gap-4">
          <FormInput type="number" label="Vivienda" value={data.expenses?.housing || ''} onChange={(e) => handleExpenseChange('housing', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
          <FormInput type="number" label="Alimentación" value={data.expenses?.food || ''} onChange={(e) => handleExpenseChange('food', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
          <FormInput type="number" label="Educación" value={data.expenses?.education || ''} onChange={(e) => handleExpenseChange('education', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
          <FormInput type="number" label="Salud" value={data.expenses?.health || ''} onChange={(e) => handleExpenseChange('health', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
          <FormInput type="number" label="Transporte" value={data.expenses?.transport || ''} onChange={(e) => handleExpenseChange('transport', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
          <FormInput type="number" label="Otros" value={data.expenses?.other || ''} onChange={(e) => handleExpenseChange('other', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
        </div>
        <div className="pt-3 border-t mt-4">
          <p className="font-semibold text-red-700">
            Gastos Totales: {formatCurrency(data.expenses?.total_expenses || 0)}
          </p>
        </div>
      </Card>

      {/* Balance */}
      <Card>
        <div className={`text-center py-4 ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
          <p className="text-sm text-gray-600 mb-1">Balance Mensual</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </Card>

      {/* Deudas */}
      <Card title="Deudas (Opcional)">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="has_debts"
              checked={data.has_debts || false}
              onChange={(e) => onChange({ ...data, has_debts: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="has_debts" className="text-sm font-medium text-gray-700">
              Tiene deudas actualmente
            </label>
          </div>

          {data.has_debts && (
            <>
              <FormInput
                type="number"
                label="Monto Total de Deudas (S/)"
                value={data.debt_amount || ''}
                onChange={(e) => onChange({ ...data, debt_amount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
              <FormInput
                label="Descripción de las Deudas"
                value={data.debt_description || ''}
                onChange={(e) => onChange({ ...data, debt_description: e.target.value })}
                placeholder="Ej: Préstamo bancario, tarjeta de crédito, etc."
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EconomicForm;
