# Afterlife PWA - Complete Setup Guide

This guide walks you through setting up the Afterlife digital legacy platform from scratch.

## Prerequisites

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **npm** - Comes with Node.js
- **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
- **Razorpay Account** - Sign up at [razorpay.com](https://razorpay.com)
- **Git** - For version control

## Step 1: Clone or Copy the Project

Clone the repository or copy the project files to your local machine:

```bash
cd ~/projects
git clone <repository-url>
cd afterlife-app
```

Or manually copy the project files to your desired location.

## Step 2: Install Dependencies

Install all npm packages required by the project:

```bash
npm install
```

This installs Next.js, React, TypeScript, Supabase client, Tailwind CSS, lucide-react, sonner, and all other dependencies defined in `package.json`.

## Step 3: Set Up Supabase Project

### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Enter project name: `afterlife-app`
4. Create a strong database password
5. Select your region (choose closest to your users)
6. Click **Create new project** and wait for setup to complete

### 3.2 Get Supabase Credentials

After project is created:

1. Go to **Settings** → **API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **anon public** key
4. Copy your **service_role** secret key (keep this safe!)

Store these safely - you'll need them in the next step.

## Step 4: Configure Environment Variables

### 4.1 Create .env.local File

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

### 4.2 Fill in Environment Variables

Edit `.env.local` and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 5: Set Up Supabase Database

### 5.1 Create Database Tables

Go to Supabase Dashboard → **SQL Editor** and run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR,
  phone VARCHAR,
  avatar_url TEXT,
  kyc_status VARCHAR DEFAULT 'pending',
  plan VARCHAR DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Beneficiaries table
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  relation VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  date_of_birth DATE,
  aadhaar_last4 VARCHAR,
  pan VARCHAR,
  address TEXT,
  is_minor BOOLEAN DEFAULT false,
  guardian_name VARCHAR,
  guardian_relation VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Digital Wills table
CREATE TABLE IF NOT EXISTS public.digital_wills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'draft',
  current_section INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  will_id UUID REFERENCES public.digital_wills(id) ON DELETE SET NULL,
  category VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  estimated_value NUMERIC,
  currency VARCHAR DEFAULT 'INR',
  institution_name VARCHAR,
  account_number VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  format VARCHAR NOT NULL DEFAULT 'text',
  trigger VARCHAR NOT NULL DEFAULT 'on_death',
  subject VARCHAR,
  content TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  storage_path TEXT,
  is_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vault Documents table
CREATE TABLE IF NOT EXISTS public.vault_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  file_name VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  storage_path VARCHAR NOT NULL,
  is_encrypted BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR,
  amount NUMERIC NOT NULL,
  currency VARCHAR DEFAULT 'INR',
  status VARCHAR DEFAULT 'pending',
  plan VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  reminder_frequency VARCHAR DEFAULT 'weekly',
  two_fa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_beneficiaries_user_id ON public.beneficiaries(user_id);
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_vault_documents_user_id ON public.vault_documents(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Beneficiaries: Users can only see and manage their beneficiaries
CREATE POLICY "Users can view their beneficiaries" ON public.beneficiaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their beneficiaries" ON public.beneficiaries
  FOR ALL USING (auth.uid() = user_id);

-- Messages: Users can only see and manage their messages
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their messages" ON public.messages
  FOR ALL USING (auth.uid() = user_id);

-- Vault Documents: Users can only see and manage their documents
CREATE POLICY "Users can view their vault documents" ON public.vault_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their vault documents" ON public.vault_documents
  FOR ALL USING (auth.uid() = user_id);

-- Similar policies for other tables (digital_wills, assets, payments, user_settings)
```

### 5.2 Create Storage Buckets

In Supabase Dashboard → **Storage**:

1. Create bucket: `avatars` (Public)
2. Create bucket: `messages` (Private)
3. Create bucket: `vault` (Private)

## Step 6: Configure Razorpay Account

### 6.1 Create Razorpay Account

1. Go to [razorpay.com](https://razorpay.com)
2. Sign up and verify your email
3. Complete KYC verification (required for live payments)

### 6.2 Get API Keys

1. Go to Dashboard → **Settings** → **API Keys**
2. Copy your **Key ID** (public)
3. Copy your **Key Secret** (keep this safe!)
4. Add these to your `.env.local` file

### 6.3 Test vs Live Mode

For development/testing, use **Test Mode** keys. Switch to **Live Mode** only when ready for production.

## Step 7: Run Development Server

Start the Next.js development server:

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### Test the App

1. **Sign Up**: Create a test account at `/auth/signup`
2. **Login**: Use your test credentials at `/auth/login`
3. **Dashboard**: Navigate to `/dashboard`
4. **Create Profile**: Fill in your profile at `/profile`
5. **Add Beneficiaries**: Go to `/beneficiaries` and add family members
6. **Create Will**: Start at `/will`
7. **Compose Messages**: Visit `/messages/compose`
8. **View Score**: Check your Afterlife Score at `/score`
9. **Test Payment**: Go to `/payments` and test Razorpay (use test cards)

## Step 8: Deploy to Vercel

### 8.1 Prepare for Deployment

1. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Afterlife PWA"
git branch -M main
git remote add origin https://github.com/username/afterlife-app.git
git push -u origin main
```

2. Make sure `.env.local` is in `.gitignore` (it should be)

### 8.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. **Configure Environment Variables**:
   - Add all keys from `.env.local`
   - **Important**: Use live Razorpay keys for production
5. Click **Deploy**

### 8.3 Post-Deployment

1. Update `.env.local` with production Supabase and Razorpay URLs
2. Test the live deployment
3. Set up custom domain in Vercel settings
4. Configure CORS in Supabase for your domain

## Step 9: Configure Supabase Auth URLs

In Supabase Dashboard → **Settings** → **Auth**:

1. Add **Redirect URLs**:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

2. Add **Site URL**:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`

## Step 10: Set Up Email Notifications (Optional)

For sending emails:

1. Go to Supabase → **Settings** → **Auth**
2. Configure email provider (SendGrid, Mailgun, or Supabase's built-in)
3. Customize email templates for:
   - Confirmation emails
   - Password reset
   - Invitations

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Supabase Connection Error

- Verify `.env.local` has correct Supabase URL and keys
- Check that Supabase project is active
- Ensure RLS policies are configured

### Razorpay Payment Fails

- Verify API keys are correct for Test/Live mode
- Check that payment amount is > 0
- Use official Razorpay test cards for testing

### Database Migration Issues

- Check SQL syntax in Supabase SQL Editor
- Verify UUID extension is enabled
- Ensure foreign key constraints are correct

## Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Run type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run start
```

### Code Style

The project uses:
- **ESLint** for code quality
- **Prettier** for formatting (via Tailwind CSS)
- **TypeScript** for type safety

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Razorpay switched to Live Mode
- [ ] Supabase RLS policies enabled
- [ ] Custom domain configured
- [ ] Email notifications tested
- [ ] Payment flow tested end-to-end
- [ ] Database backups enabled
- [ ] Monitor errors with Sentry (optional)
- [ ] Set up analytics (optional)

## Support & Documentation

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Razorpay**: https://razorpay.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## License

This project is proprietary. All rights reserved.

---

**Need Help?** Contact support@afterlife.app
