'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  searchable?: boolean;
  icon?: React.ReactNode;
}

const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  (
    {
      label,
      placeholder = 'Select an option',
      options,
      value,
      onValueChange,
      error,
      helperText,
      searchable = false,
      icon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedValue, setSelectedValue] = React.useState(value || '');
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const inputId =
      props.id ||
      `dropdown-${Math.random().toString(36).substr(2, 9)}`;

    const filteredOptions = React.useMemo(() => {
      if (!searchable || !searchQuery) return options;
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery, searchable]);

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
          document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      onValueChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    };

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

        <div className="relative" ref={dropdownRef}>
          {/* Hidden select for form submission */}
          <select
            ref={ref}
            value={selectedValue}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedValue(value);
              onValueChange?.(value);
            }}
            className="sr-only"
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Dropdown Button */}
          <button
            id={inputId}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2 text-left border rounded-lg text-sm transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent',
              'flex items-center justify-between',
              error
                ? 'border-afterlife-error focus:ring-afterlife-error focus:border-afterlife-error'
                : 'border-gray-200 hover:border-gray-300',
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              isOpen && 'ring-2 ring-brand-accent',
              className
            )}
          >
            <span className="flex items-center gap-2">
              {icon && <span className="flex-shrink-0">{icon}</span>}
              <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                {selectedOption?.label || placeholder}
              </span>
            </span>
            <svg
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg">
              {searchable && (
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-full px-4 py-2 border-b border-gray-200 text-sm',
                    'focus:outline-none focus:ring-0 placeholder:text-gray-400'
                  )}
                  autoFocus
                />
              )}

              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500 text-center">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm transition-colors',
                        'flex items-center gap-2',
                        selectedValue === option.value
                          ? 'bg-brand-accent/10 text-brand-secondary font-medium'
                          : 'text-gray-700 hover:bg-gray-50',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                      {option.label}
                    </button>
                  ))
                )}
              </div>
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

Dropdown.displayName = 'Dropdown';

export { Dropdown };
