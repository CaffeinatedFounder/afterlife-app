'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = 'md',
      showCloseButton = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isMounted || !isOpen) return null;

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
    };

    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto flex items-end sm:items-center justify-center p-4">
          <div
            className={cn(
              'w-full bg-white rounded-2xl shadow-2xl transform transition-all duration-300 translate-y-full sm:translate-y-0 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-center',
              sizes[size],
              className
            )}
            ref={ref}
            {...props}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                {title && (
                  <h2 className="text-xl font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4">{children}</div>
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export interface ModalFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        'px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 justify-end',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalFooter };
