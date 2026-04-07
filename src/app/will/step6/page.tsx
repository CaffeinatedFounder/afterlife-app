'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2, CheckCircle2, Download, Share2 } from 'lucide-react';

interface WillData {
  personal_info: any;
  family_details: any;
  special_instructions: any;
}

export default function Step6Page() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatedPDF, setGeneratedPDF] = useState(false);
  const [willData, setWillData] = useState<WillData | null>(null);

  const [formData, setFormData] = useState({
    executor_name: '',
    executor_relation: '',
    executor_phone: '',
    executor_email: '',
    executor_address: '',
    alternate_executor_name: '',
    alternate_executor_relation: '',
    alternate_executor_phone: '',
    alternate_executor_email: '',
    islamic_declaration: false,
    funeral_wishes: '',
    organ_donation: false,
    charitable_donations: '',
    guardianship_minors: '',
    additional_notes: '',
  });

  // Load data
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
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (will) {
          setWillData({
            personal_info: will.personal_info,
            family_details: will.family_details,
            special_instructions: will.special_instructions,
          });

          // Pre-populate executor data if exists
          if (will.special_instructions?.executor_name) {
            setFormData({
              ...formData,
              executor_name: will.special_instructions.executor_name,
              executor_relation: will.special_instructions.executor_relation,
              executor_phone: will.special_instructions.executor_phone,
              executor_email: will.special_instructions.executor_email,
              executor_address: will.special_instructions.executor_address,
              alternate_executor_name: will.special_instructions.alternate_executor_name || '',
              alternate_executor_relation: will.special_instructions.alternate_executor_relation || '',
              alternate_executor_phone: will.special_instructions.alternate_executor_phone || '',
              alternate_executor_email: will.special_instructions.alternate_executor_email || '',
              islamic_declaration: will.special_instructions.islamic_declaration || false,
              funeral_wishes: will.special_instructions.funeral_wishes || '',
              organ_donation: will.special_instructions.organ_donation || false,
              charitable_donations: will.special_instructions.charitable_donations || '',
              guardianship_minors: will.special_instructions.guardianship_minors || '',
              additional_notes: will.special_instructions.additional_notes || '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const handleGenerateWill = async () => {
    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('No session');

      // Save special instructions
      const { data: existingWill } = await supabase
        .from('digital_wills')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (existingWill) {
        await supabase
          .from('digital_wills')
          .update({
            special_instructions: formData,
            current_section: 6,
            completion_percentage: 100,
          })
          .eq('id', existingWill.id);
      }

      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setGeneratedPDF(true);
    } catch (error) {
      console.error('Error generating will:', error);
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

  if (generatedPDF) {
    return (
      <div className="space-y-6 mb-24">
        {/* Success Screen */}
        <Card className="p-12 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Your Digital Will is Ready!
          </h2>

          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Your comprehensive digital will has been successfully created and is securely stored.
          </p>

          <div className="space-y-3">
            <Button className="w-full md:w-64 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Download as PDF
            </Button>

            <Button variant="outline" className="w-full md:w-64">
              <Share2 className="w-4 h-4 mr-2" />
              Share with Family
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">Next Steps:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-white rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-2 mx-auto">
                  1
                </div>
                <p className="font-medium text-slate-900 mb-1">Review Regularly</p>
                <p className="text-xs text-slate-600">
                  Update your will whenever circumstances change
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-2 mx-auto">
                  2
                </div>
                <p className="font-medium text-slate-900 mb-1">Inform Executor</p>
                <p className="text-xs text-slate-600">
                  Let your executor know about this digital will
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-2 mx-auto">
                  3
                </div>
                <p className="font-medium text-slate-900 mb-1">Secure Storage</p>
                <p className="text-xs text-slate-600">
                  Your will is encrypted and safely stored
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/will')}
              className="text-slate-600"
            >
              Return to Will Overview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-24">
      {/* Executor Details */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Executor of Will</h3>
        <p className="text-sm text-slate-600 mb-4">
          The executor is responsible for managing your estate and ensuring your wishes are carried out.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700">Executor Name *</Label>
              <Input
                placeholder="Full name"
                value={formData.executor_name}
                onChange={(e) => setFormData({ ...formData, executor_name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-slate-700">Relation *</Label>
              <Input
                placeholder="Son, Daughter, Spouse, etc."
                value={formData.executor_relation}
                onChange={(e) => setFormData({ ...formData, executor_relation: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700">Phone *</Label>
              <Input
                type="tel"
                placeholder="+91-XXXXXXXXXX"
                value={formData.executor_phone}
                onChange={(e) => setFormData({ ...formData, executor_phone: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-slate-700">Email *</Label>
              <Input
                type="email"
                placeholder="executor@example.com"
                value={formData.executor_email}
                onChange={(e) => setFormData({ ...formData, executor_email: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-700">Address</Label>
            <Input
              placeholder="Full address"
              value={formData.executor_address}
              onChange={(e) => setFormData({ ...formData, executor_address: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Alternate Executor */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Alternate Executor (Optional)</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700">Name</Label>
              <Input
                placeholder="Full name"
                value={formData.alternate_executor_name}
                onChange={(e) => setFormData({ ...formData, alternate_executor_name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-slate-700">Relation</Label>
              <Input
                placeholder="Brother, Sister, Friend, etc."
                value={formData.alternate_executor_relation}
                onChange={(e) => setFormData({ ...formData, alternate_executor_relation: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700">Phone</Label>
              <Input
                type="tel"
                placeholder="+91-XXXXXXXXXX"
                value={formData.alternate_executor_phone}
                onChange={(e) => setFormData({ ...formData, alternate_executor_phone: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-slate-700">Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.alternate_executor_email}
                onChange={(e) => setFormData({ ...formData, alternate_executor_email: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Special Instructions */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Special Instructions</h3>

        <div className="space-y-4">
          {/* Funeral Wishes */}
          <div>
            <Label className="text-slate-700">Funeral Wishes</Label>
            <Textarea
              placeholder="Describe your funeral preferences, burial/cremation wishes, memorial services, etc."
              value={formData.funeral_wishes}
              onChange={(e) => setFormData({ ...formData, funeral_wishes: e.target.value })}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Organ Donation */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              checked={formData.organ_donation}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, organ_donation: checked as boolean })
              }
            />
            <div>
              <Label className="font-medium text-slate-900">I wish to donate my organs</Label>
              <p className="text-xs text-slate-600">
                Make your organs available for transplantation
              </p>
            </div>
          </div>

          {/* Charitable Donations */}
          <div>
            <Label className="text-slate-700">Charitable Donations</Label>
            <Textarea
              placeholder="List any charitable organizations you'd like to donate to, with amounts or percentages"
              value={formData.charitable_donations}
              onChange={(e) => setFormData({ ...formData, charitable_donations: e.target.value })}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Guardianship */}
          <div>
            <Label className="text-slate-700">Guardianship for Minor Children</Label>
            <Textarea
              placeholder="Specify who should care for your minor children if both parents are unavailable"
              value={formData.guardianship_minors}
              onChange={(e) => setFormData({ ...formData, guardianship_minors: e.target.value })}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Additional Notes */}
          <div>
            <Label className="text-slate-700">Additional Notes & Instructions</Label>
            <Textarea
              placeholder="Any other instructions, wishes, or information for your executor and family"
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              className="mt-2"
              rows={4}
            />
          </div>

          {/* Islamic Declaration */}
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Checkbox
              checked={formData.islamic_declaration}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, islamic_declaration: checked as boolean })
              }
            />
            <div>
              <Label className="font-medium text-slate-900">
                This will follows Islamic (Sharia) principles
              </Label>
              <p className="text-xs text-slate-600">
                Your will shall be executed in accordance with Islamic law
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Section */}
      {willData && (
        <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">Will Summary</h3>

          <div className="space-y-4 text-sm">
            {willData.personal_info && (
              <div>
                <p className="font-medium text-slate-900">Personal Information</p>
                <p className="text-slate-600">
                  {willData.personal_info.full_name} | {willData.personal_info.date_of_birth}
                </p>
              </div>
            )}

            {willData.family_details && (
              <div>
                <p className="font-medium text-slate-900">Family Members</p>
                <p className="text-slate-600">
                  {willData.family_details.spouse?.name ? `Spouse: ${willData.family_details.spouse.name}` : 'No spouse'} |
                  {willData.family_details.children?.length ? ` Children: ${willData.family_details.children.length}` : ' No children'}
                </p>
              </div>
            )}

            <div>
              <p className="font-medium text-slate-900">Executor</p>
              <p className="text-slate-600">
                {formData.executor_name} ({formData.executor_relation})
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border border-slate-200">
            <p className="text-xs text-slate-600">
              By clicking "Generate Will", you confirm that all information provided is accurate and complete.
            </p>
          </div>
        </Card>
      )}

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
              onClick={handleGenerateWill}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              disabled={submitting || !formData.executor_name || !formData.executor_phone || !formData.executor_email}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Will'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
