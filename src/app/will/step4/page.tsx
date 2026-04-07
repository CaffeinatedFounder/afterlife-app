'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Plus, X, Loader2, User, Trash2 } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: string;
  value: number;
}

interface Beneficiary {
  id: string;
  name: string;
  relation: string;
}

interface AssetBeneficiary {
  asset_id: string;
  beneficiaries: string[]; // beneficiary IDs
}

export default function Step4Page() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [assetBeneficiaries, setAssetBeneficiaries] = useState<AssetBeneficiary[]>([]);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState({ name: '', relation: '' });
  const [selectedAssetForBenef, setSelectedAssetForBenef] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        // Load assets
        const { data: assetsData } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (assetsData) {
          setAssets(assetsData.map((a: any) => ({
            id: a.id,
            name: a.name,
            category: a.category,
            value: a.estimated_value || 0,
          })));
        }

        // Load beneficiaries
        const { data: benefData } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (benefData) {
          setBeneficiaries(benefData.map((b: any) => ({
            id: b.id,
            name: b.name,
            relation: b.relation || '',
          })));
        }

        // Load asset-beneficiary mappings
        const { data: mappingsData } = await supabase
          .from('asset_distributions')
          .select('*')
          .eq('user_id', session.user.id);

        if (mappingsData) {
          const mappings: { [key: string]: string[] } = {};
          mappingsData.forEach((m: any) => {
            if (!mappings[m.asset_id]) {
              mappings[m.asset_id] = [];
            }
            mappings[m.asset_id].push(m.beneficiary_id);
          });

          setAssetBeneficiaries(
            Object.entries(mappings).map(([asset_id, beneficiaries]) => ({
              asset_id,
              beneficiaries,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const handleAddBeneficiary = async () => {
    if (!newBeneficiary.name) {
      alert('Please enter beneficiary name');
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('No session');

      const { data } = await supabase
        .from('beneficiaries')
        .insert({
          user_id: session.user.id,
          name: newBeneficiary.name,
          relation: newBeneficiary.relation,
        })
        .select()
        .single();

      if (data) {
        setBeneficiaries([...beneficiaries, {
          id: data.id,
          name: data.name,
          relation: data.relation || '',
        }]);
      }

      setNewBeneficiary({ name: '', relation: '' });
      setShowAddBeneficiary(false);
    } catch (error) {
      console.error('Error adding beneficiary:', error);
    }
  };

  const handleAssignBeneficiary = async (assetId: string, beneficiaryId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('No session');

      // Check if already assigned
      const existing = assetBeneficiaries.find(ab => ab.asset_id === assetId);
      if (existing?.beneficiaries.includes(beneficiaryId)) {
        return;
      }

      await supabase.from('asset_distributions').insert({
        user_id: session.user.id,
        asset_id: assetId,
        beneficiary_id: beneficiaryId,
      });

      // Update local state
      const existing_mapping = assetBeneficiaries.find(ab => ab.asset_id === assetId);
      if (existing_mapping) {
        existing_mapping.beneficiaries.push(beneficiaryId);
        setAssetBeneficiaries([...assetBeneficiaries]);
      } else {
        setAssetBeneficiaries([...assetBeneficiaries, {
          asset_id: assetId,
          beneficiaries: [beneficiaryId],
        }]);
      }
    } catch (error) {
      console.error('Error assigning beneficiary:', error);
    }
  };

  const handleRemoveBeneficiary = async (assetId: string, beneficiaryId: string) => {
    try {
      await supabase
        .from('asset_distributions')
        .delete()
        .eq('asset_id', assetId)
        .eq('beneficiary_id', beneficiaryId);

      const updated = assetBeneficiaries.map(ab => {
        if (ab.asset_id === assetId) {
          return {
            ...ab,
            beneficiaries: ab.beneficiaries.filter(id => id !== beneficiaryId),
          };
        }
        return ab;
      });

      setAssetBeneficiaries(updated);
    } catch (error) {
      console.error('Error removing beneficiary:', error);
    }
  };

  const handleNext = async () => {
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
            current_section: 5,
            completion_percentage: 67,
          })
          .eq('id', existingWill.id);
      }

      router.push('/will/step5');
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
      {/* Beneficiaries Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Beneficiaries</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddBeneficiary(!showAddBeneficiary)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Beneficiary
          </Button>
        </div>

        {/* Add Beneficiary Form */}
        {showAddBeneficiary && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-4">
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700">Name *</Label>
                <Input
                  placeholder="Beneficiary name"
                  value={newBeneficiary.name}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-slate-700">Relation</Label>
                <Input
                  placeholder="Son, Daughter, Spouse, etc."
                  value={newBeneficiary.relation}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, relation: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddBeneficiary}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddBeneficiary(false);
                    setNewBeneficiary({ name: '', relation: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Beneficiaries List */}
        {beneficiaries.length > 0 ? (
          <div className="space-y-2">
            {beneficiaries.map((beneficiary) => (
              <div
                key={beneficiary.id}
                className="p-3 border border-slate-200 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{beneficiary.name}</p>
                    <p className="text-sm text-slate-600">{beneficiary.relation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 text-sm">No beneficiaries added yet</p>
        )}
      </Card>

      {/* Assets & Assignment */}
      {assets.length > 0 && beneficiaries.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Assign Beneficiaries to Assets</h3>

          <div className="space-y-6">
            {assets.map((asset) => {
              const assignedBeneficiaries = assetBeneficiaries
                .find(ab => ab.asset_id === asset.id)
                ?.beneficiaries || [];

              const unassignedBeneficiaries = beneficiaries.filter(
                b => !assignedBeneficiaries.includes(b.id)
              );

              return (
                <div key={asset.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-900">{asset.name}</h4>
                    <p className="text-sm text-slate-600">₹{asset.value.toLocaleString('en-IN')}</p>
                  </div>

                  {/* Assigned Beneficiaries */}
                  {assignedBeneficiaries.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-slate-600 mb-2">Assigned To</p>
                      <div className="space-y-2">
                        {assignedBeneficiaries.map((benefId) => {
                          const benef = beneficiaries.find(b => b.id === benefId);
                          return (
                            <div
                              key={benefId}
                              className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                            >
                              <span className="text-sm font-medium text-slate-900">{benef?.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBeneficiary(asset.id, benefId)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Unassigned Beneficiaries */}
                  {unassignedBeneficiaries.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">Add Beneficiary</p>
                      <div className="flex flex-wrap gap-2">
                        {unassignedBeneficiaries.map((benef) => (
                          <Button
                            key={benef.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignBeneficiary(asset.id, benef.id)}
                            className="text-slate-600 hover:bg-purple-50 hover:border-purple-600"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {benef.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Summary */}
      {assetBeneficiaries.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <h3 className="font-semibold text-slate-900 mb-4">Assignment Summary</h3>
          <div className="space-y-2 text-sm">
            {assetBeneficiaries.map((ab) => {
              const asset = assets.find(a => a.id === ab.asset_id);
              const benefNames = ab.beneficiaries
                .map(bid => beneficiaries.find(b => b.id === bid)?.name)
                .filter(Boolean)
                .join(', ');

              return (
                <div key={ab.asset_id} className="flex items-center justify-between p-2 bg-white/50 rounded">
                  <span className="text-slate-700">{asset?.name}</span>
                  <span className="font-medium text-slate-900">{benefNames}</span>
                </div>
              );
            })}
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
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              disabled={submitting || assetBeneficiaries.length === 0}
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
