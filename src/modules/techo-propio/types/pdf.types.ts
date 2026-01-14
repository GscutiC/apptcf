/**
 * PDF Types - Tipos para generación de formularios PDF
 * Mapea los datos de la solicitud a los campos del formulario oficial
 */

// ==================== COORDENADAS Y POSICIONES ====================

export interface PDFCoordinate {
  x: number;
  y: number;
  page: number; // 0-indexed (página 1 = 0, página 2 = 1)
  maxWidth?: number; // Ancho máximo del texto
  fontSize?: number; // Tamaño de fuente personalizado
}

export interface PDFFieldMapping {
  fieldName: string;
  coordinate: PDFCoordinate;
  dataPath: string; // Path al dato en ApplicationPDFData
  format?: 'text' | 'date' | 'currency' | 'dni' | 'phone';
}

// ==================== DATOS PARA EL PDF ====================

/**
 * Información del registro de la solicitud
 */
export interface RegistrationInfo {
  code: string; // Código de solicitud (ej: CONV-2025-02-001)
  convocation_code?: string;
  registration_date?: string;
  year?: number;
}

/**
 * Información del predio
 */
export interface PropertyPDFData {
  department: string;
  province: string;
  district: string;
  populated_center?: string;
  manzana?: string;
  lote: string;
  sub_lote?: string;
  address?: string;
  reference?: string;
}

/**
 * Información personal del solicitante
 */
export interface PersonPDFData {
  // Identificación
  dni: string;

  // Nombres
  first_name: string;
  paternal_surname: string;
  maternal_surname: string;

  // Datos personales
  birth_date: string;
  civil_status: string;
  education_level: string;
  disability_type: string;
  disability_is_permanent?: boolean; // ✅ NUEVO: ¿La discapacidad es permanente?
  disability_is_severe?: boolean; // ✅ NUEVO: ¿La discapacidad es severa?

  // Contacto (solo para jefe de familia)
  phone_number?: string;
  email?: string;
}

/**
 * Información económica
 */
export interface EconomicPDFData {
  occupation: string;
  employment_situation: string;
  work_condition?: string;
  monthly_income: number;
}

/**
 * Miembro de carga familiar (tabla)
 */
export interface FamilyDependentPDFData {
  dni: string;
  first_name: string;
  paternal_surname: string;
  maternal_surname: string;
  birth_date: string;
  family_bond: string; // Vínculo familiar
  gender?: string;
  education_level?: string;
  disability_type?: string;
  disability_is_permanent?: boolean; // ✅ NUEVO: ¿La discapacidad es permanente?
  disability_is_severe?: boolean; // ✅ NUEVO: ¿La discapacidad es severa?
}

/**
 * Miembro adicional del grupo familiar (padres, abuelos, otros)
 * Estos van en la sección "Información Adicional del Grupo Familiar" de la página 2
 */
export interface AdditionalFamilyMemberPDFData {
  first_name: string;
  paternal_surname: string;
  maternal_surname: string;
  dni: string;
  family_bond: string; // Vínculo: padre, madre, abuelo, otro, etc.
}

/**
 * Datos completos para generar el PDF
 */
export interface ApplicationPDFData {
  // Información del registro
  registration: RegistrationInfo;
  
  // Información del predio
  property: PropertyPDFData;
  
  // Jefe de familia
  head_of_family: PersonPDFData;
  head_of_family_economic: EconomicPDFData;
  
  // Cónyuge/Conviviente (opcional)
  spouse?: PersonPDFData;
  spouse_economic?: EconomicPDFData;
  
  // Carga familiar (tabla página 1 - hijos, hermanos, nietos menores de 25 años)
  family_dependents: FamilyDependentPDFData[];
  
  // Información adicional del grupo familiar (tabla página 2 - padres, abuelos, otros)
  additional_family_members: AdditionalFamilyMemberPDFData[];
  
  // Resumen
  total_household_members: number;
  total_family_income: number;
}

// ==================== CONFIGURACIÓN ====================

export interface PDFGeneratorConfig {
  templatePath: string;
  defaultFontSize: number;
  defaultFontColor: { r: number; g: number; b: number };
  dateFormat: string;
  currencySymbol: string;
}

export const DEFAULT_PDF_CONFIG: PDFGeneratorConfig = {
  templatePath: '/templates/formulario-techo-propio.pdf',
  defaultFontSize: 9,
  defaultFontColor: { r: 0, g: 0, b: 0 }, // Negro
  dateFormat: 'dd/MM/yyyy',
  currencySymbol: 'S/'
};

// ==================== RESULTADO ====================

export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  error?: string;
  filename?: string;
}
