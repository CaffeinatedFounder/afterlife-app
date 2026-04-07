import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { VaultDocument } from '@/types';
import {
  ArrowLeft,
  Download,
  Trash2,
  Share2,
  Lock,
  Calendar,
  HardDrive,
  FileText,
  Image,
  File,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatFileSize } from '@/lib/utils';

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getDocument(userId: string, documentId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: document, error } = await supabase
    .from('vault_documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (error || !document) {
    return null;
  }

  return document as VaultDocument;
}

function getFileIcon(fileType: string) {
  if (fileType.includes('pdf')) {
    return FileText;
  } else if (
    fileType.includes('image') ||
    fileType.includes('jpeg') ||
    fileType.includes('png')
  ) {
    return Image;
  }
  return File;
}

const categoryLabels: Record<string, string> = {
  identity: 'Identity',
  financial: 'Financial',
  property: 'Property',
  insurance: 'Insurance',
  legal: 'Legal',
  medical: 'Medical',
  personal: 'Personal',
  other: 'Other',
};

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const supabase = await createServerSupabaseClient();

  // Get authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const document = await getDocument(authData.user.id, id);

  if (!document) {
    notFound();
  }

  const FileIcon = getFileIcon(document.file_type);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
      {/* Header */}
      <div className="sticky top-20 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/vault"
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {document.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {categoryLabels[document.category] || document.category}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              // Download logic would go here
              alert('Download feature coming soon');
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 px-4 py-2 font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={() => {
              alert('Share feature coming soon');
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 px-4 py-2 font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share with Beneficiary
          </button>
          <button
            onClick={() => {
              // Delete with confirmation
              if (confirm('Are you sure you want to delete this document?')) {
                // Delete logic would go here
                alert('Delete feature coming soon');
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 px-4 py-2 font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Preview Section */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 shadow-card">
              {document.file_type.includes('pdf') ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="h-16 w-16 text-purple-600 dark:text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    PDF Document
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    PDF preview will display here. Download to view full document.
                  </p>
                  <button
                    onClick={() => alert('Download feature coming soon')}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Download PDF
                  </button>
                </div>
              ) : document.file_type.includes('image') ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Image className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Image Document
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Image preview will display here. Download to view full image.
                  </p>
                  <button
                    onClick={() => alert('Download feature coming soon')}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Download Image
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <File className="h-16 w-16 text-gray-600 dark:text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Document
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    File preview unavailable. Download to view the document.
                  </p>
                  <button
                    onClick={() => alert('Download feature coming soon')}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Download Document
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-6">
            {/* Document Info Card */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-4">
                  <FileIcon className="h-8 w-8 text-purple-900 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    File Type
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {document.file_type.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="space-y-4">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Uploaded
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(document.created_at)}
                    </p>
                  </div>
                </div>

                {/* File Size */}
                <div className="flex items-start gap-3">
                  <HardDrive className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      File Size
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatFileSize(document.file_size)}
                    </p>
                  </div>
                </div>

                {/* Encryption Status */}
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Encryption
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {document.is_encrypted ? (
                        <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-300">
                          <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                          Encrypted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <span className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-400" />
                          Not Encrypted
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {document.description && (
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-card">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {document.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-card">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sharing */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-card">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Shared Access
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {document.shared_with && document.shared_with.length > 0
                  ? `Shared with ${document.shared_with.length} beneficiary(ies)`
                  : 'Not shared with anyone'}
              </p>
              <button
                onClick={() => alert('Share feature coming soon')}
                className="w-full rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 px-4 py-2 font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors"
              >
                <Share2 className="h-4 w-4 inline mr-2" />
                Share with Beneficiary
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
