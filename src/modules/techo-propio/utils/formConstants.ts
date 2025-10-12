/**
 * Constantes para formularios - Placeholders y textos de ayuda
 * Centraliza todos los textos hardcodeados de los formularios
 */

/**
 * Placeholders para el formulario de solicitante
 */
export const APPLICANT_PLACEHOLDERS = {
  firstName: 'Ingrese su nombre',
  lastName: 'Ingrese sus apellidos',
  maternalLastName: 'Apellido materno',
  phone: '987654321',
  email: 'ejemplo@correo.com',
  address: 'Av. Principal 123, Mz. A Lt. 5',
  addressReference: 'Cerca del mercado central',
  birthDate: 'Seleccione su fecha de nacimiento',
} as const;

/**
 * Placeholders para miembros del hogar
 */
export const HOUSEHOLD_PLACEHOLDERS = {
  firstName: 'Nombre del familiar',
  paternalLastName: 'Apellido paterno',
  maternalLastName: 'Apellido materno',
  dni: '12345678',
  birthDate: 'Fecha de nacimiento',
  occupation: 'Ocupación o profesión',
  monthlyIncome: '0.00',
} as const;

/**
 * Placeholders para información económica
 */
export const ECONOMIC_PLACEHOLDERS = {
  monthlyIncome: '0.00',
  otherIncome: '0.00',
  monthlyExpenses: '0.00',
  debts: '0.00',
  debtDescription: 'Ej: Préstamo bancario, tarjeta de crédito, etc.',
  savingsAmount: '0.00',
} as const;

/**
 * Placeholders para datos del predio/propiedad
 */
export const PROPERTY_PLACEHOLDERS = {
  centerName: 'Nombre del centro poblado',
  address: 'Av. Principal 123',
  manzana: 'A',
  lote: '5',
  interior: 'A',
  reference: 'Cerca del mercado central, al costado de la iglesia...',
  latitude: '-12.0464',
  longitude: '-77.0428',
  propertyArea: '120',
  constructionArea: '80',
} as const;

/**
 * Placeholders para información de la convocatoria
 */
export const CONVOCATION_PLACEHOLDERS = {
  select: 'Seleccione la convocatoria...',
  observations: 'Observaciones adicionales sobre su postulación...',
} as const;

/**
 * Opciones por defecto para selects
 */
export const DEFAULT_SELECT_OPTIONS = {
  documentType: 'Tipo de documento',
  civilStatus: 'Estado civil',
  educationLevel: 'Nivel educativo',
  employmentSituation: 'Situación laboral',
  workCondition: 'Condición laboral',
  familyRelationship: 'Parentesco',
  disabilityType: 'Tipo de discapacidad',
  gender: 'Sexo',
  department: 'Seleccionar departamento',
  province: 'Seleccionar provincia',
  district: 'Seleccionar distrito',
  allStatuses: 'Todos los estados',
} as const;

/**
 * Mensajes de ayuda para formularios
 */
export const FORM_HELP_TEXTS = {
  dni: 'Ingrese 8 dígitos sin puntos ni espacios',
  phone: 'Número de celular o teléfono (9-15 dígitos)',
  email: 'Correo electrónico válido',
  coordinates: 'Coordenadas GPS del terreno (opcional)',
  propertyArea: 'Área total del terreno en m²',
  constructionArea: 'Área construida actual en m²',
  monthlyIncome: 'Ingreso promedio mensual en soles',
  reference: 'Puntos de referencia para ubicar la vivienda',
} as const;

/**
 * Textos de validación personalizados
 */
export const VALIDATION_MESSAGES = {
  required: 'Este campo es obligatorio',
  invalidDni: 'DNI debe tener 8 dígitos',
  invalidEmail: 'Correo electrónico inválido',
  invalidPhone: 'Teléfono debe tener entre 9 y 15 dígitos',
  invalidDate: 'Fecha inválida',
  futureDate: 'La fecha no puede ser futura',
  pastDate: 'La fecha debe ser mayor a la actual',
  minAge: 'Debe ser mayor de edad (18 años)',
  maxLength: (max: number) => `Máximo ${max} caracteres`,
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  invalidCoordinates: 'Coordenadas inválidas',
  negativeAmount: 'El monto no puede ser negativo',
  maxAmount: (max: number) => `Monto máximo permitido: S/ ${max}`,
} as const;

/**
 * Textos de ejemplo para campos complejos
 */
export const EXAMPLE_TEXTS = {
  fullAddress: 'Ej: Av. Los Álamos 123, Mz. C Lt. 8, Urb. San Martín',
  propertyReference: 'Ej: A dos cuadras del colegio primario, frente al parque',
  coordinates: 'Ej: Latitud: -12.0464, Longitud: -77.0428',
  occupation: 'Ej: Comerciante, Ama de casa, Estudiante, Jubilado',
  monthlyIncome: 'Ej: S/ 1,200.00',
  debtDescription: 'Ej: Préstamo del Banco de Crédito por S/ 5,000',
} as const;

/**
 * Configuración de campos de formulario
 */
export const FORM_CONFIG = {
  maxLengths: {
    name: 50,
    lastName: 50,
    address: 200,
    reference: 500,
    observations: 1000,
    occupation: 100,
    debtDescription: 300,
  },
  inputTypes: {
    text: 'text',
    number: 'number',
    email: 'email',
    tel: 'tel',
    date: 'date',
    password: 'password',
  },
} as const;

/**
 * Agrupación completa de constantes de formularios
 */
export const FORM_CONSTANTS = {
  placeholders: {
    applicant: APPLICANT_PLACEHOLDERS,
    household: HOUSEHOLD_PLACEHOLDERS,
    economic: ECONOMIC_PLACEHOLDERS,
    property: PROPERTY_PLACEHOLDERS,
    convocation: CONVOCATION_PLACEHOLDERS,
  },
  defaultOptions: DEFAULT_SELECT_OPTIONS,
  helpTexts: FORM_HELP_TEXTS,
  validationMessages: VALIDATION_MESSAGES,
  examples: EXAMPLE_TEXTS,
  config: FORM_CONFIG,
} as const;

/**
 * Exportación por defecto
 */
export default FORM_CONSTANTS;