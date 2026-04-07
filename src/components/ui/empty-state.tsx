'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      actionLabel,
      onAction,
      secondaryActionLabel,
      onSecondaryAction,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && (
          <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400">
            {icon}
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-600 mb-6 max-w-sm">
            {description}
          </p>
        )}

        {(actionLabel || secondaryActionLabel) && (
          <div className="flex gap-3 justify-center">
            {actionLabel && (
              <Button
                variant="primary"
                size="md"
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            )}

            {secondaryActionLabel && (
              <Button
                variant="secondary"
                size="md"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
