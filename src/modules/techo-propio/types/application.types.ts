/**
 * Domain Types for Techo Propio Module
 * Maps to backend DTOs and domain entities
 */

// ==================== ENUMS ====================

export enum ApplicationStatus {
  DRAFT = 'BORRADOR',
  SUBMITTED = 'ENVIADA',
  IN_REVIEW = 'EN_REVISION',
  APPROVED = 'APROBADA',
  REJECTED = 'RECHAZADA',
  CANCELLED = 'CANCELADA'
}

export enum MaritalStatus {
  SINGLE = 'SOLTERO',
  MARRIED = 'CASADO',
  DIVORCED = 'DIVORCIADO',
  WIDOWED = 'VIUDO',
  COHABITING = 'CONVIVIENTE'
}

export enum PropertyType {
  URBAN = 'URBANO',
  RURAL = 'RURAL'
}

export enum LandOwnership {
  OWN = 'PROPIO',
  POSSESSION = 'POSESION',
  LEASE = 'ALQUILER',
  ASSIGNMENT = 'CESION'
}

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
  marital_status: MaritalStatus;
  phone: string;
  email: string;
  current_address: Location;
}

export interface HouseholdMember {
  id?: string;
  dni: string;
  first_name: string;
  last_name: string;
  birth_date: string; // ISO date string
  relationship: RelationshipType;
  occupation: string;
  monthly_income: number;
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
  property_type: PropertyType;
  land_ownership: LandOwnership;
  land_area: number;
  has_services: boolean;
  services_description?: string;
  property_location: Location;
  cadastral_code?: string;
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
