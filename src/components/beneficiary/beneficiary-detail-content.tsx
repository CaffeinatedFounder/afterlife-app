'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Edit,
  Trash2,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Package,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { Beneficiary } from '@/types';

interface BeneficiaryDetailContentProps {
  beneficiary: Beneficiary;
  assets: any[];
  documents: any[];
}

const beneficiaryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  relation: z.string().min(1, 'Please select a relation'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  aadhaarLast4: z.string().regex(/^\d{4}$/, 'Must be 4 digits').optional().or(z.literal('')),
  pan: z.string().optional(),
  address: z.string().optional(),
  isMinor: z.boolean().default(false),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
});

type BeneficiaryFormData = z.infer<typeof beneficiaryFormSchema>;

export function BeneficiaryDetailContent({
  beneficiary,
  assets,
  documents,
}: BeneficiaryDetailContentProps) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiaryFormSchema),
    defaultValues: {
      name: beneficiary.name,
      relation: beneficiary.relation,
      email: beneficiary.email || '',
      phone: beneficiary.phone || '',
      dateOfBirth: beneficiary.date_of_birth || '',
      aadhaarLast4: beneficiary.aadhaar_last4 || '',
      pan: beneficiary.pan || '',
      address: beneficiary.address || '',
      isMinor: beneficiary.is_minor,
      guardianName: beneficiary.guardian_name || '',
      guardianRelation: beneficiary.guardian_relation || '',
    },
  });

  const isMinor = watch('isMinor');

  const onSubmit = async (data: BeneficiaryFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const supabase = createClient();

      const { error: updateError } = await supabase
        .from('beneficiaries')
        .update({
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
        })
        .eq('id', beneficiary.id);

      if (updateError) {
        setErrorMessage('Failed to update beneficiary. Please try again.');
        return;
      }

      setSuccessMessage('Beneficiary updated successfully');
      setTimeout(() => {
        setIsEditMode(false);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const supabase = createClient();

      const { error: deleteError } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', beneficiary.id);

      if (deleteError) {
        setErrorMessage('Failed to delete beneficiary. Please try again.');
        return;
      }

      router.push('/beneficiaries');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Edit/View Toggle */}
      {!isEditMode ? (
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => setIsEditMode(true)}
          >
            <Edit className="h-5 w-5" />
            <span>Edit</span>
          </Button>
          <Button
            variant="danger"
            size="md"
            className="flex-1"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-5 w-5" />
            <span>Delete</span>
          </Button>
        </div>
      ) : null}

      {/* View Mode */}
      {!isEditMode && (
        <div className="space-y-6">
          {/* Personal Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-medium text-gray-900">{beneficiary.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Relation</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {beneficiary.relation}
                  </span>
                  {beneficiary.is_minor && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      Minor
                    </span>
                  )}
                </div>
              </div>

              {beneficiary.date_of_birth && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(beneficiary.date_of_birth).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>

            <div className="space-y-3">
              {beneficiary.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900 break-all">{beneficiary.email}</p>
                  </div>
                </div>
              )}

              {beneficiary.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{beneficiary.phone}</p>
                  </div>
                </div>
              )}

              {!beneficiary.email && !beneficiary.phone && (
                <p className="text-gray-600 italic">No contact information added</p>
              )}
            </div>
          </div>

          {/* Identity Information Card */}
          {(beneficiary.aadhaar_last4 || beneficiary.pan) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Identity</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {beneficiary.aadhaar_last4 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Aadhaar (Last 4)</p>
                    <p className="font-medium text-gray-900">****{beneficiary.aadhaar_last4}</p>
                  </div>
                )}

                {beneficiary.pan && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">PAN</p>
                    <p className="font-medium text-gray-900">{beneficiary.pan}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Address Card */}
          {beneficiary.address && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-medium text-gray-900 whitespace-pre-wrap">
                    {beneficiary.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guardian Information Card */}
          {beneficiary.is_minor && beneficiary.guardian_name && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Guardian Name</p>
                  <p className="font-medium text-gray-900">{beneficiary.guardian_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Relation</p>
                  <p className="font-medium text-gray-900">{beneficiary.guardian_relation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Assets Assigned Card */}
          {assets.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-purple-900" />
                <h2 className="text-lg font-semibold text-gray-900">Assets Assigned</h2>
              </div>

              <div className="space-y-3">
                {assets.map((distribution) => (
                  <div
                    key={distribution.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {distribution.assets?.name || 'Unknown Asset'}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {distribution.allocation_type === 'percentage'
                          ? `${distribution.allocation_value}%`
                          : distribution.allocation_type === 'unit'
                            ? `${distribution.allocation_value} units`
                            : 'Specific gift'}
                      </p>
                    </div>
                    {distribution.assets?.estimated_value && (
                      <p className="font-medium text-gray-900">
                        {distribution.assets.currency} {distribution.assets.estimated_value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Shared Card */}
          {documents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-purple-900" />
                <h2 className="text-lg font-semibold text-gray-900">Documents Shared</h2>
              </div>

              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-600">
                        {doc.category} • {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Mode */}
      {isEditMode && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="relation" className="block text-sm font-medium text-gray-700 mb-2">
                  Relation
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
              </div>

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

          {/* Contact Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Identity Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Identity</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="aadhaarLast4" className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar (Last 4)
                </label>
                <input
                  {...register('aadhaarLast4')}
                  type="text"
                  id="aadhaarLast4"
                  maxLength={4}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-2">
                  PAN
                </label>
                <input
                  {...register('pan')}
                  type="text"
                  id="pan"
                  maxLength={10}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>

            <textarea
              {...register('address')}
              placeholder="Full address"
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent resize-none"
            />
          </div>

          {/* Minor Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Minor Status</h2>

            <div className="mb-4 flex items-center gap-3">
              <input
                {...register('isMinor')}
                type="checkbox"
                id="isMinor"
                className="h-5 w-5 rounded border-gray-300 text-purple-900"
              />
              <label htmlFor="isMinor" className="text-sm font-medium text-gray-700">
                This beneficiary is a minor
              </label>
            </div>

            {isMinor && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Name
                  </label>
                  <input
                    {...register('guardianName')}
                    type="text"
                    id="guardianName"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="guardianRelation" className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian Relation
                  </label>
                  <input
                    {...register('guardianRelation')}
                    type="text"
                    id="guardianRelation"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 sticky bottom-0 bg-gray-50 border-t border-gray-100 p-4 -mx-6">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setIsEditMode(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isLoading && setShowDeleteConfirm(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm mx-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Delete Beneficiary</h3>
                <p className="text-gray-600 mt-2 text-sm">
                  Are you sure you want to delete {beneficiary.name}? This action cannot be
                  undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                size="md"
                className="flex-1"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
