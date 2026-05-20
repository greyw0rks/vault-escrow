import type { Escrow } from '@/lib/contract';
import { microToSTX } from '@/lib/contract';

export function CompletionBanner({ escrow }: { escrow: Escrow }) {
  if (escrow.state !== 'complete') return null;
  return (
    <div style={{
      background: 'rgba(29,158,117,.12)', border: '1px solid #1D9E7544',
      borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: '.75rem',
    }}>
      <span style={{ fontSize: '1.5rem' }}>✓</span>
      <div>
        <strong style={{ color: '#1D9E75' }}>Escrow complete!</strong>
        <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontSize: '.85rem' }}>
          {microToSTX(escrow.released)} STX successfully released to the worker.
        </p>
      </div>
    </div>
  );
}
