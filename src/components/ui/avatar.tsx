'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-cyan-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name = 'User', image, size = 'md', alt, className, ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    const initials = getInitials(name);
    const bgColor = getColorFromName(name);

    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full flex-shrink-0 font-semibold',
          sizes[size],
          image ? 'bg-gray-100' : `${bgColor} text-white`,
          className
        )}
        ref={ref}
        {...props}
      >
        {image ? (
          <img
            src={image}
            alt={alt || name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          initials
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
