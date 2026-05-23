'use client';
import { OfflineBanner } from './OfflineBanner';
import { AppFooter } from './AppFooter';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface Props { children: React.ReactNode; }

export function AppShell({ children }: Props) {
  useScrollToTop();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <OfflineBanner />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <AppFooter />
    </div>
  );
}
