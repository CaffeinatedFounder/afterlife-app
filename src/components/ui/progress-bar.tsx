'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  animated?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      showLabel = false,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        <div className="flex items-center justify-between mb-2">
          {showLabel && (
            <span className="text-sm font-medium text-gray-700">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500',
              animated && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export interface SteppedProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const SteppedProgress = React.forwardRef<HTMLDivElement, SteppedProgressProps>(
  (
    { currentStep, totalSteps, stepLabels, className, ...props },
    ref
  ) => {
    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 relative z-10 ring-4 ring-white',
                    isCompleted &&
                      'bg-gradient-to-r from-brand-primary to-brand-secondary text-white',
                    isActive &&
                      'bg-gradient-to-r from-brand-primary to-brand-secondary text-white ring-brand-accent',
                    !isCompleted &&
                      !isActive &&
                      'bg-gray-200 text-gray-600'
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Label */}
                {stepLabels && stepLabels[index] && (
                  <div className="text-center mt-2">
                    <p className="text-xs font-medium text-gray-600">
                      {stepLabels[index]}
                    </p>
                  </div>
                )}

                {/* Connector Line */}
                {index < totalSteps - 1 && (
                  <div
                    className={cn(
                      'absolute top-5 left-1/2 w-full h-1 -z-0',
                      isCompleted || isActive
                        ? 'bg-gradient-to-r from-brand-primary to-brand-secondary'
                        : 'bg-gray-200'
                    )}
                    style={{
                      width: `calc(100% - 2.5rem)`,
                      left: `calc(50% + 1.25rem)`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

SteppedProgress.displayName = 'SteppedProgress';

export { ProgressBar, SteppedProgress };
