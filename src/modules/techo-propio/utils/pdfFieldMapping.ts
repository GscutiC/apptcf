/**
 * PDF Field Mapping - Mapeo de coordenadas para el formulario Techo Propio
 * 
 * NOTA: Las coordenadas están en puntos PDF (1 punto = 1/72 pulgadas)
 * El origen (0,0) está en la esquina inferior izquierda de cada página
 * Tamaño A4: 595.28 x 841.89 puntos
 * 
 * Las coordenadas fueron calculadas basándose en el diseño del formulario oficial.
 * Pueden requerir ajustes finos después de pruebas.
 */

import { PDFFieldMapping } from '../types/pdf.types';

// ==================== PÁGINA 1 - INFORMACIÓN PRINCIPAL ====================

/**
 * Sección: Información del Registro (esquina superior derecha)
 */
export const REGISTRATION_FIELDS: PDFFieldMapping[] = [
  {
    fieldName: 'registration_code',
    coordinate: { x: 480, y: 780, page: 0, maxWidth: 100, fontSize: 8 },
    dataPath: 'registration.code',
    format: 'text'
  },
  {
    fieldName: 'registration_year',
    coordinate: { x: 540, y: 765, page: 0, maxWidth: 40, fontSize: 8 },
    dataPath: 'registration.year',
    format: 'text'
  }
];

/**
 * Sección: Información General del Predio
 */
export const PROPERTY_FIELDS: PDFFieldMapping[] = [
  {
    fieldName: 'department',
    coordinate: { x: 80, y: 655, page: 0, maxWidth: 100, fontSize: 9 },
    dataPath: 'property.department',
    format: 'text'
  },
  {
    fieldName: 'province',
    coordinate: { x: 200, y: 655, page: 0, maxWidth: 100, fontSize: 9 },
    dataPath: 'property.province',
    format: 'text'
  },
  {
    fieldName: 'district',
    coordinate: { x: 320, y: 655, page: 0, maxWidth: 100, fontSize: 9 },
    dataPath: 'property.district',
    format: 'text'
  },
  {
    fieldName: 'populated_center',
    coordinate: { x: 440, y: 655, page: 0, maxWidth: 120, fontSize: 9 },
    dataPath: 'property.populated_center',
    format: 'text'
  },
  {
    fieldName: 'manzana',
    coordinate: { x: 80, y: 625, page: 0, maxWidth: 60, fontSize: 9 },
    dataPath: 'property.manzana',
    format: 'text'
  },
  {
    fieldName: 'lote',
    coordinate: { x: 160, y: 625, page: 0, maxWidth: 60, fontSize: 9 },
    dataPath: 'property.lote',
    format: 'text'
  },
  {
    fieldName: 'sub_lote',
    coordinate: { x: 240, y: 625, page: 0, maxWidth: 60, fontSize: 9 },
    dataPath: 'property.sub_lote',
    format: 'text'
  },
  {
    fieldName: 'address',
    coordinate: { x: 320, y: 625, page: 0, maxWidth: 180, fontSize: 8 },
    dataPath: 'property.address',
    format: 'text'
  },
  {
    fieldName: 'reference',
    coordinate: { x: 510, y: 625, page: 0, maxWidth: 70, fontSize: 8 },
    dataPath: 'property.reference',
    format: 'text'
  }
];

/**
 * Sección: Información General del Jefe de Familia (datos personales)
 */
export const HEAD_OF_FAMILY_PERSONAL_FIELDS: PDFFieldMapping[] = [
  {
    fieldName: 'hof_dni',
    coordinate: { x: 80, y: 545, page: 0, maxWidth: 80, fontSize: 9 },
    dataPath: 'head_of_family.dni',
    format: 'dni'
  },
  {
    fieldName: 'hof_paternal_surname',
    coordinate: { x: 170, y: 545, page: 0, maxWidth: 90, fontSize: 9 },
    dataPath: 'head_of_family.paternal_surname',
    format: 'text'
  },
  {
    fieldName: 'hof_maternal_surname',
    coordinate: { x: 270, y: 545, page: 0, maxWidth: 90, fontSize: 9 },
    dataPath: 'head_of_family.maternal_surname',
    format: 'text'
  },
  {
    fieldName: 'hof_first_name',
    coordinate: { x: 370, y: 545, page: 0, maxWidth: 120, fontSize: 9 },
    dataPath: 'head_of_family.first_name',
    format: 'text'
  },
  {
    fieldName: 'hof_birth_date',
    coordinate: { x: 80, y: 515, page: 0, maxWidth: 80, fontSize: 9 },
    dataPath: 'head_of_family.birth_date',
    format: 'date'
  },
  {
    fieldName: 'hof_civil_status',
    coordinate: { x: 170, y: 515, page: 0, maxWidth: 80, fontSize: 9 },
    dataPath: 'head_of_family.civil_status',
    format: 'text'
  },
  {
    fieldName: 'hof_phone',
    coordinate: { x: 270, y: 515, page: 0, maxWidth: 90, fontSize: 9 },
    dataPath: 'head_of_family.phone_number',
    format: 'phone'
  },
  {
    fieldName: 'hof_email',
    coordinate: { x: 370, y: 515, page: 0, maxWidth: 130, fontSize: 8 },
    dataPath: 'head_of_family.email',
    format: 'text'
  }
];

/**
 * Sección: Información Económica del Jefe de Familia
 */
export const HEAD_OF_FAMILY_ECONOMIC_FIELDS: PDFFieldMapping[] = [
  {
    fieldName: 'hof_education',
    coordinate: { x: 350, y: 545, page: 0, maxWidth: 100, fontSize: 8 },
    dataPath: 'head_of_family.education_level',
    format: 'text'
  },
  {
    fieldName: 'hof_occupation',
    coordinate: { x: 350, y: 515, page: 0, maxWidth: 100, fontSize: 8 },
    dataPath: 'head_of_family_economic.occupation',
    format: 'text'
  },
  {
    fieldName: 'hof_employment_situation',
    coordinate: { x: 460, y: 515, page: 0, maxWidth: 80, fontSize: 8 },
    dataPath: 'head_of_family_economic.employment_situation',
    format: 'text'
  },
  {
    fieldName: 'hof_monthly_income',
    coordinate: { x: 350, y: 485, page: 0, maxWidth: 80, fontSize: 9 },
    dataPath: 'head_of_family_economic.monthly_income',
    format: 'currency'
  },
  {
    fieldName: 'hof_disability',
    coordinate: { x: 460, y: 485, page: 0, maxWidth: 80, fontSize: 8 },
    dataPath: 'head_of_family.disability_type',
    format: 'text'
  }
];

/**
 * Sección: Información General del Cónyuge/Conviviente (datos personales)
 */
export const SPOUSE_PERSONAL_FIELDS: PDFFieldMapping[] = [
  {
    fieldName: 'spouse_dni',
    coordinate: { x: 80, y: 420, page: 0, maxWidth: 80, fontSize: 9 },
    dataPath: 'spouse.dni',
    format: 'dni'
  },
  {
    fieldName: 'spouse_paternal_surname',
    coordinate: { x: 170, y: 420, page: 0, maxWidth: 90, fontSize: 9 },
    dataPath: 'spouse.paternal_surname',
    format: 'text'
  },
  {
    fieldName: 'spouse_maternal_surname',
    coordinate: { x: 270, y: 420, page: 0, maxWidth: 90, fontSize: 9 },
    dataPath: 'spouse.maternal_surname',
    format: 'text'
  },
  {
    fieldName: 'spouse_first_name',
    coordinate: { x: 370, y: 420, page: 0, maxWidth: 120, fontSize: 9 },
    dataPath: 'spouse.first_name',
    format: 'text'
  },
  {
    fieldName: 'spouse_birth_date',
    coordinate: { x: 80, y: 390, page: 0, maxWidth: 80, fontSize: 9 },
    dataPath: 'spouse.birth_date',
    format: 'date'
  },
  {
    fieldName: 'spouse_civil_status',
    coordinate: { x: 170, y: 390, page: 0, maxWidth: 80, fontSize: 9 },
    dataPath: 'spouse.civil_status',
    format: 'text'
  }
];

/**
 * Sección: Información Económica del Cónyuge
 */
export const SPOUSE_ECONOMIC_FIELDS: PDFFieldMapping[] = [
  {
    fieldName: 'spouse_education',
    coordinate: { x: 350, y: 420, page: 0, maxWidth: 100, fontSize: 8 },
    dataPath: 'spouse.education_level',
    format: 'text'
  },
  {
    fieldName: 'spouse_occupation',
    coordinate: { x: 350, y: 390, page: 0, maxWidth: 100, fontSize: 8 },
    dataPath: 'spouse_economic.occupation',
    format: 'text'
  },
  {
    fieldName: 'spouse_employment_situation',
    coordinate: { x: 460, y: 390, page: 0, maxWidth: 80, fontSize: 8 },
    dataPath: 'spouse_economic.employment_situation',
    format: 'text'
  },
  {
    fieldName: 'spouse_monthly_income',
    coordinate: { x: 350, y: 360, page: 0, maxWidth: 80, fontSize: 9 },
    dataPath: 'spouse_economic.monthly_income',
    format: 'currency'
  },
  {
    fieldName: 'spouse_disability',
    coordinate: { x: 460, y: 360, page: 0, maxWidth: 80, fontSize: 8 },
    dataPath: 'spouse.disability_type',
    format: 'text'
  }
];

/**
 * Sección: Carga Familiar (tabla)
 * Cada fila tiene una altura aproximada de 18 puntos
 * Se pueden agregar hasta 6 dependientes en la primera página
 */
export const FAMILY_DEPENDENTS_TABLE_CONFIG = {
  startY: 720, // Y inicial de la primera fila (height - startY = posición desde arriba)
  rowHeight: 25, // Altura de cada fila
  maxRowsPage1: 3, // Máximo de filas en página 1 (espacio limitado)
  columns: {
    fullName: { x: 55, maxWidth: 130 },
    dni: { x: 238, maxWidth: 55 },
    birthDate: { x: 300, maxWidth: 55 },
    familyBond: { x: 380, maxWidth: 45 },
    gender: { x: 405, maxWidth: 20 },
    education: { x: 405, maxWidth: 55 },
    disability: { x: 535, maxWidth: 55 },
    // Círculos de discapacidad Permanente/Severa
    disabilityPermanent: { x: 470, maxWidth: 15 }, // Círculo "Permanente"
    disabilitySevere: { x: 538, maxWidth: 15 }     // Círculo "Severa"
  },
  fontSize: 7
};

// ==================== PÁGINA 2 - CONTINUACIÓN (si es necesario) ====================

/**
 * Campos adicionales en página 2 (para más carga familiar o declaraciones)
 */
export const PAGE_2_FIELDS: PDFFieldMapping[] = [
  // Aquí se pueden agregar campos de la página 2 si el formulario tiene más secciones
];

// ==================== TODOS LOS CAMPOS COMBINADOS ====================

export const ALL_FIELD_MAPPINGS: PDFFieldMapping[] = [
  ...REGISTRATION_FIELDS,
  ...PROPERTY_FIELDS,
  ...HEAD_OF_FAMILY_PERSONAL_FIELDS,
  ...HEAD_OF_FAMILY_ECONOMIC_FIELDS,
  ...SPOUSE_PERSONAL_FIELDS,
  ...SPOUSE_ECONOMIC_FIELDS
];

// ==================== HELPERS PARA OBTENER VALORES ====================

/**
 * Obtiene un valor anidado de un objeto usando una ruta de puntos
 * Ejemplo: getNestedValue(obj, 'head_of_family.dni') -> obj.head_of_family.dni
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

/**
 * Formatea un valor según su tipo
 */
export function formatFieldValue(value: any, format?: string): string {
  if (value === null || value === undefined) return '';
  
  switch (format) {
    case 'date':
      if (typeof value === 'string') {
        try {
          const date = new Date(value);
          return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch {
          return value;
        }
      }
      return String(value);
      
    case 'currency':
      const num = parseFloat(String(value));
      if (isNaN(num)) return '';
      return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
    case 'dni':
      // Formatear DNI con espacios cada 2 dígitos para legibilidad
      const dni = String(value).replace(/\D/g, '');
      return dni; // Mantener sin formato especial
      
    case 'phone':
      // Formatear teléfono
      const phone = String(value).replace(/\D/g, '');
      if (phone.length === 9) {
        return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
      }
      return phone;
      
    case 'text':
    default:
      return String(value);
  }
}

/**
 * Mapeo de valores de estado civil para mostrar en el PDF
 */
export const CIVIL_STATUS_LABELS: Record<string, string> = {
  'soltero': 'Soltero(a)',
  'casado': 'Casado(a)',
  'divorciado': 'Divorciado(a)',
  'viudo': 'Viudo(a)',
  'conviviente': 'Conviviente'
};

/**
 * Mapeo de niveles de educación para mostrar en el PDF
 */
export const EDUCATION_LABELS: Record<string, string> = {
  'sin_estudios': 'Sin estudios',
  'primaria_incompleta': 'Primaria Inc.',
  'primaria_completa': 'Primaria Comp.',
  'secundaria_incompleta': 'Secundaria Inc.',
  'secundaria_completa': 'Secundaria Comp.',
  'tecnico_incompleto': 'Técnico Inc.',
  'tecnico_completo': 'Técnico Comp.',
  'universitario_incompleto': 'Universitario Inc.',
  'universitario_completo': 'Universitario Comp.',
  'postgrado': 'Postgrado'
};

/**
 * Mapeo de situación laboral para mostrar en el PDF
 */
export const EMPLOYMENT_LABELS: Record<string, string> = {
  'dependiente': 'Dependiente',
  'independiente': 'Independiente',
  'desempleado': 'Desempleado',
  'jubilado': 'Jubilado',
  'estudiante': 'Estudiante'
};

/**
 * Mapeo de discapacidad para mostrar en el PDF
 */
export const DISABILITY_LABELS: Record<string, string> = {
  'ninguna': 'Ninguna',
  'fisica': 'Física',
  'visual': 'Visual',
  'auditiva': 'Auditiva',
  'intelectual': 'Intelectual',
  'psicosocial': 'Psicosocial',
  'multiple': 'Múltiple'
};

/**
 * ✅ NUEVO: Formatea la discapacidad con sus características (permanente/severa)
 * @param disabilityType Tipo de discapacidad
 * @param isPermanent Si es permanente
 * @param isSevere Si es severa
 * @returns String formateado con las características
 */
export function formatDisabilityWithCharacteristics(
  disabilityType: string | undefined,
  isPermanent: boolean = false,
  isSevere: boolean = false
): string {
  if (!disabilityType || disabilityType.toLowerCase() === 'ninguna') {
    return 'Ninguna';
  }

  const label = DISABILITY_LABELS[disabilityType.toLowerCase()] || disabilityType;
  const characteristics: string[] = [];

  if (isPermanent) characteristics.push('Permanente');
  if (isSevere) characteristics.push('Severa');

  if (characteristics.length > 0) {
    return `${label} (${characteristics.join(', ')})`;
  }

  return label;
}

/**
 * Mapeo de condición laboral (Formal/Informal) para mostrar en el PDF
 */
export const WORK_CONDITION_LABELS: Record<string, string> = {
  'formal': 'Formal',
  'informal': 'Informal',
  'eventual': 'Eventual',
  'permanente': 'Permanente'
};

/**
 * Aplica el label correspondiente a un valor de enum
 */
export function getLabelForEnum(value: string, enumType: 'civil_status' | 'education' | 'employment' | 'disability' | 'work_condition'): string {
  if (!value) return '';
  
  const lowerValue = value.toLowerCase();
  
  switch (enumType) {
    case 'civil_status':
      return CIVIL_STATUS_LABELS[lowerValue] || value;
    case 'education':
      return EDUCATION_LABELS[lowerValue] || value;
    case 'employment':
      return EMPLOYMENT_LABELS[lowerValue] || value;
    case 'disability':
      return DISABILITY_LABELS[lowerValue] || value;
    case 'work_condition':
      return WORK_CONDITION_LABELS[lowerValue] || value;
    default:
      return value;
  }
}
