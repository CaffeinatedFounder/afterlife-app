'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';

const PersonalInfoSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']),
  religion: z.string().optional(),
  nationality: z.string().min(1, 'Nationality is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  aadhaar: z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits'),
});

type PersonalInfoFormData = z.infer<typeof PersonalInfoSchema>;

const RELIGIONS = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Buddhist',
  'Jain',
  'Atheist',
  'Other',
];

const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Chandigarh',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
];

export default function Step1Page() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: {
      gender: 'male',
      marital_status: 'single',
    },
  });

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const { data: will } = await supabase
          .from('digital_wills')
          .select('personal_info')
          .eq('user_id', session.user.id)
          .single();

        if (will?.personal_info) {
          const info = will.personal_info;
          Object.keys(info).forEach((key) => {
            setValue(key as any, info[key]);
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase, setValue]);

  const onSubmit = async (data: PersonalInfoFormData) => {
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No session');
      }

      // Check if will exists
      const { data: existingWill } = await supabase
        .from('digital_wills')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (existingWill) {
        // Update existing will
        await supabase
          .from('digital_wills')
          .update({
            personal_info: data,
            current_section: 2,
            completion_percentage: 17,
          })
          .eq('id', existingWill.id);
      } else {
        // Create new will
        await supabase.from('digital_wills').insert({
          user_id: session.user.id,
          personal_info: data,
          current_section: 2,
          completion_percentage: 17,
        });
      }

      router.push('/will/step2');
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-24">
      {/* Name Fields */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name" className="text-slate-700">
              Full Name *
            </Label>
            <Controller
              name="full_name"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    id="full_name"
                    placeholder="John Doe"
                    className="mt-2"
                  />
                  {errors.full_name && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.full_name.message}
                    </div>
                  )}
                </>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_of_birth" className="text-slate-700">
                Date of Birth *
              </Label>
              <Controller
                name="date_of_birth"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      id="date_of_birth"
                      type="date"
                      className="mt-2"
                    />
                    {errors.date_of_birth && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.date_of_birth.message}
                      </div>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <Label htmlFor="gender" className="text-slate-700">
                Gender *
              </Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="gender" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marital_status" className="text-slate-700">
                Marital Status *
              </Label>
              <Controller
                name="marital_status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="marital_status" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="religion" className="text-slate-700">
                Religion (Optional)
              </Label>
              <Controller
                name="religion"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ''} onValueChange={field.onChange}>
                    <SelectTrigger id="religion" className="mt-2">
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map((religion) => (
                        <SelectItem key={religion} value={religion}>
                          {religion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="nationality" className="text-slate-700">
              Nationality *
            </Label>
            <Controller
              name="nationality"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    id="nationality"
                    placeholder="Indian"
                    className="mt-2"
                  />
                  {errors.nationality && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nationality.message}
                    </div>
                  )}
                </>
              )}
            />
          </div>
        </div>
      </Card>

      {/* Address Fields */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Address</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-slate-700">
              Address *
            </Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    id="address"
                    placeholder="123 Main Street"
                    className="mt-2"
                  />
                  {errors.address && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.address.message}
                    </div>
                  )}
                </>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-slate-700">
                City *
              </Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      id="city"
                      placeholder="Mumbai"
                      className="mt-2"
                    />
                    {errors.city && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.city.message}
                      </div>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <Label htmlFor="state" className="text-slate-700">
                State *
              </Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="state" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.state.message}
                      </div>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pincode" className="text-slate-700">
              Pincode (6 digits) *
            </Label>
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    id="pincode"
                    placeholder="400001"
                    className="mt-2"
                  />
                  {errors.pincode && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.pincode.message}
                    </div>
                  )}
                </>
              )}
            />
          </div>
        </div>
      </Card>

      {/* Government IDs */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Government IDs</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="pan" className="text-slate-700">
              PAN (Format: AAAAA1234A) *
            </Label>
            <Controller
              name="pan"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    id="pan"
                    placeholder="AAAAB1234C"
                    className="mt-2 uppercase"
                  />
                  {errors.pan && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.pan.message}
                    </div>
                  )}
                </>
              )}
            />
          </div>

          <div>
            <Label htmlFor="aadhaar" className="text-slate-700">
              Aadhaar (12 digits) *
            </Label>
            <Controller
              name="aadhaar"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    id="aadhaar"
                    placeholder="123456789012"
                    className="mt-2"
                  />
                  {errors.aadhaar && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.aadhaar.message}
                    </div>
                  )}
                </>
              )}
            />
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Back
            </Button>
          </div>

          <div className="flex-1 flex justify-center">
            <Button variant="ghost" className="text-slate-600">
              Save & Exit
            </Button>
          </div>

          <div>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
