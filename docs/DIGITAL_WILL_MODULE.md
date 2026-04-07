# Digital Will Module - Implementation Guide

## Overview

The Digital Will module is a comprehensive 6-section multi-step will creation flow for the Afterlife PWA. This production-quality implementation uses Next.js 15 (App Router), TypeScript, Tailwind CSS, React Hook Form, and Zod validation.

## Architecture

### Files Created

#### Core Pages (7 step pages + 1 overview)

1. **`/app/will/page.tsx`** - Will Landing/Overview Page
   - Server component showing will status
   - If no will exists: "Create Your Digital Will" CTA with 6-section explainer
   - If will exists: Status card with progress %, current section, action buttons
   - Info cards explaining each section
   - Completion statistics

2. **`/app/will/layout.tsx`** - Will Section Layout
   - Shared layout for all step pages
   - Sticky header with step counter (Step X of 6)
   - Progress bar visual feedback
   - Navigation: Back/Cancel buttons
   - Footer with "Save & Exit" and Next/Generate buttons
   - Auto-hides for non-step pages

3. **`/app/will/step1/page.tsx`** - Personal Information
   - Form fields:
     - Full Name, Date of Birth
     - Gender (dropdown), Marital Status (dropdown)
     - Religion (optional), Nationality
     - Address, City, State, Pincode
     - PAN (with validation), Aadhaar (with validation)
   - Zod schema validation
   - Auto-fills from existing will data
   - Saves to `digital_wills.personal_info` (JSONB)
   - Progress: 17% completion

4. **`/app/will/step2/page.tsx`** - Family Details
   - Dynamic fields for:
     - Spouse (name, alive status)
     - Children (add/remove with name, relation, status, DOB)
     - Parents (add/remove)
     - Siblings (add/remove)
   - React Hook Form with useFieldArray
   - Saves to `digital_wills.family_details` (JSONB)
   - Progress: 33% completion

5. **`/app/will/step3/page.tsx`** - Asset Declaration
   - 12 asset category buttons:
     - Real Estate, Bank Accounts, Investments, Insurance
     - Vehicles, Gold/Jewelry, Business, Digital Assets
     - Bonds/Shares, Lockers, Land, Other
   - Add Asset Form:
     - Name, Description, Estimated Value
     - Institution Name, Account Number
   - Asset list with delete functionality
   - Total asset value display
   - Saves to `assets` table
   - Progress: 50% completion

6. **`/app/will/step4/page.tsx`** - Beneficiary Assignment
   - Display declared assets from Step 3
   - Add new beneficiary quick-add button
   - For each asset: assign one or more beneficiaries
   - Beneficiary picker with add/remove
   - Assignment summary card
   - Saves to `asset_distributions` table
   - Progress: 67% completion

7. **`/app/will/step5/page.tsx`** - Asset Distribution (MOST COMPLEX)
   - For each asset-beneficiary pair:
     - 3 allocation types:
       - **Percentage**: Slider + numeric input (0-100%), must total 100% per asset
       - **Units**: Number input
       - **Specific Gift**: Text description
   - Validation: All asset percentages must total 100%
   - Special Gifts Section:
     - "Would you like to share any specific gifts?" prompt
     - Gift form: Beneficiary, Description, Notes
   - Distribution summary showing all allocations
   - Color-coded cards (purple/blue gradient)
   - Green checkmark for valid, red X for invalid distributions
   - Saves to `allocations` and `special_gifts` tables
   - Progress: 83% completion

8. **`/app/will/step6/page.tsx`** - Review & Special Instructions
   - Executor Details:
     - Name, Relation, Phone, Email, Address
   - Alternate Executor (optional):
     - Same fields as main executor
   - Special Instructions:
     - Funeral Wishes (textarea)
     - Organ Donation toggle
     - Charitable Donations (textarea)
     - Guardianship for Minors (textarea)
     - Additional Notes (textarea)
     - Islamic Declaration checkbox
   - Full will summary/review
   - "Generate Will" button
   - Loading state: "Generating your will..." animation
   - Success screen with:
     - "View Will PDF" button
     - "Share" option
     - Next steps guidance
   - Progress: 100% completion

#### Components

9. **`/components/will/will-progress.tsx`** - Will Progress Component
   - Visual progress indicator with 6 circular steps
   - Connected by lines showing progression
   - Current step: purple gradient fill + ring
   - Completed steps: green checkmark
   - Future steps: grey, disabled
   - Step labels: "Personal", "Family", "Assets", "Assign", "Distribute", "Review"
   - Compact mobile-responsive layout

#### Hooks

10. **`/hooks/useWill.ts`** - Custom Will Management Hook
   - Fetches current will from Supabase
   - Methods:
     - `saveSection(section, data)` - Save section data
     - `nextSection()` - Advance to next section
     - `prevSection()` - Go back
     - `calculateProgress()` - Returns percentage (0-100)
     - `generateWill()` - Triggers PDF generation API call
   - State management:
     - `will` - Current will object
     - `loading` - Fetch/save state
     - `error` - Error object
   - Auto-refetches after save

## Database Schema

### Tables Required

```sql
-- digital_wills
CREATE TABLE digital_wills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  current_section INTEGER DEFAULT 1,
  completion_percentage INTEGER DEFAULT 0,
  personal_info JSONB,
  family_details JSONB,
  special_instructions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  category VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_value DECIMAL(15, 2),
  institution_name VARCHAR(255),
  account_number VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- beneficiaries
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  name VARCHAR(255) NOT NULL,
  relation VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- asset_distributions
CREATE TABLE asset_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  asset_id UUID NOT NULL REFERENCES assets,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries,
  created_at TIMESTAMP DEFAULT NOW()
);

-- allocations
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  asset_id UUID NOT NULL REFERENCES assets,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries,
  allocation_type VARCHAR(50) NOT NULL, -- 'percentage', 'units', 'specific_gift'
  value DECIMAL(15, 2) OR TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- special_gifts
CREATE TABLE special_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries,
  gift_description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Design System

### Colors (Afterlife Brand)
- **Primary Gradient**: Purple (`from-purple-600`) to Blue (`to-blue-600`)
- **Success**: Green (`bg-green-600`)
- **Error**: Red (`text-red-600`)
- **Background**: Slate (`from-slate-50 to-slate-100`)
- **Cards**: White with subtle shadows

### Typography
- **Headers**: 24-32px, font-bold, gradient text
- **Subheaders**: 18-20px, font-semibold
- **Body**: 14px, text-slate-600
- **Labels**: 14px, font-medium, text-slate-700

### Components
- All form inputs use `Input` from `@/components/ui/input`
- Dropdowns use custom `Select` component
- Cards: 6px border-radius, subtle shadows
- Buttons: Gradient backgrounds, 6px border-radius
- Icons: lucide-react (4-6px size for inline, 12-16px for standalone)

### Spacing
- Card padding: 6px
- Form gaps: 4px vertical, 4px grid
- Bottom navigation: Fixed 80px from bottom (accounts for mobile nav)

## Form Validation

### Zod Schemas
- **Step 1 (Personal)**: PAN format validation, Aadhaar 12-digit check, date validation
- **Step 2 (Family)**: Minimum name length (2 chars)
- **Step 3 (Assets)**: Value must be positive number
- **Step 5 (Distribution)**: Percentage allocations must total 100% per asset
- **Step 6 (Executor)**: Name, phone, email required for primary executor

### Error Handling
- Inline error messages with `AlertCircle` icon
- Red text color for errors
- Disabled submit buttons until valid
- Toast notifications for API errors (not implemented yet)

## State Management

### Component-Level
- React Hook Form for form state
- useState for UI state (showForm, selectedCategory, etc.)
- useFieldArray for dynamic lists

### Global
- useWill hook for cross-page will data
- Supabase for persistent storage

## Navigation

### User Flow
1. User lands on `/will`
2. Creates new will → `/will/step1`
3. Completes steps sequentially: step1 → step2 → step3 → step4 → step5 → step6
4. On step6 completion: Success screen shown
5. Can edit anytime: `/will` → "Edit from Start" → `/will/step1`

### Back Navigation
- Back button on footer (disabled on Step 1)
- Save & Exit button persists progress
- Cancel button returns to `/will` overview

## Accessibility

- Form labels paired with inputs
- Semantic HTML (form, fieldset, legend)
- ARIA labels on icon buttons
- Keyboard navigation support (Tab through fields)
- Color not only indicator (checkmarks, text labels)
- Mobile-responsive layout (1-column on mobile, multi-column on desktop)

## Performance Optimizations

1. **Server Components**: Overview page uses server-side data fetching
2. **Client Components**: Form-heavy pages use 'use client'
3. **Image Optimization**: Icons from lucide-react (lightweight)
4. **Code Splitting**: Each step is a separate route
5. **Loading States**: Skeleton/spinner on data fetch
6. **Debouncing**: Not needed (form changes are instant)

## Future Enhancements

1. **PDF Generation**: Implement backend API at `/api/will/generate`
2. **Email Notifications**: Notify beneficiaries when will is created
3. **Digital Vault Integration**: Link vault documents to assets
4. **Template Options**: Pre-filled templates for common scenarios
5. **Multi-language Support**: Hindi, regional languages
6. **E-signature**: Legally binding digital signatures
7. **Version History**: Track changes and previous versions
8. **Collaboration**: Share with spouse/attorney for review
9. **Backup & Recovery**: Encrypted backup to personal email/cloud
10. **Reminders**: Annual review prompts

## Testing Checklist

- [ ] Step 1: All form fields validate correctly
- [ ] Step 2: Can add/remove family members
- [ ] Step 3: Asset categories clickable, form appears
- [ ] Step 4: Beneficiaries assignable to assets
- [ ] Step 5: Percentage validation (must sum to 100%)
- [ ] Step 5: Special gifts can be added
- [ ] Step 6: Executor form required fields enforced
- [ ] Step 6: PDF generation success screen appears
- [ ] Progress bar updates on each step
- [ ] Back button works (except Step 1)
- [ ] Save & Exit persists data
- [ ] Mobile responsive layout

## API Endpoints (To Be Implemented)

```
POST /api/will/generate
  - Input: will_id
  - Output: PDF blob or download URL
  - Status: 200 on success, 400 on error

POST /api/will/share
  - Input: will_id, email_addresses
  - Output: Share confirmation
  - Status: 200 on success

GET /api/will/[will_id]
  - Input: will_id (URL param)
  - Output: Full will data (with auth check)
  - Status: 200 on success, 404 if not found
```

## Security Considerations

1. **Authentication**: All endpoints require user session
2. **Authorization**: Users can only access their own will
3. **Data Encryption**: PAN, Aadhaar should be encrypted at rest
4. **Sensitive Data**: Never log financial info or IDs
5. **HTTPS Only**: All form submissions over HTTPS
6. **CSRF Protection**: Use Supabase auth tokens
7. **Rate Limiting**: Implement on PDF generation endpoint
8. **Backup Security**: Encrypted backups only

## Deployment Notes

1. Ensure all environment variables set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Database migrations:
   - Run SQL schema before deploying
   - Create indexes on user_id fields

3. Vercel deployment:
   - No special config needed
   - Next.js handles App Router automatically

4. Testing:
   - Run with `npm run dev` locally
   - Test in Firefox + Chrome for compatibility
   - Test on mobile (iPhone 12, Android)
