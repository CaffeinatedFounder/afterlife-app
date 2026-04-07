'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'bg-white rounded-2xl overflow-hidden';

    const variants = {
      default: 'shadow-sm border border-gray-100',
      elevated: 'shadow-lg border border-gray-200',
      interactive:
        'shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-lg hover:border-brand-accent/20 cursor-pointer',
    };

    return (
      <div
        className={cn(baseStyles, variants[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn('px-6 py-4 border-b border-gray-100', className)}
      ref={ref}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn('px-6 py-4', className)}
      ref={ref}
      {...props}
    />
  )
);

CardBody.displayName = 'CardBody';

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        'px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-2',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
