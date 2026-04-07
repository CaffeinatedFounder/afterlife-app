import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeneficiaryDetailContent } from '@/components/beneficiary/beneficiary-detail-content';
import type { Beneficiary } from '@/types';

async function getBeneficiary(id: string) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect('/auth/login');
  }

  // Fetch beneficiary
  const { data: beneficiary, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('id', id)
    .eq('user_id', authData.user.id)
    .single();

  if (error || !beneficiary) {
    notFound();
  }

  // Fetch related assets
  const { data: assetDistributions } = await supabase
    .from('asset_distributions')
    .select('*, assets(name, category, estimated_value, currency)')
    .eq('beneficiary_id', id);

  // Fetch related documents
  const { data: vaultDocuments } = await supabase
    .from('vault_documents')
    .select('*')
    .contains('shared_with', [id]);

  return {
    beneficiary: beneficiary as Beneficiary,
    assets: assetDistributions || [],
    documents: vaultDocuments || [],
  };
}

export default async function BeneficiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { beneficiary, assets, documents } = await getBeneficiary(id);

  return (
    <div className="px-4 py-6 pb-32">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <a href="/beneficiaries" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h1 className="text-2xl font-bold text-gray-900">{beneficiary.name}</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Beneficiary Detail Content */}
      <BeneficiaryDetailContent
        beneficiary={beneficiary}
        assets={assets}
        documents={documents}
      />
    </div>
  );
}
