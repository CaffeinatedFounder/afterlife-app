'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  userInitials?: string;
  unreadCount?: number;
}

export function Header({ userInitials = 'U', unreadCount = 0 }: HeaderProps) {
  const [initials, setInitials] = useState(userInitials);

  useEffect(() => {
    setInitials(userInitials);
  }, [userInitials]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-900 via-purple-800 to-blue-800 text-white px-4 py-4 z-40 safe-area-inset-top">
      <div className="flex items-center justify-between max-w-full">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-sm">
          {initials}
        </div>

        {/* Logo/Text */}
        <Link href="/dashboard" className="text-center font-bold text-lg">
          Afterlife
        </Link>

        {/* Notification Bell */}
        <button className="relative">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
