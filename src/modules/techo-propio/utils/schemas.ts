/**
 * Zod Schemas para validaciones type-safe
 *
 * BENEFICIOS:
 * - Validación automática con TypeScript
 * - Mensajes de error consistentes en español
 * - Inferencia de tipos automática
 * - Validaciones complejas sin código manual
 *
 * USO:
 * ```typescript
 * const result = ApplicantSchema.safeParse(data);
 * if (!result.success) {
 *   console.log(result.error.errors); // Array de errores
 * }
 * ```
 */

import { z } from 'zod';

// ==================== MENSAJES PERSONALIZADOS ====================

const REQUIRED_MSG = 'Este campo es obligatorio';
const INVALID_EMAIL = 'Correo electrónico inválido';
const INVALID_DNI = 'DNI debe tener exactamente 8 dígitos numéricos';
const INVALID_PHONE = 'Teléfono debe tener 9 dígitos';
const MIN_LENGTH = (min: number) => `Debe tener al menos ${min} caracteres`;
const MAX_LENGTH = (max: number) => `No puede exceder ${max} caracteres`;

// ==================== VALIDADORES BÁSICOS ====================

/**
 * Validador de DNI peruano (8 dígitos)
 */
export const DniSchema = z
  .string({ message: REQUIRED_MSG })
  .length(8, { message: INVALID_DNI })
  .regex(/^\d+$/, { message: 'DNI solo puede contener números' });

/**
 * Validador de teléfono celular peruano (9 dígitos)
 */
export const PhoneSchema = z
  .string({ message: REQUIRED_MSG })
  .length(9, { message: INVALID_PHONE })
  .regex(/^9\d{8}$/, { message: 'Teléfono debe empezar con 9 y tener 9 dígitos' });

/**
 * Validador de email
 */
export const EmailSchema = z
  .string({ message: REQUIRED_MSG })
  .email({ message: INVALID_EMAIL })
  .min(5, { message: MIN_LENGTH(5) })
  .max(100, { message: MAX_LENGTH(100) });

/**
 * Validador de nombres (permite letras, espacios, tildes, ñ)
 */
export const NameSchema = z
  .string({ message: REQUIRED_MSG })
  .min(2, { message: MIN_LENGTH(2) })
  .max(100, { message: MAX_LENGTH(100) })
  .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, { message: 'Solo se permiten letras y espacios' });

/**
 * Validador de fecha de nacimiento (18-100 años)
 */
export const BirthDateSchema = z
  .date({ message: REQUIRED_MSG })
  .refine(
    (date: Date) => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 18 && age <= 100;
    },
    { message: 'La edad debe estar entre 18 y 100 años' }
  );

// ==================== SCHEMAS DE ENTIDADES ====================

/**
 * Schema para Dirección
 */
export const AddressSchema = z.object({
  department: z.string({ message: REQUIRED_MSG }).min(1, { message: 'Seleccione un departamento' }),
  province: z.string({ message: REQUIRED_MSG }).min(1, { message: 'Seleccione una provincia' }),
  district: z.string({ message: REQUIRED_MSG }).min(1, { message: 'Seleccione un distrito' }),
  address: z.string({ message: REQUIRED_MSG }).min(5, { message: MIN_LENGTH(5) }),
  reference: z.string().optional(),
  ubigeo_code: z.string().optional()
});

/**
 * Schema para Solicitante (Paso 1)
 * Solo datos básicos de contacto
 */
export const ApplicantSchema = z.object({
  dni: DniSchema,
  first_name: NameSchema,
  last_name: NameSchema,
  phone: PhoneSchema,
  email: EmailSchema
});

/**
 * Schema para Información del Predio (Paso 3)
 */
export const PropertySchema = z.object({
  department: z.string({ message: REQUIRED_MSG }).min(1, { message: 'Seleccione un departamento' }),
  province: z.string({ message: REQUIRED_MSG }).min(1, { message: 'Seleccione una provincia' }),
  district: z.string({ message: REQUIRED_MSG }).min(1, { message: 'Seleccione un distrito' }),
  lote: z.string({ message: REQUIRED_MSG }).min(1, { message: 'El número de lote es obligatorio' }),
  address: z.string({ message: REQUIRED_MSG }).min(5, { message: MIN_LENGTH(5) }),
  manzana: z.string().optional(),
  sub_lote: z.string().optional(),
  populated_center: z.string().optional(),
  reference: z.string().optional(),
  ubigeo_code: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  ubigeo_validated: z.boolean().optional()
});

/**
 * Schema para Miembro del Hogar (Paso 2)
 */
export const HouseholdMemberSchema = z.object({
  dni: DniSchema,
  first_name: NameSchema,
  apellido_paterno: NameSchema,
  apellido_materno: NameSchema,
  birth_date: z.string({ message: REQUIRED_MSG }).min(1, { message: 'Fecha de nacimiento requerida' }),

  // Relación familiar
  member_type: z.string().optional(),
  family_bond: z.string().optional(),
  relationship: z.string().optional(),

  // Datos adicionales
  civil_status: z.string().optional(),
  marital_status: z.string().optional(),
  education_level: z.string().optional(),
  occupation: z.string().optional(),
  disability_type: z.string().optional(),

  // Información económica
  employment_situation: z.string().optional(),
  work_condition: z.string().optional(),
  employment_condition: z.string().optional(),
  monthly_income: z.number().nonnegative({ message: 'El ingreso no puede ser negativo' }).optional(),

  // Flags
  is_dependent: z.boolean().optional()
});

/**
 * Schema para Información Económica (Paso 4)
 */
export const EconomicInfoSchema = z.object({
  occupation: z.string({ message: REQUIRED_MSG }).min(2, { message: MIN_LENGTH(2) }),
  employer_name: z.string().optional(),
  employment_years: z.number().nonnegative().optional(),
  income: z.object({
    main_income: z.number({ message: REQUIRED_MSG }).nonnegative({ message: 'El ingreso no puede ser negativo' }),
    additional_income: z.number().nonnegative().optional(),
    total_income: z.number().nonnegative()
  }),
  expenses: z.object({
    housing: z.number().nonnegative().optional(),
    food: z.number().nonnegative().optional(),
    education: z.number().nonnegative().optional(),
    health: z.number().nonnegative().optional(),
    transport: z.number().nonnegative().optional(),
    other: z.number().nonnegative().optional(),
    total_expenses: z.number().nonnegative()
  }).optional(),
  has_debts: z.boolean().optional(),
  debt_amount: z.number().nonnegative().optional()
});

/**
 * Schema para Información de la Convocatoria (Paso 0)
 */
export const ApplicationInfoSchema = z.object({
  registration_date: z.string({ message: REQUIRED_MSG }),
  convocation_code: z.string({ message: REQUIRED_MSG }).min(1, { message: 'Código de convocatoria requerido' }),
  registration_year: z.number({ message: REQUIRED_MSG }).int().positive()
});

/**
 * Schema completo para formulario de nueva solicitud
 */
export const NewApplicationFormSchema = z.object({
  application_info: ApplicationInfoSchema,
  user_data: ApplicantSchema.partial().optional(),
  head_of_family: z.any(), // Será validado en Paso 2 con estructura completa
  spouse: z.any().optional(),
  household_members: z.array(HouseholdMemberSchema).default([]),
  property_info: PropertySchema,
  head_of_family_economic: z.any().optional(),
  spouse_economic: z.any().optional(),
  comments: z.string().optional()
});

// ==================== HELPERS ====================

/**
 * Helper para extraer errores de Zod en formato legible
 */
export const formatZodErrors = (errors: z.ZodError): string[] => {
  return errors.issues.map((error: z.ZodIssue) => {
    const path = error.path.join('.');
    return `${path}: ${error.message}`;
  });
};

/**
 * Helper para validar y retornar solo errores
 */
export const validateWithZod = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: formatZodErrors(result.error)
  };
};

/**
 * Helper para validar campos individuales
 */
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  value: unknown
): string | null => {
  const result = schema.safeParse(value);

  if (result.success) {
    return null;
  }

  // Retornar solo el primer error
  return result.error.issues[0]?.message || 'Valor inválido';
};

// ==================== EXPORTS DE TIPOS INFERIDOS ====================
// ✅ FIX: Renombrar para evitar conflicto con types/index.ts

export type ZodApplicantFormData = z.infer<typeof ApplicantSchema>;
export type ZodPropertyFormData = z.infer<typeof PropertySchema>;
export type ZodHouseholdMemberData = z.infer<typeof HouseholdMemberSchema>;
export type ZodEconomicInfoData = z.infer<typeof EconomicInfoSchema>;
export type ZodApplicationInfoData = z.infer<typeof ApplicationInfoSchema>;
export type ZodNewApplicationFormData = z.infer<typeof NewApplicationFormSchema>;
