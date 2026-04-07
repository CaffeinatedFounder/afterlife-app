'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// --- SelectValue ---
interface SelectValueProps {
  placeholder?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return <>{placeholder}</>;
};
SelectValue.displayName = 'SelectValue';

// --- SelectItem ---
interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <option ref={ref} {...props}>
        {children}
      </option>
    );
  }
);
SelectItem.displayName = 'SelectItem';

// --- SelectTrigger ---
interface SelectTriggerProps {
  className?: string;
  children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children }, ref) => {
    return <div ref={ref} className={className}>{children}</div>;
  }
);
SelectTrigger.displayName = 'SelectTrigger';

// --- SelectContent ---
interface SelectContentProps {
  children: React.ReactNode;
}

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  return <>{children}</>;
};
SelectContent.displayName = 'SelectContent';

// --- Select (main) ---
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  defaultValue?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ value, onValueChange, children, defaultValue }, ref) => {
    // Extract SelectItem children from the nested structure
    const items: React.ReactElement[] = [];
    let placeholder = '';

    const extractChildren = (node: React.ReactNode): void => {
      React.Children.forEach(node, (child) => {
        if (!React.isValidElement(child)) return;
        if (child.type === SelectItem) {
          items.push(child);
        } else if (child.type === SelectValue) {
          placeholder = (child.props as SelectValueProps).placeholder || '';
        } else if (child.props && (child.props as { children?: React.ReactNode }).children) {
          extractChildren((child.props as { children?: React.ReactNode }).children);
        }
      });
    };

    extractChildren(children);

    return (
      <select
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          'w-full px-4 py-2 border rounded-lg text-sm transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent',
          'border-gray-200 hover:border-gray-300 bg-white'
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {items.map((item, i) => (
          <option key={i} value={(item.props as SelectItemProps).value as string}>
            {(item.props as SelectItemProps).children}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
