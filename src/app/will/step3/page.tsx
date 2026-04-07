'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, X, Loader2, Building, Banknote, TrendingUp, Shield, Car, Gem, Briefcase, Zap, PieChart, Lock, Map, MoreHorizontal } from 'lucide-react';

interface Asset {
  id: string;
  category: string;
  name: string;
  description: string;
  value: number;
  institution?: string;
  account_number?: string;
}

const ASSET_CATEGORIES = [
  { id: 'real_estate', name: 'Real Estate', icon: Building },
  { id: 'bank_accounts', name: 'Bank Accounts', icon: Banknote },
  { id: 'investments', name: 'Investments', icon: TrendingUp },
  { id: 'insurance', name: 'Insurance', icon: Shield },
  { id: 'vehicles', name: 'Vehicles', icon: Car },
  { id: 'jewelry', name: 'Gold/Jewelry', icon: Gem },
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'digital_assets', name: 'Digital Assets', icon: Zap },
  { id: 'bonds_shares', name: 'Bonds/Shares', icon: PieChart },
  { id: 'lockers', name: 'Lockers', icon: Lock },
  { id: 'land', name: 'Land', icon: Map },
  { id: 'other', name: 'Other', icon: MoreHorizontal },
];

export default function Step3Page() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    institution: '',
    account_number: '',
  });

  // Load existing assets
  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const { data } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setAssets(data.map((a: any) => ({
            id: a.id,
            category: a.category,
            name: a.name,
            description: a.description || '',
            value: a.estimated_value || 0,
            institution: a.institution_name,
            account_number: a.account_number,
          })));
        }
      } catch (error) {
        console.error('Error loading assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [supabase]);

  const handleAddAsset = async () => {
    if (!selectedCategory || !formData.name || !formData.value) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('No session');

      const { data } = await supabase
        .from('assets')
        .insert({
          user_id: session.user.id,
          category: selectedCategory,
          name: formData.name,
          description: formData.description,
          estimated_value: parseFloat(formData.value),
          institution_name: formData.institution,
          account_number: formData.account_number,
        })
        .select()
        .single();

      if (data) {
        setAssets([...assets, {
          id: data.id,
          category: data.category,
          name: data.name,
          description: data.description || '',
          value: data.estimated_value || 0,
          institution: data.institution_name,
          account_number: data.account_number,
        }]);
      }

      setFormData({ name: '', description: '', value: '', institution: '', account_number: '' });
      setSelectedCategory(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await supabase.from('assets').delete().eq('id', assetId);
      setAssets(assets.filter(a => a.id !== assetId));
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const handleNext = async () => {
    if (assets.length === 0) {
      alert('Please add at least one asset');
      return;
    }

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
            current_section: 4,
            completion_percentage: 50,
          })
          .eq('id', existingWill.id);
      }

      router.push('/will/step4');
    } catch (error) {
      console.error('Error saving:', error);
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
    <div className="space-y-6 mb-24">
      {/* Category Grid */}
      {!showForm && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Select Asset Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {ASSET_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowForm(true);
                  }}
                  className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all text-left"
                >
                  <Icon className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-slate-900">{category.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Asset Form */}
      {showForm && selectedCategory && (
        <Card className="p-6 border-2 border-purple-200 bg-purple-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              Add {ASSET_CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setSelectedCategory(null);
                setFormData({ name: '', description: '', value: '', institution: '', account_number: '' });
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-700">Asset Name *</Label>
              <Input
                placeholder="e.g., Mumbai Apartment, HDFC Bank Account"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-slate-700">Description</Label>
              <Textarea
                placeholder="Additional details about this asset"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-700">Estimated Value (₹) *</Label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-slate-700">Institution/Bank Name</Label>
                <Input
                  placeholder="HDFC Bank, ICICI Life, etc."
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-700">Account/Reference Number</Label>
              <Input
                placeholder="Account or policy number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddAsset}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                Add Asset
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setSelectedCategory(null);
                  setFormData({ name: '', description: '', value: '', institution: '', account_number: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Assets List */}
      {assets.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Declared Assets ({assets.length})</h3>
          <div className="space-y-3">
            {assets.map((asset) => {
              const category = ASSET_CATEGORIES.find(c => c.id === asset.category);
              const Icon = category?.icon;

              return (
                <Card key={asset.id} className="p-4 border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {Icon && (
                        <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                          <Icon className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{asset.name}</h4>
                        <p className="text-sm text-slate-600">{category?.name}</p>
                        {asset.description && (
                          <p className="text-sm text-slate-600 mt-1">{asset.description}</p>
                        )}
                        <p className="text-sm font-medium text-purple-600 mt-2">
                          ₹{asset.value.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Total Value */}
          <Card className="p-4 mt-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total Asset Value</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ₹{assets.reduce((sum, a) => sum + a.value, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Add Another Button */}
      {!showForm && (
        <Button
          variant="outline"
          className="w-full border-2 border-dashed border-slate-300 hover:border-purple-600"
          onClick={() => {
            setShowForm(true);
            setSelectedCategory(null);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Asset
        </Button>
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
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              disabled={submitting || assets.length === 0}
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
    </div>
  );
}
