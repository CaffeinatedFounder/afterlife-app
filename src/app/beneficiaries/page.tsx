import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { BeneficiaryCard } from '@/components/beneficiary/beneficiary-card';
import type { Beneficiary } from '@/types';

async function getBeneficiaries() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect('/auth/login');
  }

  // Fetch all beneficiaries for the user
  const { data: beneficiaries, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching beneficiaries:', error);
    return {
      beneficiaries: [],
      count: 0,
    };
  }

  return {
    beneficiaries: (beneficiaries || []) as Beneficiary[],
    count: beneficiaries?.length || 0,
  };
}

interface SearchParams {
  search?: string;
}

async function BeneficiariesPageContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { beneficiaries, count } = await getBeneficiaries();
  const params = await searchParams;
  const searchQuery = params.search?.toLowerCase() || '';

  // Filter beneficiaries based on search
  const filteredBeneficiaries = beneficiaries.filter((beneficiary) => {
    const matchesName = beneficiary.name.toLowerCase().includes(searchQuery);
    const matchesRelation = beneficiary.relation.toLowerCase().includes(searchQuery);
    return matchesName || matchesRelation;
  });

  return (
    <div className="px-4 py-6 space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beneficiaries</h1>
          <p className="text-gray-600 text-sm mt-1">{count} beneficiary{count !== 1 ? 'ies' : ''} added</p>
        </div>
        <a href="/beneficiaries/add">
          <Button
            variant="primary"
            size="md"
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add</span>
          </Button>
        </a>
      </div>

      {/* Search Bar */}
      {beneficiaries.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or relation..."
            defaultValue={searchQuery}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent"
          />
        </div>
      )}

      {/* Empty State */}
      {beneficiaries.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No beneficiaries added yet"
          description="Add beneficiaries to ensure your loved ones are properly documented in your will."
          actionLabel="Add First Beneficiary"
          onAction={() => {
            window.location.href = '/beneficiaries/add';
          }}
        />
      ) : filteredBeneficiaries.length === 0 ? (
        <EmptyState
          title="No results found"
          description="Try searching with a different name or relation."
        />
      ) : (
        /* Beneficiaries Grid */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBeneficiaries.map((beneficiary) => (
            <BeneficiaryCard key={beneficiary.id} beneficiary={beneficiary} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function BeneficiariesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <BeneficiariesPageContent searchParams={searchParams} />;
}

// Placeholder export for Users icon (should be imported from lucide-react)
import { Users } from 'lucide-react';
