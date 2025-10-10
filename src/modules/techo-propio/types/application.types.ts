/**
 * Domain Types for Techo Propio Module
 * Maps to backend DTOs and domain entities - Aligned with backend enums
 */

// ==================== ENUMS (Aligned with Backend) ====================

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ADDITIONAL_INFO_REQUIRED = 'additional_info_required',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum DocumentType {
  DNI = 'dni',
  CE = 'ce',
  PASSPORT = 'passport'
}

export enum CivilStatus {
  SINGLE = 'soltero',
  MARRIED = 'casado',
  DIVORCED = 'divorciado',
  WIDOWED = 'viudo',
  COHABITING = 'conviviente'
}

export enum EducationLevel {
  NO_EDUCATION = 'sin_estudios',
  PRIMARY_INCOMPLETE = 'primaria_incompleta',
  PRIMARY_COMPLETE = 'primaria_completa',
  SECONDARY_INCOMPLETE = 'secundaria_incompleta',
  SECONDARY_COMPLETE = 'secundaria_completa',
  TECHNICAL_INCOMPLETE = 'tecnico_incompleto',
  TECHNICAL_COMPLETE = 'tecnico_completo',
  UNIVERSITY_INCOMPLETE = 'universitario_incompleto',
  UNIVERSITY_COMPLETE = 'universitario_completo',
  POSTGRADUATE = 'postgrado'
}

export enum EmploymentSituation {
  DEPENDENT = 'dependiente',
  INDEPENDENT = 'independiente',
  UNEMPLOYED = 'desempleado',
  RETIRED = 'jubilado',
  STUDENT = 'estudiante'
}

export enum WorkCondition {
  FORMAL = 'formal',
  INFORMAL = 'informal'
}

export enum FamilyRelationship {
  SPOUSE = 'conyuge',
  PARTNER = 'conviviente',
  CHILD = 'hijo',
  PARENT = 'padre',
  SIBLING = 'hermano',
  GRANDPARENT = 'abuelo',
  GRANDCHILD = 'nieto',
  OTHER = 'otro'
}

export enum DisabilityType {
  NONE = 'ninguna',
  PHYSICAL = 'fisica',
  VISUAL = 'visual',
  HEARING = 'auditiva',
  INTELLECTUAL = 'intelectual',
  PSYCHOSOCIAL = 'psicosocial',
  MULTIPLE = 'multiple'
}

// ==================== LEGACY ENUMS (For compatibility, will be removed) ====================

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O'
}

export enum RelationshipType {
  SPOUSE = 'CONYUGE',
  CHILD = 'HIJO',
  PARENT = 'PADRE',
  SIBLING = 'HERMANO',
  OTHER = 'OTRO'
}

export enum EmploymentCondition {
  FORMAL = 'FORMAL',
  INFORMAL = 'INFORMAL'
}

export enum PaymentMethod {
  CASH = 'AL_CONTADO',
  FINANCING = 'FINANCIADO'
}

export enum MemberType {
  HEAD_OF_FAMILY = 'JEFE_FAMILIA',
  SPOUSE = 'CONYUGE',
  ADDITIONAL_FAMILY = 'FAMILIA_ADICIONAL',
  FAMILY_DEPENDENT = 'CARGA_FAMILIAR',
  OTHER = 'OTRO'
}

// ==================== VALUE OBJECTS ====================

export interface Location {
  department: string;
  province: string;
  district: string;
  address: string;
  reference?: string;
  ubigeo_code?: string;
}

export interface MonthlyIncome {
  main_income: number;
  additional_income: number;
  total_income: number;
}

export interface MonthlyExpenses {
  housing: number;
  food: number;
  education: number;
  health: number;
  transport: number;
  other: number;
  total_expenses: number;
}

// ==================== ENTITIES ====================

export interface Applicant {
  dni: string;
  first_name: string;
  last_name: string;
  birth_date: string; // ISO date string
  gender: Gender;
  marital_status: CivilStatus;
  phone: string;
  email: string;
  current_address: Location;
}

export interface HouseholdMember {
  id?: string;
  dni: string;
  first_name: string;
  apellido_paterno: string;
  apellido_materno: string;
  birth_date?: string; // ISO date string - opcional para familia adicional
  marital_status?: CivilStatus; // opcional para familia adicional
  education_level?: EducationLevel; // opcional para familia adicional
  occupation?: string; // opcional para familia adicional
  employment_situation?: EmploymentSituation; // opcional para familia adicional
  employment_condition?: EmploymentCondition; // opcional para familia adicional
  monthly_income?: number; // opcional para familia adicional
  disability_type?: DisabilityType; // opcional para familia adicional
  relationship?: FamilyRelationship;
  member_type: MemberType; // tipo de miembro
  payment_method?: PaymentMethod; // solo para jefe de familia
  // Campos específicos para familia adicional
  family_bond?: string; // vínculo familiar (para ADDITIONAL_FAMILY)
}

export interface EconomicInfo {
  occupation: string;
  employer_name?: string;
  employment_years: number;
  income: MonthlyIncome;
  expenses: MonthlyExpenses;
  has_debts: boolean;
  debt_amount?: number;
  debt_description?: string;
}

export interface PropertyInfo {
  // Ubicación política (obligatorios)
  department: string;
  province: string;
  district: string;
  lote: string;
  
  // Dirección (obligatoria)
  address: string;
  
  // Ubicación opcional
  ubigeo_code?: string;
  populated_center?: string;
  manzana?: string;
  sub_lote?: string;
  reference?: string;
  
  // Coordenadas geográficas (opcional)
  latitude?: number;
  longitude?: number;
  
  // Validación
  ubigeo_validated?: boolean;
  
  // Propiedades calculadas (solo lectura en respuestas)
  full_address?: string;
  short_address?: string;
}

export interface Document {
  id?: string;
  type: string;
  filename: string;
  url: string;
  uploaded_at: string; // ISO date string
}

export interface StateHistory {
  previous_status: ApplicationStatus;
  new_status: ApplicationStatus;
  changed_at: string; // ISO date string
  changed_by: string;
  comment?: string;
}

// ==================== MAIN APPLICATION ENTITY ====================

export interface TechoPropioApplication {
  id?: string;
  code: string;
  status: ApplicationStatus;
  applicant: Applicant;
  household_members: HouseholdMember[];
  household_size: number;
  economic_info: EconomicInfo;
  property_info: PropertyInfo;
  priority_score: number;
  documents: Document[];
  state_history: StateHistory[];
  comments?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  created_by?: string;
  updated_by?: string;
}

// ==================== STATISTICS ====================

export interface ApplicationStatistics {
  total_applications: number;
  by_status: {
    [key in ApplicationStatus]: number;
  };
  by_department: {
    [department: string]: number;
  };
  by_priority: {
    high: number; // priority >= 80
    medium: number; // 50 <= priority < 80
    low: number; // priority < 50
  };
  average_priority: number;
  average_income: number;
  average_household_size: number;
}

// ==================== FILTERS ====================

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  department?: string;
  province?: string;
  district?: string;
  priority_min?: number;
  priority_max?: number;
  income_min?: number;
  income_max?: number;
  created_from?: string; // ISO date string
  created_to?: string; // ISO date string
  search_text?: string; // Search by code, DNI, name
}

export interface SearchQuery {
  filters?: ApplicationFilters;
  sort_by?: 'created_at' | 'updated_at' | 'priority_score' | 'code';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// ==================== PAGINATION ====================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==================== UBIGEO ====================

export interface UbigeoDepartment {
  code: string;
  name: string;
}

export interface UbigeoProvince {
  code: string;
  name: string;
  department_code: string;
}

export interface UbigeoDistrict {
  code: string;
  name: string;
  province_code: string;
}

// ==================== RENIEC ====================

export interface ReniecValidationResponse {
  dni: string;
  is_valid: boolean;
  names: string;  // Nombres (estándar peruano)
  paternal_surname: string;  // Apellido paterno (estándar peruano)
  maternal_surname: string;  // Apellido materno (estándar peruano)
  full_name: string;  // Nombre completo
  birth_date?: string;  // Fecha de nacimiento (opcional)
  error_message?: string;  // Mensaje de error si aplica
  validation_date: string;  // Fecha de validación
}

// ==================== FORM STATE ====================

export interface ApplicationFormData {
  // Step 1: Applicant
  applicant?: Partial<Applicant>;
  // Step 2: Household
  household_members?: HouseholdMember[];
  // Step 3: Economic
  economic_info?: Partial<EconomicInfo>;
  // Step 4: Property
  property_info?: Partial<PropertyInfo>;
  // Step 5: Documents & Comments
  documents?: Document[];
  comments?: string;
}

export interface FormStepValidation {
  isValid: boolean;
  errors: {
    [field: string]: string;
  };
}

// ==================== UI STATE ====================

export interface ApplicationListState {
  applications: TechoPropioApplication[];
  loading: boolean;
  error: string | null;
  filters: ApplicationFilters;
  searchQuery: SearchQuery;
  selectedIds: string[];
}

export interface ApplicationFormState {
  currentStep: number;
  totalSteps: number;
  data: ApplicationFormData;
  validation: {
    [step: number]: FormStepValidation;
  };
  isSubmitting: boolean;
  isDraft: boolean;
}
