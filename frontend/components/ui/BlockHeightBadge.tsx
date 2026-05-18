'use client';
import { useBlockHeight } from '@/hooks/useBlockHeight';

export function BlockHeightBadge() {
  const height = useBlockHeight();
  return (
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>
      ⬡ {height > 0 ? '#' + height.toLocaleString() : '…'}
    </span>
  );
}
