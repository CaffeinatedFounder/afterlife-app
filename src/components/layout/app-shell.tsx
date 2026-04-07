'use client';

import { ReactNode } from 'react';
import { Header } from './header';
import { BottomNav } from './bottom-nav';

interface AppShellProps {
  children: ReactNode;
  userInitials?: string;
  unreadCount?: number;
}

export function AppShell({ children, userInitials = 'U', unreadCount = 0 }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col safe-area-bottom">
      {/* Header */}
      <Header userInitials={userInitials} unreadCount={unreadCount} />

      {/* Main Content - scrollable area */}
      <main className="flex-1 pt-20 pb-24 overflow-y-auto">
        <div className="max-w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
