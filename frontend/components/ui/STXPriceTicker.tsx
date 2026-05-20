'use client';
import { useSTXPrice } from '@/hooks/useSTXPrice';

export function STXPriceTicker() {
  const { formatted, change24h, trend, loading } = useSTXPrice();
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—';
  const color = trend === 'up' ? '#1D9E75' : trend === 'down' ? '#A32D2D' : 'var(--muted)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem' }}>
      <span style={{ color: 'var(--muted)' }}>STX</span>
      <span style={{ color: 'var(--gold)' }}>{loading ? '…' : (formatted ?? '—')}</span>
      {change24h != null && (
        <span style={{ color }}>
          {arrow} {Math.abs(change24h).toFixed(2)}%
        </span>
      )}
    </div>
  );
}
