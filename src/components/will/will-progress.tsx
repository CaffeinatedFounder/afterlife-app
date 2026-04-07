'use client';

import { CheckCircle2, Circle } from 'lucide-react';

interface WillProgressProps {
  currentStep: number;
}

const STEPS = [
  { number: 1, label: 'Personal' },
  { number: 2, label: 'Family' },
  { number: 3, label: 'Assets' },
  { number: 4, label: 'Assign' },
  { number: 5, label: 'Distribute' },
  { number: 6, label: 'Review' },
];

export function WillProgress({ currentStep }: WillProgressProps) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, idx) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Indicator */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold text-sm md:text-base transition-all ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ring-4 ring-purple-200'
                      : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span className="text-xs md:text-sm font-medium text-slate-600 mt-2 text-center whitespace-nowrap">
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {idx < STEPS.length - 1 && (
              <div
                className={`h-1 flex-1 mx-1 md:mx-2 transition-all ${
                  isCompleted ? 'bg-green-600' : isCurrent ? 'bg-purple-300' : 'bg-slate-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
