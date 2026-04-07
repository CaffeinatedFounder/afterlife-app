'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'w-full px-4 py-2 border rounded-lg text-sm transition-all duration-200 min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent',
            'placeholder:text-gray-400 resize-vertical',
            error
              ? 'border-afterlife-error focus:ring-afterlife-error focus:border-afterlife-error'
              : 'border-gray-200 hover:border-gray-300',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-afterlife-error">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
