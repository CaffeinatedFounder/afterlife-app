'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { UploadZone } from '@/components/vault/upload-zone';
import { DocumentCategory } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { generateEncryptionKey, encryptFile } from '@/lib/encryption';

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'identity', label: 'Identity (Passport, Aadhaar, PAN, etc.)' },
  { value: 'financial', label: 'Financial (Bank Statements, Tax Returns, etc.)' },
  { value: 'property', label: 'Property (Deeds, Mortgages, etc.)' },
  { value: 'insurance', label: 'Insurance (Policies, Coverage Details, etc.)' },
  { value: 'legal', label: 'Legal (Contracts, Agreements, Wills, etc.)' },
  { value: 'medical', label: 'Medical (Prescriptions, Records, Reports, etc.)' },
  { value: 'personal', label: 'Personal (Certificates, Memberships, etc.)' },
  { value: 'other', label: 'Other' },
];

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<DocumentCategory>('identity');
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [encryptDocument, setEncryptDocument] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    // Auto-fill document name if only one file
    if (selectedFiles.length === 1) {
      const fileName = selectedFiles[0].name.replace(/\.[^/.]+$/, '');
      setDocumentName(fileName);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!documentName.trim() || files.length === 0) {
      alert('Please enter a document name and select files');
      return;
    }

    setUploading(true);
    setProgress(
      files.map((file) => ({
        fileName: file.name,
        progress: 0,
        status: 'uploading' as const,
      }))
    );

    const supabase = createClient();

    try {
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('Not authenticated');
      }

      const userId = authData.user.id;
      const uploadResults = [];

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storagePath = `${userId}/${category}/${fileName}`;

        try {
          let fileData: ArrayBuffer | Blob = file;
          let displayName = documentName;

          // Encrypt if enabled
          if (encryptDocument) {
            const encKey = await generateEncryptionKey();
            const encrypted = await encryptFile(file, encKey);
            fileData = encrypted;
            // Store encryption key as metadata
          }

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('vault-documents')
            .upload(storagePath, fileData, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          // Create document record in database
          const { error: dbError } = await supabase
            .from('vault_documents')
            .insert({
              user_id: userId,
              name: displayName,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              category,
              storage_path: storagePath,
              is_encrypted: encryptDocument,
              description: description || null,
              tags: tags.length > 0 ? tags : null,
            });

          if (dbError) throw dbError;

          uploadResults.push({ fileName: file.name, success: true });
          setProgress((prev) =>
            prev.map((p) =>
              p.fileName === file.name
                ? { ...p, progress: 100, status: 'success' }
                : p
            )
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Upload failed';
          uploadResults.push({ fileName: file.name, success: false, error: errorMessage });
          setProgress((prev) =>
            prev.map((p) =>
              p.fileName === file.name
                ? { ...p, status: 'error', error: errorMessage }
                : p
            )
          );
        }
      }

      // Check if all uploads succeeded
      const allSuccess = uploadResults.every((r) => r.success);
      if (allSuccess) {
        setUploadComplete(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/vault');
        }, 2000);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      alert(`Upload error: ${errorMessage}`);
      setUploading(false);
    }
  };

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 px-4 py-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Upload Successful
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your documents have been securely stored in your vault.
          </p>
          <p className="text-sm text-gray-500">Redirecting to vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
      {/* Header with Back Button */}
      <div className="sticky top-20 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload Document
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add new documents to your secure vault
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-8">
          {/* Upload Zone */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload Documents
            </label>
            <UploadZone
              onFilesSelected={handleFilesSelected}
              disabled={uploading}
            />
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles(files.filter((_, i) => i !== idx))
                      }
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Document Name *
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., My Passport"
              disabled={uploading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              disabled={uploading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this document (optional)"
              disabled={uploading}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag and press Enter"
                disabled={uploading}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={uploading || !tagInput.trim()}
                className="rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-3 font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-sm font-medium text-purple-700 dark:text-purple-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Encryption Toggle */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={encryptDocument}
                onChange={(e) => setEncryptDocument(e.target.checked)}
                disabled={uploading}
                className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Encrypt this document
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {encryptDocument
                    ? 'Document will be encrypted with AES-256-GCM'
                    : 'Document will be stored unencrypted'}
                </p>
              </div>
            </label>
          </div>

          {/* Upload Progress */}
          {progress.length > 0 && (
            <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Upload Progress
              </h3>
              {progress.map((item) => (
                <div key={item.fileName}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.fileName}
                    </p>
                    {item.status === 'success' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {item.status === 'error' && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        Error
                      </span>
                    )}
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        item.status === 'success'
                          ? 'bg-green-500'
                          : item.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={uploading}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-3 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !documentName.trim() || files.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
