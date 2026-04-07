import { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AppShell userInitials="U" unreadCount={0}>
      {children}
    </AppShell>
  );
}
