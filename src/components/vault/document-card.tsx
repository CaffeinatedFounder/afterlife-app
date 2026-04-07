'use client';

import { VaultDocument } from '@/types';
import Link from 'next/link';
import {
  FileText,
  Image,
  File,
  Lock,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { formatDate, formatFileSize, cn } from '@/lib/utils';
import { useState } from 'react';

interface DocumentCardProps {
  document: VaultDocument;
  onDelete?: (id: string) => void;
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

function getCategoryColor(
  category: string
): 'purple' | 'blue' | 'green' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'gray' {
  const colors: Record<
    string,
    'purple' | 'blue' | 'green' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'gray'
  > = {
    identity: 'purple',
    financial: 'blue',
    property: 'green',
    insurance: 'amber',
    legal: 'rose',
    medical: 'indigo',
    personal: 'cyan',
    other: 'gray',
  };
  return colors[category] || 'gray';
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

const colorClasses: Record<string, { bg: string; text: string }> = {
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
  gray: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300' },
};

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const FileIcon = getFileIcon(document.file_type);
  const categoryColor = getCategoryColor(document.category);
  const colors = colorClasses[categoryColor];

  return (
    <Link href={`/vault/${document.id}`}>
      <div
        className={cn(
          'group relative rounded-xl border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-800 shadow-card hover:shadow-card-hover',
          'p-4 transition-all duration-200 cursor-pointer',
          'hover:border-purple-300 dark:hover:border-purple-600'
        )}
      >
        {/* File Icon Container */}
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-3">
            <FileIcon className="h-6 w-6 text-purple-900 dark:text-purple-300" />
          </div>

          {/* Encrypted Badge */}
          {document.is_encrypted && (
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
              <Lock className="h-4 w-4 text-green-700 dark:text-green-300" />
            </div>
          )}
        </div>

        {/* Document Name */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-2 text-sm line-clamp-2">
          {document.name}
        </h3>

        {/* Category Badge */}
        <div className="mb-3 inline-block">
          <span
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full',
              colors.bg,
              colors.text
            )}
          >
            {categoryLabels[document.category] || document.category}
          </span>
        </div>

        {/* Metadata */}
        <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{formatDate(document.created_at)}</span>
            <span className="font-medium">{formatFileSize(document.file_size)}</span>
          </div>
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 rounded-xl bg-black/5 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Delete will be handled by parent
              onDelete?.(document.id);
            }}
            className="rounded-lg bg-red-500/90 p-2 text-white hover:bg-red-600 transition-colors"
            title="Delete document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
