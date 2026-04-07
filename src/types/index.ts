// ============================================================
// Afterlife 2.0 — Core Type Definitions
// ============================================================

// --- User & Auth ---
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  invite_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Beneficiary ---
export interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  relation: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  aadhaar_last4?: string;
  pan?: string;
  address?: string;
  is_minor: boolean;
  guardian_name?: string;
  guardian_relation?: string;
  created_at: string;
  updated_at: string;
}

// --- Digital Will ---
export type WillStatus = 'draft' | 'in_progress' | 'review' | 'completed' | 'signed';
export type WillSection = 1 | 2 | 3 | 4 | 5 | 6;

export interface DigitalWill {
  id: string;
  user_id: string;
  status: WillStatus;
  current_section: WillSection;
  progress_percentage: number;
  // Section 1: Personal Info
  personal_info?: PersonalInfo;
  // Section 2: Family Details
  family_details?: FamilyDetails;
  // Section 3: Asset Declaration
  assets?: Asset[];
  // Section 4: Beneficiary Assignment
  beneficiary_assignments?: BeneficiaryAssignment[];
  // Section 5: Asset Distribution
  asset_distributions?: AssetDistribution[];
  // Section 6: Special Instructions
  special_instructions?: SpecialInstructions;
  // Metadata
  islamic_declaration?: boolean;
  executor_details?: ExecutorDetails;
  pdf_url?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  full_name: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  religion?: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  pan_number?: string;
  aadhaar_number?: string;
}

export interface FamilyDetails {
  spouse_name?: string;
  spouse_alive?: boolean;
  children: FamilyMember[];
  parents: FamilyMember[];
  siblings: FamilyMember[];
}

export interface FamilyMember {
  name: string;
  relation: string;
  alive: boolean;
  date_of_birth?: string;
}

// --- Assets ---
export type AssetCategory =
  | 'real_estate'
  | 'bank_accounts'
  | 'investments'
  | 'insurance'
  | 'vehicles'
  | 'gold_jewelry'
  | 'business'
  | 'intellectual_property'
  | 'digital_assets'
  | 'bonds_shares'
  | 'lockers'
  | 'land'
  | 'other';

export interface Asset {
  id: string;
  user_id: string;
  will_id?: string;
  category: AssetCategory;
  name: string;
  description?: string;
  estimated_value?: number;
  currency: string;
  institution_name?: string;
  account_number?: string;
  documents?: string[];  // vault document IDs
  created_at: string;
  updated_at: string;
}

// --- Asset Distribution ---
export type AllocationType = 'percentage' | 'unit' | 'specific_gift';

export interface AssetDistribution {
  id: string;
  will_id: string;
  asset_id: string;
  beneficiary_id: string;
  allocation_type: AllocationType;
  allocation_value: number;  // percentage or unit count
  specific_gift_description?: string;
  notes?: string;
}

export interface BeneficiaryAssignment {
  beneficiary_id: string;
  assets: { asset_id: string; allocation_type: AllocationType; value: number }[];
}

export interface SpecialInstructions {
  funeral_wishes?: string;
  organ_donation?: boolean;
  charitable_donations?: { organization: string; amount: number }[];
  guardianship?: { minor_name: string; guardian_name: string; guardian_relation: string }[];
  messages?: string;
  additional_notes?: string;
}

export interface ExecutorDetails {
  name: string;
  relation: string;
  phone: string;
  email: string;
  address?: string;
  alternate_executor?: {
    name: string;
    relation: string;
    phone: string;
  };
}

// --- Digital Vault ---
export type DocumentCategory =
  | 'identity'
  | 'financial'
  | 'property'
  | 'insurance'
  | 'legal'
  | 'medical'
  | 'personal'
  | 'other';

export interface VaultDocument {
  id: string;
  user_id: string;
  name: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category: DocumentCategory;
  storage_path: string;
  is_encrypted: boolean;
  description?: string;
  tags?: string[];
  shared_with?: string[];  // beneficiary IDs
  created_at: string;
  updated_at: string;
}

// --- Messages ---
export type MessageFormat = 'text' | 'video' | 'audio';
export type MessageTrigger = 'on_death' | 'scheduled' | 'manual';

export interface Message {
  id: string;
  user_id: string;
  recipient_beneficiary_id: string;
  format: MessageFormat;
  trigger: MessageTrigger;
  subject?: string;
  content?: string;  // text content or storage URL for video/audio
  scheduled_date?: string;
  scheduled_time?: string;
  storage_path?: string;
  is_delivered: boolean;
  created_at: string;
  updated_at: string;
}

// --- Afterlife Score ---
export interface AfterlifeScore {
  user_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  breakdown: {
    personal_info: number;
    family_details: number;
    assets_declared: number;
    beneficiaries_assigned: number;
    will_completed: number;
    vault_documents: number;
    messages_written: number;
    kyc_verified: number;
  };
  recommendations: string[];
  last_calculated: string;
}

// --- Payments ---
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  plan: string;
  created_at: string;
  updated_at: string;
}

// --- Notifications ---
export type NotificationType = 'info' | 'reminder' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}
