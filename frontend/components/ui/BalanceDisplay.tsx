'use client';
import { useAccountBalance } from '@/hooks/useAccountBalance';

export function BalanceDisplay({ address }: { address: string | null }) {
  const { formatted, loading, refetch } = useAccountBalance(address);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.875rem', color: 'var(--gold)' }}>
        {loading ? '…' : formatted} STX
      </span>
      <button onClick={refetch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '.75rem' }}>↻</button>
    </div>
  );
}
