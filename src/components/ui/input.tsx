'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            id={inputId}
            type={type}
            className={cn(
              'w-full px-4 py-2 border rounded-lg text-sm transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent',
              'placeholder:text-gray-400',
              icon && 'pl-10',
              error
                ? 'border-afterlife-error focus:ring-afterlife-error focus:border-afterlife-error'
                : 'border-gray-200 hover:border-gray-300',
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              className
            )}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-afterlife-error">{error}</p>
        )}

        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
