'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const beneficiaryFormSchema = z.object({
  // Basic Info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  relation: z.enum(
    ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Friend', 'Other'],
    {
      errorMap: () => ({ message: 'Please select a valid relation' }),
    }
  ),
  dateOfBirth: z.string().optional(),

  // Contact
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),

  // Identity
  aadhaarLast4: z.string().regex(/^\d{4}$/, 'Must be 4 digits').optional().or(z.literal('')),
  pan: z.string().optional(),

  // Address
  address: z.string().optional(),

  // Guardian (for minors)
  isMinor: z.boolean().default(false),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
});

type BeneficiaryFormData = z.infer<typeof beneficiaryFormSchema>;

export default function AddBeneficiaryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiaryFormSchema),
    defaultValues: {
      isMinor: false,
    },
  });

  const isMinor = watch('isMinor');

  const onSubmit = async (data: BeneficiaryFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const supabase = createClient();

      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        setErrorMessage('Authentication error. Please log in again.');
        router.push('/auth/login');
        return;
      }

      // Insert beneficiary
      const { error: insertError } = await supabase.from('beneficiaries').insert({
        user_id: authData.user.id,
        name: data.name,
        relation: data.relation,
        email: data.email || null,
        phone: data.phone || null,
        date_of_birth: data.dateOfBirth || null,
        aadhaar_last4: data.aadhaarLast4 || null,
        pan: data.pan || null,
        address: data.address || null,
        is_minor: data.isMinor,
        guardian_name: data.isMinor ? data.guardianName || null : null,
        guardian_relation: data.isMinor ? data.guardianRelation || null : null,
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        setErrorMessage('Failed to add beneficiary. Please try again.');
        return;
      }

      // Show success toast (would be implemented with a toast library)
      // For now, just redirect
      router.push('/beneficiaries');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 pb-32">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add Beneficiary</h1>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Full name"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Relation */}
            <div>
              <label htmlFor="relation" className="block text-sm font-medium text-gray-700 mb-2">
                Relation <span className="text-red-500">*</span>
              </label>
              <select
                {...register('relation')}
                id="relation"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
              >
                <option value="">Select a relation</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
              {errors.relation && (
                <p className="text-sm text-red-500 mt-1">{errors.relation.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                {...register('dateOfBirth')}
                type="date"
                id="dateOfBirth"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Identity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Identity (Optional)</h2>

          <div className="space-y-4">
            {/* Aadhaar Last 4 */}
            <div>
              <label htmlFor="aadhaarLast4" className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar (Last 4 digits)
              </label>
              <input
                {...register('aadhaarLast4')}
                type="text"
                id="aadhaarLast4"
                placeholder="XXXX"
                maxLength={4}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
              />
              {errors.aadhaarLast4 && (
                <p className="text-sm text-red-500 mt-1">{errors.aadhaarLast4.message}</p>
              )}
            </div>

            {/* PAN */}
            <div>
              <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-2">
                PAN
              </label>
              <input
                {...register('pan')}
                type="text"
                id="pan"
                placeholder="ABCDE1234F"
                maxLength={10}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Address */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address (Optional)</h2>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Full Address
            </label>
            <textarea
              {...register('address')}
              id="address"
              placeholder="Street address, city, state, pincode"
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Section 5: Guardian (for minors) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Minor Status</h2>

          <div className="mb-4 flex items-center gap-3">
            <input
              {...register('isMinor')}
              type="checkbox"
              id="isMinor"
              className="h-5 w-5 rounded border-gray-300 text-purple-900 focus:ring-2 focus:ring-purple-900"
            />
            <label htmlFor="isMinor" className="text-sm font-medium text-gray-700">
              This beneficiary is a minor
            </label>
          </div>

          {isMinor && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('guardianName')}
                  type="text"
                  id="guardianName"
                  placeholder="Guardian's full name"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                />
                {errors.guardianName && (
                  <p className="text-sm text-red-500 mt-1">{errors.guardianName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="guardianRelation" className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian Relation <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('guardianRelation')}
                  type="text"
                  id="guardianRelation"
                  placeholder="e.g., Parent, Aunt, Uncle"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                />
                {errors.guardianRelation && (
                  <p className="text-sm text-red-500 mt-1">{errors.guardianRelation.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 sticky bottom-0 bg-gray-50 border-t border-gray-100 p-4 -mx-4">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              'Add Beneficiary'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
