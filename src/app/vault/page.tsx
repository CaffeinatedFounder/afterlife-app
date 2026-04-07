import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { VaultDocument, DocumentCategory } from '@/types';
import { DocumentCard } from '@/components/vault/document-card';
import { Search, Plus, Database } from 'lucide-react';

async function getVaultData(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: documents, error: documentsError } = await supabase
    .from('vault_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (documentsError) {
    console.error('Error fetching documents:', documentsError);
    return { documents: [], totalSize: 0 };
  }

  // Calculate total storage usage
  const totalSize = (documents || []).reduce(
    (sum, doc) => sum + (doc.file_size || 0),
    0
  );

  return {
    documents: (documents || []) as VaultDocument[],
    totalSize,
  };
}

interface VaultPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export default async function VaultPage({ searchParams }: VaultPageProps) {
  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect('/auth/login');
  }

  const params = await searchParams;
  const selectedCategory = (params.category || 'all') as string;
  const searchQuery = (params.search || '').toLowerCase();

  const { documents, totalSize } = await getVaultData(authData.user.id);

  // Filter documents
  let filteredDocuments = documents;

  if (selectedCategory !== 'all') {
    filteredDocuments = documents.filter(
      (doc) => doc.category === selectedCategory
    );
  }

  if (searchQuery) {
    filteredDocuments = filteredDocuments.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchQuery) ||
        doc.description?.toLowerCase().includes(searchQuery) ||
        doc.tags?.some((tag) => tag.toLowerCase().includes(searchQuery))
    );
  }

  const categories: { value: DocumentCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Documents' },
    { value: 'identity', label: 'Identity' },
    { value: 'financial', label: 'Financial' },
    { value: 'property', label: 'Property' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'legal', label: 'Legal' },
    { value: 'medical', label: 'Medical' },
    { value: 'personal', label: 'Personal' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
      {/* Header Section */}
      <div className="sticky top-20 z-40 bg-gradient-to-b from-white to-white/80 dark:from-gray-800 dark:to-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Digital Vault
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Securely store your important documents
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Documents
              </p>
              <p className="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-300">
                {documents.length}
              </p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Storage Used
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-300">
                {formatStorageSize(totalSize)}
              </p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Encrypted
              </p>
              <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-300">
                {documents.filter((d) => d.is_encrypted).length}
              </p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Categories
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-300">
                {new Set(documents.map((d) => d.category)).size}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form action="/vault" method="get" className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search documents by name, description or tags..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </form>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 -mb-4 scrollbar-hide">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <a
                  key={cat.value}
                  href={`/vault?category=${cat.value}${searchQuery ? `&search=${searchQuery}` : ''}`}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  {cat.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-16 px-6 text-center">
            <Database className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {documents.length === 0
                ? 'No documents yet'
                : 'No documents found'}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {documents.length === 0
                ? 'Start by uploading your first important document to secure your digital legacy.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {documents.length === 0 && (
              <a
                href="/vault/upload"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white hover:shadow-lg transition-shadow"
              >
                <Plus className="h-5 w-5" />
                Upload Document
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={(id) => {
                  // Delete will be handled server-side via client component
                }}
              />
            ))}
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>

      {/* Floating Action Button */}
      {documents.length > 0 && (
        <a
          href="/vault/upload"
          className="fixed bottom-32 right-6 md:bottom-8 md:right-8 rounded-full bg-gradient-to-br from-purple-600 via-purple-600 to-blue-600 p-4 text-white shadow-lg hover:shadow-xl transition-shadow"
          title="Upload Document"
        >
          <Plus className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}

function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
