'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-semibold rounded-full transition-colors';

    const variants = {
      default: 'bg-gray-100 text-gray-700',
      success: 'bg-afterlife-success/10 text-afterlife-success',
      warning: 'bg-amber-100 text-amber-700',
      error: 'bg-afterlife-error/10 text-afterlife-error',
      info: 'bg-blue-100 text-blue-700',
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    };

    return (
      <span
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
