'use client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { offline } = useNetworkStatus();
  if (!offline) return null;
  return (
    <div style={{
      background: 'rgba(163,45,45,.15)', borderBottom: '1px solid #A32D2D44',
      padding: '.625rem 2rem', textAlign: 'center',
      fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', color: '#A32D2D',
    }}>
      ⚠ You are offline. Contract reads may be stale.
    </div>
  );
}
