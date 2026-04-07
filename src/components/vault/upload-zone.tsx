'use client';

import { useCallback, useState } from 'react';
import { Cloud, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadZone({
  onFilesSelected,
  disabled = false,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSize = MAX_FILE_SIZE,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: FileList | null): File[] | null => {
      if (!files || files.length === 0) return null;

      const fileArray = Array.from(files);
      setError(null);

      // Check file types
      for (const file of fileArray) {
        if (!acceptedTypes.includes(file.type)) {
          setError(
            `Invalid file type: ${file.name}. Accepted types: PDF, JPG, PNG, DOC, DOCX`
          );
          return null;
        }

        // Check file size
        if (file.size > maxSize) {
          setError(
            `File too large: ${file.name}. Maximum size: 10MB`
          );
          return null;
        }
      }

      return fileArray;
    },
    [acceptedTypes, maxSize]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = validateFiles(e.dataTransfer.files);
      if (files) {
        onFilesSelected(files);
      }
    },
    [validateFiles, onFilesSelected]
  );

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = acceptedTypes.join(',');

    input.onchange = (e) => {
      const files = validateFiles((e.target as HTMLInputElement).files);
      if (files) {
        onFilesSelected(files);
      }
    };

    input.click();
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'w-full rounded-xl border-2 border-dashed px-6 py-12 transition-all',
          'flex flex-col items-center justify-center gap-4',
          disabled && 'opacity-50 cursor-not-allowed',
          isDragOver
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/10',
        )}
      >
        <Cloud
          className={cn(
            'h-12 w-12 transition-colors',
            isDragOver ? 'text-purple-600' : 'text-gray-400'
          )}
        />

        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isDragOver
              ? 'Drop documents here'
              : 'Drag & drop or click to upload'}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            PDF, JPG, PNG, DOC, DOCX up to 10MB
          </p>
        </div>
      </button>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
