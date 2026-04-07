'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, X, Loader2 } from 'lucide-react';

const FamilyMemberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  alive: z.enum(['yes', 'no']),
  date_of_birth: z.string().optional(),
});

const FamilyDetailsSchema = z.object({
  spouse: z.object({
    name: z.string().optional(),
    alive: z.enum(['yes', 'no']).optional(),
  }),
  children: z.array(FamilyMemberSchema),
  parents: z.array(FamilyMemberSchema),
  siblings: z.array(FamilyMemberSchema),
});

type FamilyDetailsFormData = z.infer<typeof FamilyDetailsSchema>;

const RELATIONS = {
  children: 'Child',
  parents: 'Parent',
  siblings: 'Sibling',
};

export default function Step2Page() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FamilyDetailsFormData>({
    resolver: zodResolver(FamilyDetailsSchema),
    defaultValues: {
      spouse: { alive: 'yes' },
      children: [],
      parents: [],
      siblings: [],
    },
  });

  const childrenFields = useFieldArray({
    control,
    name: 'children',
  });

  const parentsFields = useFieldArray({
    control,
    name: 'parents',
  });

  const siblingsFields = useFieldArray({
    control,
    name: 'siblings',
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
          .select('family_details')
          .eq('user_id', session.user.id)
          .single();

        if (will?.family_details) {
          const details = will.family_details;
          if (details.spouse) {
            setValue('spouse', details.spouse);
          }
          if (details.children?.length) {
            childrenFields.append(details.children);
          }
          if (details.parents?.length) {
            parentsFields.append(details.parents);
          }
          if (details.siblings?.length) {
            siblingsFields.append(details.siblings);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase, setValue, childrenFields, parentsFields, siblingsFields]);

  const onSubmit = async (data: FamilyDetailsFormData) => {
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('No session');

      const { data: existingWill } = await supabase
        .from('digital_wills')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (existingWill) {
        await supabase
          .from('digital_wills')
          .update({
            family_details: data,
            current_section: 3,
            completion_percentage: 33,
          })
          .eq('id', existingWill.id);
      }

      router.push('/will/step3');
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
      {/* Spouse Information */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Spouse Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spouse_name" className="text-slate-700">
                Spouse Name (Optional)
              </Label>
              <Controller
                name="spouse.name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="spouse_name"
                    placeholder="Jane Doe"
                    className="mt-2"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="spouse_alive" className="text-slate-700">
                Spouse Status
              </Label>
              <Controller
                name="spouse.alive"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || 'yes'} onValueChange={field.onChange}>
                    <SelectTrigger id="spouse_alive" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Alive</SelectItem>
                      <SelectItem value="no">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Children */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Children</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => childrenFields.append({ name: '', relation: 'child', alive: 'yes' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Child
          </Button>
        </div>

        <div className="space-y-4">
          {childrenFields.fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border border-slate-200 rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Child {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => childrenFields.remove(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Name *</Label>
                  <Controller
                    name={`children.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Child's name"
                        className="mt-2"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label className="text-slate-700">Status *</Label>
                  <Controller
                    name={`children.${index}.alive`}
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Alive</SelectItem>
                          <SelectItem value="no">Deceased</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Date of Birth (Optional)</Label>
                <Controller
                  name={`children.${index}.date_of_birth`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className="mt-2"
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Parents */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Parents</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => parentsFields.append({ name: '', relation: 'parent', alive: 'yes' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Parent
          </Button>
        </div>

        <div className="space-y-4">
          {parentsFields.fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border border-slate-200 rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Parent {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => parentsFields.remove(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Name *</Label>
                  <Controller
                    name={`parents.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Parent's name"
                        className="mt-2"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label className="text-slate-700">Status *</Label>
                  <Controller
                    name={`parents.${index}.alive`}
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Alive</SelectItem>
                          <SelectItem value="no">Deceased</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Date of Birth (Optional)</Label>
                <Controller
                  name={`parents.${index}.date_of_birth`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className="mt-2"
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Siblings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Siblings</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => siblingsFields.append({ name: '', relation: 'sibling', alive: 'yes' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sibling
          </Button>
        </div>

        <div className="space-y-4">
          {siblingsFields.fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border border-slate-200 rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Sibling {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => siblingsFields.remove(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Name *</Label>
                  <Controller
                    name={`siblings.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Sibling's name"
                        className="mt-2"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label className="text-slate-700">Status *</Label>
                  <Controller
                    name={`siblings.${index}.alive`}
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Alive</SelectItem>
                          <SelectItem value="no">Deceased</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Date of Birth (Optional)</Label>
                <Controller
                  name={`siblings.${index}.date_of_birth`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      className="mt-2"
                    />
                  )}
                />
              </div>
            </div>
          ))}
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
