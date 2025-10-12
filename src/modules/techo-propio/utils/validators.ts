/**
 * Validation utilities for Techo Propio Module
 */

import { VALIDATION_RULES } from './constants';
import {
  Applicant,
  HouseholdMember,
  EconomicInfo,
  PropertyInfo,
  ApplicationFormData
} from '../types';

// ==================== BASIC VALIDATORS ====================

export const validateDNI = (dni: string): { isValid: boolean; error?: string } => {
  if (!dni) {
    return { isValid: false, error: 'El DNI es requerido' };
  }

  if (!VALIDATION_RULES.DNI.pattern.test(dni)) {
    return { isValid: false, error: VALIDATION_RULES.DNI.errorMessage };
  }

  return { isValid: true };
};

export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'El teléfono es requerido' };
  }

  if (!VALIDATION_RULES.PHONE.pattern.test(phone)) {
    return { isValid: false, error: VALIDATION_RULES.PHONE.errorMessage };
  }

  return { isValid: true };
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'El email es requerido' };
  }

  if (!VALIDATION_RULES.EMAIL.pattern.test(email)) {
    return { isValid: false, error: VALIDATION_RULES.EMAIL.errorMessage };
  }

  return { isValid: true };
};

export const validatePositiveNumber = (value: number): { isValid: boolean; error?: string } => {
  if (value === undefined || value === null) {
    return { isValid: false, error: 'El valor es requerido' };
  }

  if (value < 0) {
    return { isValid: false, error: VALIDATION_RULES.POSITIVE_NUMBER.errorMessage };
  }

  return { isValid: true };
};

export const validateDate = (date: string): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: 'La fecha es requerida' };
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: 'Fecha inválida' };
  }

  return { isValid: true };
};

export const validateAge = (birthDate: string, minAge: number = 18): { isValid: boolean; error?: string } => {
  const dateValidation = validateDate(birthDate);
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    const calculatedAge = age - 1;
    if (calculatedAge < minAge) {
      return { isValid: false, error: `Debe ser mayor de ${minAge} años` };
    }
  } else if (age < minAge) {
    return { isValid: false, error: `Debe ser mayor de ${minAge} años` };
  }

  // Check if date is not in the future
  if (birth > today) {
    return { isValid: false, error: 'La fecha no puede ser futura' };
  }

  return { isValid: true };
};

export const validateRequired = (value: any, fieldName: string = 'Este campo'): { isValid: boolean; error?: string } => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  return { isValid: true };
};

// ==================== COMPLEX VALIDATORS ====================

export const validateApplicant = (applicant: Partial<Applicant>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // DNI
  const dniValidation = validateDNI(applicant.dni || '');
  if (!dniValidation.isValid) errors.dni = dniValidation.error!;

  // Names
  if (!applicant.first_name?.trim()) errors.first_name = 'El nombre es requerido';
  if (!applicant.last_name?.trim()) errors.last_name = 'El apellido es requerido';

  // Birth date
  const birthDateValidation = validateAge(applicant.birth_date || '');
  if (!birthDateValidation.isValid) errors.birth_date = birthDateValidation.error!;

  // Gender
  if (!applicant.gender) errors.gender = 'El género es requerido';

  // Marital status
  if (!applicant.marital_status) errors.marital_status = 'El estado civil es requerido';

  // Phone
  const phoneValidation = validatePhone(applicant.phone || '');
  if (!phoneValidation.isValid) errors.phone = phoneValidation.error!;

  // Email
  const emailValidation = validateEmail(applicant.email || '');
  if (!emailValidation.isValid) errors.email = emailValidation.error!;

  // Current address
  if (!applicant.current_address?.department) errors['current_address.department'] = 'El departamento es requerido';
  if (!applicant.current_address?.province) errors['current_address.province'] = 'La provincia es requerida';
  if (!applicant.current_address?.district) errors['current_address.district'] = 'El distrito es requerido';
  if (!applicant.current_address?.address?.trim()) errors['current_address.address'] = 'La dirección es requerida';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateHouseholdMember = (member: Partial<HouseholdMember>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // DNI
  const dniValidation = validateDNI(member.dni || '');
  if (!dniValidation.isValid) errors.dni = dniValidation.error!;

  // Names
  if (!member.first_name?.trim()) errors.first_name = 'El nombre es requerido';
  if (!member.apellido_paterno?.trim()) errors.apellido_paterno = 'El apellido paterno es requerido';
  if (!member.apellido_materno?.trim()) errors.apellido_materno = 'El apellido materno es requerido';

  // Birth date
  const birthDateValidation = validateDate(member.birth_date || '');
  if (!birthDateValidation.isValid) errors.birth_date = birthDateValidation.error!;

  // Marital status
  if (!member.marital_status) errors.marital_status = 'El estado civil es requerido';

  // Education level
  if (!member.education_level) errors.education_level = 'El grado de instrucción es requerido';

  // Occupation
  if (!member.occupation?.trim()) errors.occupation = 'La ocupación es requerida';

  // Employment situation
  if (!member.employment_situation) errors.employment_situation = 'La situación laboral es requerida';

  // Employment condition
  if (!member.employment_condition) errors.employment_condition = 'La condición laboral es requerida';

  // Monthly income
  const incomeValidation = validatePositiveNumber(member.monthly_income || 0);
  if (!incomeValidation.isValid) errors.monthly_income = incomeValidation.error!;

  // Disability type
  if (!member.disability_type) errors.disability_type = 'Debe indicar si tiene discapacidad';

  // Relationship (optional)
  // No es requerido porque puede ser el cónyuge/conviviente

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateEconomicInfo = (economicInfo: Partial<EconomicInfo>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Occupation
  if (!economicInfo.occupation?.trim()) errors.occupation = 'La ocupación es requerida';

  // Employment years
  const employmentYearsValidation = validatePositiveNumber(economicInfo.employment_years || 0);
  if (!employmentYearsValidation.isValid) errors.employment_years = employmentYearsValidation.error!;

  // Income
  if (!economicInfo.income) {
    errors.income = 'La información de ingresos es requerida';
  } else {
    const mainIncomeValidation = validatePositiveNumber(economicInfo.income.main_income);
    if (!mainIncomeValidation.isValid) errors['income.main_income'] = 'El ingreso principal es requerido';

    const additionalIncomeValidation = validatePositiveNumber(economicInfo.income.additional_income);
    if (!additionalIncomeValidation.isValid) errors['income.additional_income'] = 'El ingreso adicional es requerido (puede ser 0)';
  }

  // Expenses
  if (!economicInfo.expenses) {
    errors.expenses = 'La información de gastos es requerida';
  } else {
    if (validatePositiveNumber(economicInfo.expenses.housing).error) errors['expenses.housing'] = 'Los gastos de vivienda son requeridos';
    if (validatePositiveNumber(economicInfo.expenses.food).error) errors['expenses.food'] = 'Los gastos de alimentación son requeridos';
    if (validatePositiveNumber(economicInfo.expenses.education).error) errors['expenses.education'] = 'Los gastos de educación son requeridos';
    if (validatePositiveNumber(economicInfo.expenses.health).error) errors['expenses.health'] = 'Los gastos de salud son requeridos';
    if (validatePositiveNumber(economicInfo.expenses.transport).error) errors['expenses.transport'] = 'Los gastos de transporte son requeridos';
    if (validatePositiveNumber(economicInfo.expenses.other).error) errors['expenses.other'] = 'Otros gastos son requeridos';
  }

  // Debts
  if (economicInfo.has_debts === undefined) errors.has_debts = 'Debe indicar si tiene deudas';
  if (economicInfo.has_debts && !economicInfo.debt_amount) errors.debt_amount = 'El monto de la deuda es requerido';
  if (economicInfo.has_debts && !economicInfo.debt_description?.trim()) errors.debt_description = 'La descripción de la deuda es requerida';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePropertyInfo = (propertyInfo: Partial<PropertyInfo>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Campos obligatorios del nuevo PropertyInfo (alineado con backend)
  if (!propertyInfo.department?.trim()) errors.department = 'El departamento es requerido';
  if (!propertyInfo.province?.trim()) errors.province = 'La provincia es requerida';  
  if (!propertyInfo.district?.trim()) errors.district = 'El distrito es requerido';
  if (!propertyInfo.lote?.trim()) errors.lote = 'El lote es requerido';
  if (!propertyInfo.address?.trim()) errors.address = 'La dirección es requerida';

  // Validación de dirección (debe tener al menos 5 caracteres)
  if (propertyInfo.address && propertyInfo.address.trim().length < 5) {
    errors.address = 'La dirección debe tener al menos 5 caracteres';
  }

  // Validación de coordenadas si se proporcionan
  if (propertyInfo.latitude !== undefined) {
    if (propertyInfo.latitude < -90 || propertyInfo.latitude > 90) {
      errors.latitude = 'La latitud debe estar entre -90 y 90 grados';
    }
  }

  if (propertyInfo.longitude !== undefined) {
    if (propertyInfo.longitude < -180 || propertyInfo.longitude > 180) {
      errors.longitude = 'La longitud debe estar entre -180 y 180 grados';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateApplicationForm = (formData: ApplicationFormData): { isValid: boolean; errors: Record<string, any> } => {
  const errors: Record<string, any> = {};

  // Step 1: User Data (Control interno)
  if (formData.user_data) {
    if (!formData.user_data.dni || formData.user_data.dni.length !== 8) {
      errors.user_data = { dni: 'DNI debe tener 8 dígitos' };
    }
    if (!formData.user_data.names || formData.user_data.names.trim().length < 2) {
      if (!errors.user_data) errors.user_data = {};
      errors.user_data.names = 'Nombres son obligatorios';
    }
  } else {
    errors.user_data = { _form: 'Los datos del usuario son requeridos' };
  }

  // Step 2: Head of Family
  if (formData.head_of_family) {
    if (!formData.head_of_family.dni && !formData.head_of_family.document_number) {
      errors.head_of_family = { dni: 'DNI del jefe de familia es obligatorio' };
    }
    if (!formData.head_of_family.first_name || formData.head_of_family.first_name.trim().length < 2) {
      if (!errors.head_of_family) errors.head_of_family = {};
      errors.head_of_family.first_name = 'Nombres del jefe de familia son obligatorios';
    }
  } else {
    errors.head_of_family = { _form: 'Los datos del jefe de familia son requeridos' };
  }

  // Step 2: Spouse (opcional pero si existe debe ser válido)
  if (formData.spouse) {
    if (!formData.spouse.dni && !formData.spouse.document_number) {
      errors.spouse = { dni: 'DNI del cónyuge es obligatorio' };
    }
  }

  // Step 2: Household members
  if (formData.household_members && formData.household_members.length > 0) {
    const membersErrors: Record<number, any> = {};
    formData.household_members.forEach((member, index) => {
      const memberValidation = validateHouseholdMember(member);
      if (!memberValidation.isValid) {
        membersErrors[index] = memberValidation.errors;
      }
    });
    if (Object.keys(membersErrors).length > 0) {
      errors.household_members = membersErrors;
    }
  }

  // Step 3: Economic info - Validar que el jefe de familia tenga info económica en household_members
  if (formData.household_members && formData.head_of_family) {
    const headOfFamilyMember = formData.household_members.find(member => 
      member.first_name === formData.head_of_family?.first_name && 
      member.apellido_paterno === formData.head_of_family?.paternal_surname
    );
    
    if (!headOfFamilyMember || !headOfFamilyMember.monthly_income || headOfFamilyMember.monthly_income <= 0) {
      errors.head_of_family_economic = { _form: 'Debe completar la información económica del jefe de familia en el Paso 2 (Grupo Familiar)' };
    }
  } else {
    errors.head_of_family_economic = { _form: 'Faltan datos del jefe de familia o miembros del hogar' };
  }

  // Step 4: Property info
  if (formData.property_info) {
    const propertyValidation = validatePropertyInfo(formData.property_info);
    if (!propertyValidation.isValid) {
      errors.property_info = propertyValidation.errors;
    }
  } else {
    errors.property_info = { _form: 'Los datos del predio son requeridos' };
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ==================== HELPER FUNCTIONS ====================

export const getFieldError = (errors: Record<string, any>, fieldPath: string): string | undefined => {
  const keys = fieldPath.split('.');
  let current: any = errors;

  for (const key of keys) {
    if (current[key] === undefined) return undefined;
    current = current[key];
  }

  return typeof current === 'string' ? current : undefined;
};

export const hasFieldError = (errors: Record<string, any>, fieldPath: string): boolean => {
  return !!getFieldError(errors, fieldPath);
};

// ==================== FORM STEP VALIDATORS (Helper functions for wizard) ====================

/**
 * Validates applicant form step and returns array of error messages
 */
export const validateApplicantForm = (applicant?: Partial<Applicant>): string[] => {
  if (!applicant) {
    return ['Debe completar los datos del solicitante'];
  }

  const validation = validateApplicant(applicant);
  if (validation.isValid) {
    return [];
  }

  return Object.values(validation.errors);
};

/**
 * Validates economic info form step and returns array of error messages
 */
export const validateEconomicForm = (economicInfo?: Partial<EconomicInfo>): string[] => {
  if (!economicInfo) {
    return ['Debe completar la información económica'];
  }

  const validation = validateEconomicInfo(economicInfo);
  if (validation.isValid) {
    return [];
  }

  return Object.values(validation.errors);
};

/**
 * Validates property info form step and returns array of error messages
 */
export const validatePropertyForm = (propertyInfo?: Partial<PropertyInfo>): string[] => {
  if (!propertyInfo) {
    return ['Debe completar los datos del predio'];
  }

  const validation = validatePropertyInfo(propertyInfo);
  if (validation.isValid) {
    return [];
  }

  return Object.values(validation.errors);
};
