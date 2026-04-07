'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Shield, FileText, MessageSquare, Menu } from 'lucide-react';

const TABS = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Home',
    matchPaths: ['/dashboard'],
  },
  {
    href: '/vault',
    icon: Shield,
    label: 'Vault',
    matchPaths: ['/vault'],
  },
  {
    href: '/will',
    icon: FileText,
    label: 'Will',
    matchPaths: ['/will'],
  },
  {
    href: '/messages',
    icon: MessageSquare,
    label: 'Messages',
    matchPaths: ['/messages'],
  },
  {
    href: '/settings',
    icon: Menu,
    label: 'More',
    matchPaths: ['/settings'],
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (matchPaths: string[]) => {
    return matchPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-0 py-0 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-20">
        {TABS.map(({ href, icon: Icon, label, matchPaths }) => {
          const active = isActive(matchPaths);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 h-full relative group"
            >
              {/* Purple dot indicator for active tab */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-900 rounded-full" />
              )}

              {/* Icon */}
              <Icon
                className={`h-6 w-6 transition-colors ${
                  active ? 'text-purple-900' : 'text-gray-600 group-hover:text-gray-900'
                }`}
              />

              {/* Label */}
              <span
                className={`text-xs font-semibold mt-1 transition-colors ${
                  active ? 'text-purple-900' : 'text-gray-600 group-hover:text-gray-900'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
