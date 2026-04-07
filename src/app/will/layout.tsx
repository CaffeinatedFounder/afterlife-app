'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WillProgress } from '@/components/will/will-progress';
import { ArrowLeft, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const STEP_INFO = {
  1: {
    title: 'Personal Information',
    description: 'Tell us about yourself',
  },
  2: {
    title: 'Family Details',
    description: 'Add your family members',
  },
  3: {
    title: 'Asset Declaration',
    description: 'List all your assets',
  },
  4: {
    title: 'Beneficiary Assignment',
    description: 'Assign assets to beneficiaries',
  },
  5: {
    title: 'Distribution Details',
    description: 'Set allocation percentages',
  },
  6: {
    title: 'Review & Instructions',
    description: 'Final review and signing',
  },
};

export default function WillLayout({ children }: LayoutProps) {
  const pathname = usePathname();

  // Extract step number from pathname
  const stepMatch = pathname.match(/\/will\/step(\d+)/);
  const currentStep = stepMatch ? parseInt(stepMatch[1]) : 0;

  const stepInfo = currentStep > 0 && currentStep <= 6
    ? STEP_INFO[currentStep as keyof typeof STEP_INFO]
    : null;

  const isStepPage = currentStep > 0 && currentStep <= 6;

  // Calculate progress percentage
  const progressPercentage = isStepPage ? (currentStep / 6) * 100 : 0;

  if (!isStepPage) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Navigation */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/will" className="text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep} of 6
            </span>
            <Link href="/will" className="text-slate-600 hover:text-slate-900 transition-colors">
              <X className="w-6 h-6" />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-200 h-1 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <WillProgress currentStep={currentStep} />
      </div>

      {/* Section Header */}
      {stepInfo && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {stepInfo.title}
          </h1>
          <p className="text-slate-600">{stepInfo.description}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        {children}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Link href={`/will/step${currentStep - 1}`}>
                <Button variant="outline">Back</Button>
              </Link>
            )}
            {currentStep === 1 && (
              <Link href="/will">
                <Button variant="outline">Cancel</Button>
              </Link>
            )}
          </div>

          <div className="flex-1 flex justify-center">
            <Button variant="ghost" className="text-slate-600">
              Save & Exit
            </Button>
          </div>

          <div>
            {currentStep < 6 && (
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                disabled
              >
                Next
              </Button>
            )}
            {currentStep === 6 && (
              <Button
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                disabled
              >
                Generate Will
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
