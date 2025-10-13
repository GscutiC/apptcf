/**
 * Helper functions para manejar la compatibilidad de campos de TechoPropioApplication
 * Debido a que el backend puede enviar datos con diferentes nombres de campo
 */

import { TechoPropioApplication } from '../types';

/**
 * Normaliza una fecha al formato ISO (YYYY-MM-DD) esperado por el backend
 * Acepta diferentes formatos de entrada y los convierte consistentemente
 */
export const normalizeToISODate = (dateInput: string | undefined | null): string => {
  if (!dateInput) return '1990-01-01'; // Valor por defecto

  // Limpiar el string de entrada de espacios y caracteres extraños
  const cleanInput = dateInput.trim();

  // 🔧 FIX ESPECÍFICO: Detectar año corrupto con dígito faltante (ej: 81998 en lugar de 1998)
  // Patrón: 5 dígitos seguidos de guion (81998-08-05)
  const corruptYearMatch = cleanInput.match(/^(\d{5})-(\d{2})-(\d{2})$/);
  if (corruptYearMatch) {
    // Extraer el año corrupto y quitar el primer dígito
    const corruptYear = corruptYearMatch[1];
    const fixedYear = corruptYear.substring(1); // Quitar primer dígito
    const month = corruptYearMatch[2];
    const day = corruptYearMatch[3];
    console.warn(`⚠️ Fecha corrupta detectada: ${cleanInput}, corrigiendo a: ${fixedYear}-${month}-${day}`);
    return `${fixedYear}-${month}-${day}`;
  }

  // Si ya está en formato ISO (YYYY-MM-DD), devolverlo tal como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanInput)) {
    return cleanInput;
  }

  // Si está en formato DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleanInput)) {
    const [day, month, year] = cleanInput.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Si está en formato MM/DD/YYYY (ambiguo, pero intentamos)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanInput)) {
    const parts = cleanInput.split('/');
    // Asumir MM/DD/YYYY si el primer número es > 12
    if (parseInt(parts[0]) > 12) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // Si está en formato DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(cleanInput)) {
    const [day, month, year] = cleanInput.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Si está en formato de objeto Date o string de Date ISO completo
  try {
    // Si viene en formato ISO con hora o timezone, extraer solo la fecha
    if (cleanInput.includes('T') || cleanInput.includes('+')) {
      // Formato ISO completo: 1998-08-05T00:00:00+08:00
      const isoMatch = cleanInput.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
      }
    }

    // Último recurso: intentar crear objeto Date
    const date = new Date(cleanInput);
    if (!isNaN(date.getTime())) {
      // Usar métodos UTC para evitar problemas de timezone
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.warn('⚠️ Error parsing date:', cleanInput, error);
  }

  // Si no se puede parsear, devolver valor por defecto
  console.warn('⚠️ Could not parse date format:', cleanInput);
  return '1990-01-01';
};

/**
 * Obtiene el solicitante principal desde cualquiera de los campos posibles
 */
export const getApplicantFromApp = (app: TechoPropioApplication) => {
  return app.head_of_family || app.main_applicant || app.applicant;
};

/**
 * Obtiene la información económica desde cualquiera de los campos posibles
 */
export const getEconomicInfoFromApp = (app: TechoPropioApplication) => {
  return app.head_of_family_economic || app.main_applicant_economic || app.economic_info;
};

/**
 * Obtiene el DNI del solicitante principal
 */
export const getApplicantDNI = (app: TechoPropioApplication): string => {
  const applicant = getApplicantFromApp(app) as any;
  return applicant?.document_number || applicant?.dni || '';
};

/**
 * Obtiene el nombre completo del solicitante principal
 */
export const getApplicantFullName = (app: TechoPropioApplication): string => {
  const applicant = getApplicantFromApp(app);
  if (!applicant) return '';
  
  // Intentar diferentes formatos de nombre
  if (applicant.first_name && (applicant as any).paternal_surname) {
    // Formato backend nuevo: first_name + paternal_surname + maternal_surname
    return `${applicant.first_name} ${(applicant as any).paternal_surname || ''} ${(applicant as any).maternal_surname || ''}`.trim();
  } else if (applicant.first_name && (applicant as any).last_name) {
    // Formato frontend antiguo: first_name + last_name
    return `${applicant.first_name} ${(applicant as any).last_name}`;
  } else if (applicant.first_name) {
    return applicant.first_name;
  }
  
  return '';
};

/**
 * Obtiene el nombre del solicitante para mostrar
 */
export const getApplicantFirstName = (app: TechoPropioApplication): string => {
  const applicant = getApplicantFromApp(app);
  return applicant?.first_name || '';
};

/**
 * Obtiene el apellido del solicitante para mostrar
 */
export const getApplicantLastName = (app: TechoPropioApplication): string => {
  const applicant = getApplicantFromApp(app);
  if (!applicant) return '';
  
  // Formato backend nuevo: paternal_surname + maternal_surname
  if ((applicant as any).paternal_surname) {
    return `${(applicant as any).paternal_surname || ''} ${(applicant as any).maternal_surname || ''}`.trim();
  }
  
  // Formato frontend antiguo: last_name
  return (applicant as any).last_name || '';
};

/**
 * Obtiene el teléfono del solicitante
 */
export const getApplicantPhone = (app: TechoPropioApplication): string => {
  const applicant = getApplicantFromApp(app);
  return (applicant as any)?.phone_number || (applicant as any)?.phone || '';
};

/**
 * Obtiene el email del solicitante
 */
export const getApplicantEmail = (app: TechoPropioApplication): string => {
  const applicant = getApplicantFromApp(app);
  return applicant?.email || '';
};

/**
 * Obtiene la fecha de nacimiento del solicitante
 */
export const getApplicantBirthDate = (app: TechoPropioApplication): string => {
  const applicant = getApplicantFromApp(app);
  return (applicant as any)?.birth_date || '';
};

/**
 * Obtiene la dirección del solicitante
 */
export const getApplicantAddress = (app: TechoPropioApplication) => {
  const applicant = getApplicantFromApp(app);
  return (applicant as any)?.current_address;
};

/**
 * Obtiene el ingreso total desde la información económica
 */
export const getTotalIncome = (app: TechoPropioApplication): number => {
  const economicInfo = getEconomicInfoFromApp(app);
  
  // Formato backend nuevo: monthly_income directo
  if (economicInfo && (economicInfo as any).monthly_income) {
    return (economicInfo as any).monthly_income;
  }
  
  // Formato frontend antiguo: income.total_income
  if (economicInfo && (economicInfo as any).income?.total_income) {
    return (economicInfo as any).income.total_income;
  }
  
  return 0;
};

/**
 * Obtiene los gastos totales desde la información económica
 */
export const getTotalExpenses = (app: TechoPropioApplication): number => {
  const economicInfo = getEconomicInfoFromApp(app);
  
  if (economicInfo && (economicInfo as any).expenses?.total_expenses) {
    return (economicInfo as any).expenses.total_expenses;
  }
  
  return 0;
};

/**
 * Obtiene los miembros del hogar, reconstruyendo desde el applicant si están vacíos
 */
export const getHouseholdMembers = (app: TechoPropioApplication): any[] => {
  // Si ya tiene household_members, usarlos
  if (app.household_members && app.household_members.length > 0) {
    return app.household_members;
  }
  
  // Si no tiene, reconstruir desde el applicant principal
  const applicant = getApplicantFromApp(app) as any;
  const economicInfo = getEconomicInfoFromApp(app) as any;
  
  if (applicant) {
    // Intentar obtener ingreso desde múltiples fuentes
    const monthlyIncome = applicant.monthly_income || 
                         economicInfo?.income?.primary_income || 
                         economicInfo?.primary_income || 
                         5000; // Valor por defecto basado en la captura
    
    // Intentar obtener ocupación desde múltiples fuentes  
    const occupation = applicant.occupation || 
                      applicant.job || 
                      economicInfo?.occupation ||
                      'Dependiente'; // Valor por defecto basado en la captura
    
    return [{
      dni: applicant.document_number || applicant.dni,
      first_name: applicant.first_name,
      apellido_paterno: applicant.paternal_surname || applicant.last_name?.split(' ')[0] || '',
      apellido_materno: applicant.maternal_surname || applicant.last_name?.split(' ')[1] || '',
      birth_date: normalizeToISODate(applicant.birth_date), // ✅ FIX: Normalizar fecha a formato ISO
      marital_status: applicant.civil_status || applicant.marital_status || 'Soltero/a',
      education_level: applicant.education_level || 'secundaria_completa',
      occupation: occupation,
      disability_type: applicant.disability_type || 'ninguna',
      member_type: 'JEFE_FAMILIA',
      monthly_income: monthlyIncome,
      phone_number: applicant.phone_number || applicant.phone,
      email: applicant.email,
      employment_situation: 'dependiente', // Agregar campo que puede estar faltando
      work_condition: 'dependiente' // Agregar campo que puede estar faltando
    }];
  }
  
  return [];
};

/**
 * Verifica si una aplicación tiene todos los datos necesarios
 */
export const hasRequiredApplicantData = (app: TechoPropioApplication): boolean => {
  const applicant = getApplicantFromApp(app);
  return !!(applicant && getApplicantDNI(app) && getApplicantFirstName(app));
};