'use client';

import { Toaster as Sonner, toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ToasterProps {
  richColors?: boolean;
  theme?: 'light' | 'dark' | 'system';
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const Toaster = ({
  richColors = true,
  theme = 'light',
  position = 'bottom-right',
}: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      position={position}
      richColors={richColors}
      toastOptions={{
        classNames: {
          toast: cn(
            'rounded-lg shadow-lg border border-gray-200',
            'data-[type=success]:bg-white data-[type=success]:text-gray-900',
            'data-[type=error]:bg-white data-[type=error]:text-gray-900',
            'data-[type=loading]:bg-white data-[type=loading]:text-gray-900',
            'data-[type=default]:bg-white data-[type=default]:text-gray-900'
          ),
          title: 'font-semibold text-sm',
          description: 'text-xs text-gray-600 mt-1',
          success: 'border-afterlife-success/20',
          error: 'border-afterlife-error/20',
          actionButton: cn(
            'bg-gradient-to-r from-brand-primary to-brand-secondary text-white',
            'rounded-md px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity'
          ),
          closeButton: cn(
            'text-gray-400 hover:text-gray-600 transition-colors',
            'rounded-md p-1'
          ),
        },
      }}
    />
  );
};

export { toast };
