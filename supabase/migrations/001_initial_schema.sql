-- Afterlife PWA - Initial Database Schema
-- Comprehensive PostgreSQL schema with RLS, triggers, and audit logging

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

CREATE TYPE kyc_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');
CREATE TYPE user_plan AS ENUM ('free', 'lifetime');
CREATE TYPE digital_will_status AS ENUM ('draft', 'in_progress', 'review', 'completed', 'signed');
CREATE TYPE asset_category AS ENUM (
  'real_estate',
  'bank_account',
  'investment',
  'insurance',
  'vehicle',
  'jewelry',
  'cryptocurrency',
  'digital_asset',
  'business',
  'other'
);
CREATE TYPE allocation_type AS ENUM ('percentage', 'unit', 'specific_gift');
CREATE TYPE vault_category AS ENUM ('will', 'deed', 'certificate', 'insurance', 'investment', 'digital_asset', 'personal', 'financial', 'legal', 'other');
CREATE TYPE message_format AS ENUM ('text', 'video', 'audio');
CREATE TYPE message_trigger AS ENUM ('on_death', 'scheduled', 'manual');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('kyc_update', 'will_reminder', 'vault_access', 'payment_success', 'beneficiary_invite', 'document_upload', 'system_alert');
CREATE TYPE audit_action AS ENUM (
  'create', 'read', 'update', 'delete',
  'login', 'logout', 'kyc_submit',
  'will_save', 'will_sign',
  'asset_add', 'distribution_update',
  'vault_upload', 'vault_access_grant',
  'message_create', 'message_deliver',
  'beneficiary_invite', 'beneficiary_accept'
);

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- PROFILES: User profile information extending auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  kyc_status kyc_status DEFAULT 'pending',
  kyc_submitted_at TIMESTAMP WITH TIME ZONE,
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  kyc_rejection_reason TEXT,
  invite_code TEXT UNIQUE,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  plan user_plan DEFAULT 'free',
  payment_id UUID,
  afterlife_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BENEFICIARIES: Family members and beneficiaries
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  aadhaar_last4 TEXT,
  pan TEXT,
  address TEXT,
  is_minor BOOLEAN DEFAULT false,
  guardian_name TEXT,
  guardian_relation TEXT,
  invitation_token TEXT UNIQUE,
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_accepted_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DIGITAL_WILLS: The core will documents
CREATE TABLE digital_wills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status digital_will_status DEFAULT 'draft',
  current_section INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  personal_info JSONB,
  family_details JSONB,
  special_instructions JSONB,
  executor_details JSONB,
  islamic_declaration BOOLEAN DEFAULT false,
  pdf_url TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_image_url TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ASSETS: User's assets and property
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  will_id UUID REFERENCES digital_wills(id) ON DELETE SET NULL,
  category asset_category NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  estimated_value DECIMAL(15, 2),
  currency TEXT DEFAULT 'INR',
  institution_name TEXT,
  account_number TEXT,
  account_holder_name TEXT,
  access_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ASSET_DISTRIBUTIONS: How assets are distributed to beneficiaries
CREATE TABLE asset_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  will_id UUID NOT NULL REFERENCES digital_wills(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  allocation_type allocation_type NOT NULL,
  allocation_value DECIMAL(10, 2),
  allocation_percentage DECIMAL(5, 2),
  specific_gift_description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VAULT_DOCUMENTS: Important documents stored in the vault
CREATE TABLE vault_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  category vault_category,
  storage_path TEXT NOT NULL UNIQUE,
  is_encrypted BOOLEAN DEFAULT true,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VAULT_ACCESS: Control over who can access vault documents
CREATE TABLE vault_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES vault_documents(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  access_granted_at TIMESTAMP WITH TIME ZONE,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  viewed_at TIMESTAMP WITH TIME ZONE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MESSAGES: Video, audio, or text messages for beneficiaries
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  format message_format NOT NULL,
  trigger message_trigger NOT NULL DEFAULT 'manual',
  subject TEXT,
  content TEXT NOT NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  storage_path TEXT,
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENTS: Payment and subscription tracking
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status payment_status DEFAULT 'pending',
  plan user_plan,
  plan_duration_months INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS: User notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INVITE_CODES: Referral invite codes
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUDIT_LOG: Track all user actions for security and compliance
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action audit_action NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(id);
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX idx_profiles_plan ON profiles(plan);
CREATE INDEX idx_profiles_invite_code ON profiles(invite_code);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Beneficiaries
CREATE INDEX idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX idx_beneficiaries_email ON beneficiaries(email);
CREATE INDEX idx_beneficiaries_phone ON beneficiaries(phone);
CREATE INDEX idx_beneficiaries_invited_by ON beneficiaries(user_id, is_verified);

-- Digital Wills
CREATE INDEX idx_digital_wills_user_id ON digital_wills(user_id);
CREATE INDEX idx_digital_wills_status ON digital_wills(status);
CREATE INDEX idx_digital_wills_created_at ON digital_wills(created_at DESC);

-- Assets
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_will_id ON assets(will_id);
CREATE INDEX idx_assets_category ON assets(category);

-- Asset Distributions
CREATE INDEX idx_asset_distributions_will_id ON asset_distributions(will_id);
CREATE INDEX idx_asset_distributions_asset_id ON asset_distributions(asset_id);
CREATE INDEX idx_asset_distributions_beneficiary_id ON asset_distributions(beneficiary_id);

-- Vault Documents
CREATE INDEX idx_vault_documents_user_id ON vault_documents(user_id);
CREATE INDEX idx_vault_documents_category ON vault_documents(category);
CREATE INDEX idx_vault_documents_created_at ON vault_documents(created_at DESC);

-- Vault Access
CREATE INDEX idx_vault_access_document_id ON vault_access(document_id);
CREATE INDEX idx_vault_access_beneficiary_id ON vault_access(beneficiary_id);
CREATE INDEX idx_vault_access_active ON vault_access(is_active);

-- Messages
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_beneficiary_id ON messages(recipient_beneficiary_id);
CREATE INDEX idx_messages_trigger ON messages(trigger);
CREATE INDEX idx_messages_delivered ON messages(is_delivered);
CREATE INDEX idx_messages_scheduled ON messages(scheduled_date, scheduled_time);

-- Payments
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Invite Codes
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_created_by ON invite_codes(created_by);
CREATE INDEX idx_invite_codes_is_used ON invite_codes(is_used);

-- Audit Log
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_digital_wills_updated_at BEFORE UPDATE ON digital_wills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_asset_distributions_updated_at BEFORE UPDATE ON asset_distributions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vault_documents_updated_at BEFORE UPDATE ON vault_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate Afterlife Score
CREATE OR REPLACE FUNCTION public.calculate_afterlife_score(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  will_count INTEGER;
  beneficiary_count INTEGER;
  asset_count INTEGER;
  vault_doc_count INTEGER;
BEGIN
  -- Base score
  score := 10;

  -- KYC verification (20 points)
  SELECT COUNT(*) INTO profile_count FROM profiles
  WHERE id = user_id AND kyc_status = 'verified';
  IF profile_count > 0 THEN
    score := score + 20;
  END IF;

  -- Profile completeness (10 points)
  SELECT COUNT(*) INTO profile_count FROM profiles
  WHERE id = user_id AND full_name IS NOT NULL AND phone IS NOT NULL;
  IF profile_count > 0 THEN
    score := score + 10;
  END IF;

  -- Digital will creation (25 points)
  SELECT COUNT(*) INTO will_count FROM digital_wills
  WHERE user_id = user_id AND status != 'draft';
  IF will_count > 0 THEN
    score := score + 25;
  END IF;

  -- Will completion (20 points)
  SELECT COUNT(*) INTO will_count FROM digital_wills
  WHERE user_id = user_id AND status = 'signed';
  IF will_count > 0 THEN
    score := score + 20;
  END IF;

  -- Beneficiaries added (15 points per up to 3)
  SELECT COUNT(*) INTO beneficiary_count FROM beneficiaries
  WHERE user_id = user_id;
  IF beneficiary_count > 0 THEN
    score := score + LEAST(beneficiary_count * 5, 15);
  END IF;

  -- Assets documented (15 points)
  SELECT COUNT(*) INTO asset_count FROM assets
  WHERE user_id = user_id;
  IF asset_count > 0 THEN
    score := score + LEAST(asset_count * 3, 15);
  END IF;

  -- Vault documents (10 points)
  SELECT COUNT(*) INTO vault_doc_count FROM vault_documents
  WHERE user_id = user_id;
  IF vault_doc_count > 0 THEN
    score := score + LEAST(vault_doc_count * 2, 10);
  END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can insert" ON profiles
  FOR INSERT WITH CHECK (true);

-- BENEFICIARIES: Users can manage their beneficiaries
CREATE POLICY "Users can view own beneficiaries" ON beneficiaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert beneficiaries" ON beneficiaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beneficiaries" ON beneficiaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own beneficiaries" ON beneficiaries
  FOR DELETE USING (auth.uid() = user_id);

-- DIGITAL_WILLS: Users can manage their wills
CREATE POLICY "Users can view own wills" ON digital_wills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert wills" ON digital_wills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wills" ON digital_wills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wills" ON digital_wills
  FOR DELETE USING (auth.uid() = user_id);

-- ASSETS: Users can manage their assets
CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE USING (auth.uid() = user_id);

-- ASSET_DISTRIBUTIONS: Accessible through will access
CREATE POLICY "Users can view distributions in their wills" ON asset_distributions
  FOR SELECT USING (
    will_id IN (
      SELECT id FROM digital_wills WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage distributions in their wills" ON asset_distributions
  FOR INSERT WITH CHECK (
    will_id IN (
      SELECT id FROM digital_wills WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update distributions in their wills" ON asset_distributions
  FOR UPDATE USING (
    will_id IN (
      SELECT id FROM digital_wills WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete distributions in their wills" ON asset_distributions
  FOR DELETE USING (
    will_id IN (
      SELECT id FROM digital_wills WHERE user_id = auth.uid()
    )
  );

-- VAULT_DOCUMENTS: Users can manage their documents
CREATE POLICY "Users can view own vault documents" ON vault_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert vault documents" ON vault_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault documents" ON vault_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault documents" ON vault_documents
  FOR DELETE USING (auth.uid() = user_id);

-- VAULT_ACCESS: Beneficiaries can view documents they have access to
CREATE POLICY "Beneficiaries can view granted vault access" ON vault_access
  FOR SELECT USING (
    beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE id = auth.uid()
    ) OR
    document_id IN (
      SELECT id FROM vault_documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can grant vault access" ON vault_access
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM vault_documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can revoke vault access" ON vault_access
  FOR DELETE USING (
    document_id IN (
      SELECT id FROM vault_documents WHERE user_id = auth.uid()
    )
  );

-- MESSAGES: Users can manage messages to their beneficiaries
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);

-- PAYMENTS: Users can view their payment history
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS: Users can view their notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update notification status" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- INVITE_CODES: Users can view codes they created
CREATE POLICY "Users can view own invite codes" ON invite_codes
  FOR SELECT USING (auth.uid() = created_by);

-- AUDIT_LOG: Users can view their audit log (read-only)
CREATE POLICY "Users can view own audit log" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert audit logs" ON audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - Remove in production)
-- ============================================================================

-- Comment out or remove these in production environments
-- INSERT INTO profiles (id, full_name, kyc_status, is_active, plan)
-- VALUES
--   ('550e8400-e29b-41d4-a716-446655440000', 'Test User', 'verified', true, 'free');
