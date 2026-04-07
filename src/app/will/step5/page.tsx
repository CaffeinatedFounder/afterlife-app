'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  value: number;
}

interface Beneficiary {
  id: string;
  name: string;
  relation: string;
}

interface AllocationData {
  asset_id: string;
  beneficiary_id: string;
  allocation_type: 'percentage' | 'units' | 'specific_gift';
  value: number | string;
}

interface SpecialGift {
  beneficiary_id: string;
  beneficiary_name: string;
  gift_description: string;
  notes: string;
}

export default function Step5Page() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [allocations, setAllocations] = useState<AllocationData[]>([]);
  const [specialGifts, setSpecialGifts] = useState<SpecialGift[]>([]);
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [newGift, setNewGift] = useState({
    beneficiary_id: '',
    gift_description: '',
    notes: '',
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

        // Load assets
        const { data: assetsData } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', session.user.id);

        if (assetsData) {
          setAssets(assetsData.map((a: any) => ({
            id: a.id,
            name: a.name,
            value: a.estimated_value || 0,
          })));
        }

        // Load beneficiaries
        const { data: benefData } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('user_id', session.user.id);

        if (benefData) {
          setBeneficiaries(benefData.map((b: any) => ({
            id: b.id,
            name: b.name,
            relation: b.relation || '',
          })));
        }

        // Load asset distributions with beneficiaries
        const { data: distData } = await supabase
          .from('asset_distributions')
          .select('asset_id, beneficiary_id')
          .eq('user_id', session.user.id);

        if (distData) {
          // Initialize allocations for each asset-beneficiary pair
          const initialAllocations: AllocationData[] = distData.map((d: any) => ({
            asset_id: d.asset_id,
            beneficiary_id: d.beneficiary_id,
            allocation_type: 'percentage',
            value: 0,
          }));
          setAllocations(initialAllocations);
        }

        // Load special gifts if any
        const { data: giftsData } = await supabase
          .from('special_gifts')
          .select('*')
          .eq('user_id', session.user.id);

        if (giftsData) {
          setSpecialGifts(giftsData.map((g: any) => ({
            beneficiary_id: g.beneficiary_id,
            beneficiary_name: benefData?.find((b: any) => b.id === g.beneficiary_id)?.name || '',
            gift_description: g.gift_description,
            notes: g.notes || '',
          })));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  const handleAllocationChange = (
    assetId: string,
    beneficiaryId: string,
    field: string,
    value: any
  ) => {
    const updated = allocations.map((alloc) => {
      if (alloc.asset_id === assetId && alloc.beneficiary_id === beneficiaryId) {
        return { ...alloc, [field]: value };
      }
      return alloc;
    });
    setAllocations(updated);
  };

  const calculateAssetPercentages = (assetId: string) => {
    const assetAllocations = allocations.filter((a) => a.asset_id === assetId && a.allocation_type === 'percentage');
    const total = assetAllocations.reduce((sum, a) => sum + (typeof a.value === 'number' ? a.value : 0), 0);
    return total;
  };

  const isValidDistribution = () => {
    // Check all assets with percentage allocations sum to 100
    const uniqueAssets = [...new Set(allocations.map((a) => a.asset_id))];

    for (const assetId of uniqueAssets) {
      const assetAllocations = allocations.filter(
        (a) => a.asset_id === assetId && a.allocation_type === 'percentage'
      );

      if (assetAllocations.length > 0) {
        const total = assetAllocations.reduce((sum, a) => sum + (typeof a.value === 'number' ? a.value : 0), 0);
        if (total !== 100) {
          return false;
        }
      }
    }

    return true;
  };

  const handleAddGift = async () => {
    if (!newGift.beneficiary_id || !newGift.gift_description) {
      alert('Please fill in required fields');
      return;
    }

    const benef = beneficiaries.find((b) => b.id === newGift.beneficiary_id);

    setSpecialGifts([
      ...specialGifts,
      {
        beneficiary_id: newGift.beneficiary_id,
        beneficiary_name: benef?.name || '',
        gift_description: newGift.gift_description,
        notes: newGift.notes,
      },
    ]);

    setNewGift({ beneficiary_id: '', gift_description: '', notes: '' });
    setShowGiftForm(false);
  };

  const handleNext = async () => {
    if (!isValidDistribution()) {
      alert('All asset percentages must total 100%');
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('No session');

      // Save allocations
      for (const alloc of allocations) {
        await supabase.from('allocations').upsert({
          user_id: session.user.id,
          asset_id: alloc.asset_id,
          beneficiary_id: alloc.beneficiary_id,
          allocation_type: alloc.allocation_type,
          value: alloc.value,
        });
      }

      // Save special gifts
      for (const gift of specialGifts) {
        await supabase.from('special_gifts').upsert({
          user_id: session.user.id,
          beneficiary_id: gift.beneficiary_id,
          gift_description: gift.gift_description,
          notes: gift.notes,
        });
      }

      const { data: existingWill } = await supabase
        .from('digital_wills')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (existingWill) {
        await supabase
          .from('digital_wills')
          .update({
            current_section: 6,
            completion_percentage: 83,
          })
          .eq('id', existingWill.id);
      }

      router.push('/will/step6');
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
      {/* Allocations by Asset */}
      <div className="space-y-6">
        {assets.map((asset) => {
          const assetAllocations = allocations.filter((a) => a.asset_id === asset.id);
          const percentageTotal = calculateAssetPercentages(asset.id);
          const isBalanced = percentageTotal === 100 || assetAllocations.length === 0;

          return (
            <Card key={asset.id} className={`p-6 border-2 ${
              isBalanced
                ? 'border-slate-200 bg-white'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{asset.name}</h3>
                  <div className="flex items-center gap-2">
                    {isBalanced && assetAllocations.length > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : assetAllocations.length > 0 ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-slate-600">₹{asset.value.toLocaleString('en-IN')}</p>
              </div>

              <div className="space-y-4">
                {assetAllocations.map((alloc) => {
                  const benef = beneficiaries.find((b) => b.id === alloc.beneficiary_id);

                  return (
                    <div
                      key={`${alloc.asset_id}-${alloc.beneficiary_id}`}
                      className="p-4 border border-slate-200 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50"
                    >
                      <div className="mb-3">
                        <p className="font-medium text-slate-900">{benef?.name}</p>
                        <p className="text-xs text-slate-600">{benef?.relation}</p>
                      </div>

                      <div className="space-y-3">
                        {/* Allocation Type Selection */}
                        <div className="grid grid-cols-3 gap-2">
                          {(['percentage', 'units', 'specific_gift'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() =>
                                handleAllocationChange(
                                  asset.id,
                                  alloc.beneficiary_id,
                                  'allocation_type',
                                  type
                                )
                              }
                              className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all ${
                                alloc.allocation_type === type
                                  ? 'border-purple-600 bg-white text-purple-600'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {type === 'percentage' && '%'}
                              {type === 'units' && 'Units'}
                              {type === 'specific_gift' && 'Gift'}
                            </button>
                          ))}
                        </div>

                        {/* Input Field */}
                        {alloc.allocation_type === 'percentage' && (
                          <div>
                            <Label className="text-xs text-slate-700">
                              Percentage of Asset
                            </Label>
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={typeof alloc.value === 'number' ? alloc.value : 0}
                                onChange={(e) =>
                                  handleAllocationChange(
                                    asset.id,
                                    alloc.beneficiary_id,
                                    'value',
                                    parseInt(e.target.value)
                                  )
                                }
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={typeof alloc.value === 'number' ? alloc.value : 0}
                                onChange={(e) =>
                                  handleAllocationChange(
                                    asset.id,
                                    alloc.beneficiary_id,
                                    'value',
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-16 text-center"
                              />
                              <span className="text-sm font-medium text-slate-700">%</span>
                            </div>
                          </div>
                        )}

                        {alloc.allocation_type === 'units' && (
                          <div>
                            <Label className="text-xs text-slate-700">Number of Units</Label>
                            <Input
                              type="number"
                              value={typeof alloc.value === 'number' ? alloc.value : ''}
                              onChange={(e) =>
                                handleAllocationChange(
                                  asset.id,
                                  alloc.beneficiary_id,
                                  'value',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="mt-2"
                              placeholder="0"
                            />
                          </div>
                        )}

                        {alloc.allocation_type === 'specific_gift' && (
                          <div>
                            <Label className="text-xs text-slate-700">Gift Description</Label>
                            <Textarea
                              value={typeof alloc.value === 'string' ? alloc.value : ''}
                              onChange={(e) =>
                                handleAllocationChange(
                                  asset.id,
                                  alloc.beneficiary_id,
                                  'value',
                                  e.target.value
                                )
                              }
                              placeholder="Describe the specific gift..."
                              className="mt-2"
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Percentage Total */}
              {allocations.filter((a) => a.asset_id === asset.id && a.allocation_type === 'percentage').length > 0 && (
                <div className="mt-4 p-3 bg-white rounded-lg border-2 border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Percentage Total</span>
                    <span className={`text-lg font-bold ${
                      percentageTotal === 100
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {percentageTotal}%
                    </span>
                  </div>
                  {!isBalanced && (
                    <p className="text-xs text-red-600 mt-2">
                      Total must equal 100% to continue
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Special Gifts Section */}
      <Card className="p-6 border-2 border-blue-200 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Special Gifts & Bequests</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGiftForm(!showGiftForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Gift
          </Button>
        </div>

        {/* Add Gift Form */}
        {showGiftForm && (
          <div className="p-4 bg-white rounded-lg border border-slate-200 mb-4">
            <div className="space-y-3">
              <div>
                <Label className="text-slate-700">Beneficiary *</Label>
                <select
                  value={newGift.beneficiary_id}
                  onChange={(e) => setNewGift({ ...newGift, beneficiary_id: e.target.value })}
                  className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">Select beneficiary</option>
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.relation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-slate-700">Gift Description *</Label>
                <Textarea
                  placeholder="Describe the gift or bequest..."
                  value={newGift.gift_description}
                  onChange={(e) =>
                    setNewGift({ ...newGift, gift_description: e.target.value })
                  }
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-slate-700">Additional Notes</Label>
                <Textarea
                  placeholder="Any conditions or special instructions..."
                  value={newGift.notes}
                  onChange={(e) => setNewGift({ ...newGift, notes: e.target.value })}
                  className="mt-2"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddGift}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  Add Gift
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGiftForm(false);
                    setNewGift({ beneficiary_id: '', gift_description: '', notes: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Gifts List */}
        {specialGifts.length > 0 ? (
          <div className="space-y-2">
            {specialGifts.map((gift, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{gift.beneficiary_name}</p>
                    <p className="text-sm text-slate-600">{gift.gift_description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSpecialGifts(specialGifts.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {gift.notes && (
                  <p className="text-xs text-slate-600 italic">{gift.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 text-sm">No special gifts added</p>
        )}
      </Card>

      {/* Distribution Summary */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h3 className="font-semibold text-slate-900 mb-4">Distribution Summary</h3>
        <div className="space-y-3 text-sm">
          {allocations.map((alloc) => {
            const asset = assets.find((a) => a.id === alloc.asset_id);
            const benef = beneficiaries.find((b) => b.id === alloc.beneficiary_id);

            return (
              <div key={`${alloc.asset_id}-${alloc.beneficiary_id}`} className="p-2 bg-white/50 rounded flex items-center justify-between">
                <span className="text-slate-700">
                  {benef?.name} receives {asset?.name}
                </span>
                <span className="font-medium text-slate-900">
                  {alloc.allocation_type === 'percentage' && `${alloc.value}%`}
                  {alloc.allocation_type === 'units' && `${alloc.value} units`}
                  {alloc.allocation_type === 'specific_gift' && 'Special gift'}
                </span>
              </div>
            );
          })}
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
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              disabled={submitting || !isValidDistribution()}
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
