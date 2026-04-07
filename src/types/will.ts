/**
 * Digital Will Module Types
 * Comprehensive TypeScript definitions for the will creation flow
 */

// ============================================================================
// BASE WILL DATA
// ============================================================================

export interface DigitalWill {
  id: string;
  user_id: string;
  current_section: number; // 1-6
  completion_percentage: number; // 0-100
  personal_info: PersonalInfo | null;
  family_details: FamilyDetails | null;
  special_instructions: SpecialInstructions | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STEP 1: PERSONAL INFORMATION
// ============================================================================

export interface PersonalInfo {
  full_name: string;
  date_of_birth: string; // ISO date: YYYY-MM-DD
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  religion?: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  pincode: string; // 6 digits
  pan: string; // Format: AAAAA1234A
  aadhaar: string; // 12 digits
}

// ============================================================================
// STEP 2: FAMILY DETAILS
// ============================================================================

export interface FamilyMember {
  name: string;
  relation: string;
  alive: 'yes' | 'no';
  date_of_birth?: string; // ISO date
}

export interface Spouse extends Omit<FamilyMember, 'relation'> {
  alive: 'yes' | 'no';
}

export interface FamilyDetails {
  spouse?: {
    name?: string;
    alive?: 'yes' | 'no';
  };
  children: FamilyMember[];
  parents: FamilyMember[];
  siblings: FamilyMember[];
}

// ============================================================================
// STEP 3: ASSETS
// ============================================================================

export type AssetCategory =
  | 'real_estate'
  | 'bank_accounts'
  | 'investments'
  | 'insurance'
  | 'vehicles'
  | 'jewelry'
  | 'business'
  | 'digital_assets'
  | 'bonds_shares'
  | 'lockers'
  | 'land'
  | 'other';

export interface Asset {
  id: string;
  user_id: string;
  category: AssetCategory;
  name: string;
  description?: string;
  estimated_value: number; // in rupees
  institution_name?: string;
  account_number?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STEP 4: BENEFICIARIES
// ============================================================================

export interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  relation?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetDistribution {
  id: string;
  user_id: string;
  asset_id: string;
  beneficiary_id: string;
  created_at: string;
}

// ============================================================================
// STEP 5: ALLOCATIONS & DISTRIBUTIONS
// ============================================================================

export type AllocationType = 'percentage' | 'units' | 'specific_gift';

export interface Allocation {
  id: string;
  user_id: string;
  asset_id: string;
  beneficiary_id: string;
  allocation_type: AllocationType;
  value: number | string; // percentage (0-100), units count, or text description
  created_at: string;
  updated_at: string;
}

export interface SpecialGift {
  id: string;
  user_id: string;
  beneficiary_id: string;
  gift_description: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STEP 6: EXECUTOR & SPECIAL INSTRUCTIONS
// ============================================================================

export interface ExecutorDetails {
  name: string;
  relation: string;
  phone: string;
  email: string;
  address?: string;
}

export interface AlternateExecutorDetails extends Omit<ExecutorDetails, 'phone' | 'email'> {
  phone?: string;
  email?: string;
}

export interface SpecialInstructions {
  // Executor details
  executor_name: string;
  executor_relation: string;
  executor_phone: string;
  executor_email: string;
  executor_address?: string;

  // Alternate executor
  alternate_executor_name?: string;
  alternate_executor_relation?: string;
  alternate_executor_phone?: string;
  alternate_executor_email?: string;

  // Special wishes
  funeral_wishes?: string;
  organ_donation?: boolean;
  charitable_donations?: string;
  guardianship_minors?: string;
  additional_notes?: string;

  // Islamic declaration
  islamic_declaration?: boolean;
}

// ============================================================================
// COMPREHENSIVE WILL VIEW
// ============================================================================

export interface ComprehensiveWill {
  basic: DigitalWill;
  personal: PersonalInfo | null;
  family: FamilyDetails | null;
  assets: Asset[];
  beneficiaries: Beneficiary[];
  distributions: AssetDistribution[];
  allocations: Allocation[];
  special_gifts: SpecialGift[];
  instructions: SpecialInstructions | null;
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface FormValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface WillGenerationRequest {
  will_id: string;
}

export interface WillGenerationResponse {
  pdf_url: string;
  file_name: string;
  generated_at: string;
}

export interface WillShareRequest {
  will_id: string;
  email_addresses: string[];
  message?: string;
}

export interface WillShareResponse {
  success: boolean;
  recipients: string[];
  shared_at: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface WillStep {
  number: number;
  label: string;
  description: string;
  component: React.ComponentType;
}

export interface ProgressState {
  currentStep: number;
  completedSteps: number[];
  percentageComplete: number;
  lastSavedAt?: string;
}

export interface FormState {
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WillStatus = 'draft' | 'in_progress' | 'completed' | 'signed';

export interface WillMetadata {
  id: string;
  user_id: string;
  status: WillStatus;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  last_viewed: string;
  version: number;
}

// ============================================================================
// TABLE ROW TYPES (Supabase)
// ============================================================================

export type DigitalWillRow = Omit<DigitalWill, 'personal_info' | 'family_details' | 'special_instructions'> & {
  personal_info: PersonalInfo | null;
  family_details: FamilyDetails | null;
  special_instructions: SpecialInstructions | null;
};

export type AssetRow = Asset;
export type BeneficiaryRow = Beneficiary;
export type AssetDistributionRow = AssetDistribution;
export type AllocationRow = Allocation;
export type SpecialGiftRow = SpecialGift;

// ============================================================================
// FORM DATA TYPES (React Hook Form)
// ============================================================================

export type PersonalInfoFormData = PersonalInfo;
export type FamilyDetailsFormData = FamilyDetails;

export interface AssetFormData {
  name: string;
  description: string;
  value: string;
  institution: string;
  account_number: string;
}

export interface BeneficiaryFormData {
  name: string;
  relation: string;
}

export interface AllocationFormData {
  asset_id: string;
  beneficiary_id: string;
  allocation_type: AllocationType;
  value: number | string;
}

export interface SpecialGiftFormData {
  beneficiary_id: string;
  gift_description: string;
  notes: string;
}

export interface ExecutorFormData extends ExecutorDetails {}
export interface SpecialInstructionsFormData extends SpecialInstructions {}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export interface WillStatistics {
  total_wills: number;
  average_completion_percentage: number;
  average_completion_time_minutes: number;
  most_common_asset_category: AssetCategory;
  average_number_of_beneficiaries: number;
  average_asset_value: number;
}

export interface UserWillStats {
  user_id: string;
  total_assets: number;
  total_beneficiaries: number;
  total_asset_value: number;
  estimated_inheritance_per_beneficiary: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface WillErrorResponse {
  error: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

// ============================================================================
// EXPORT TYPE GUARDS
// ============================================================================

export function isPersonalInfo(obj: any): obj is PersonalInfo {
  return (
    obj &&
    typeof obj === 'object' &&
    'full_name' in obj &&
    'date_of_birth' in obj &&
    'pan' in obj &&
    'aadhaar' in obj
  );
}

export function isFamilyDetails(obj: any): obj is FamilyDetails {
  return (
    obj &&
    typeof obj === 'object' &&
    'children' in obj &&
    'parents' in obj &&
    'siblings' in obj
  );
}

export function isAsset(obj: any): obj is Asset {
  return (
    obj &&
    typeof obj === 'object' &&
    'category' in obj &&
    'name' in obj &&
    'estimated_value' in obj
  );
}

export function isBeneficiary(obj: any): obj is Beneficiary {
  return (
    obj &&
    typeof obj === 'object' &&
    'name' in obj &&
    'id' in obj
  );
}

export function isAllocation(obj: any): obj is Allocation {
  return (
    obj &&
    typeof obj === 'object' &&
    'asset_id' in obj &&
    'beneficiary_id' in obj &&
    'allocation_type' in obj &&
    'value' in obj
  );
}

export function isSpecialInstructions(obj: any): obj is SpecialInstructions {
  return (
    obj &&
    typeof obj === 'object' &&
    'executor_name' in obj &&
    'executor_phone' in obj &&
    'executor_email' in obj
  );
}
