import type { Escrow } from '@/lib/contract';

export function DisputeBanner({ escrow }: { escrow: Escrow }) {
  if (escrow.state !== 'disputed') return null;
  return (
    <div style={{
      background: 'rgba(163,45,45,.12)', border: '1px solid #A32D2D44',
      borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: '.75rem',
      fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem',
    }}>
      <span style={{ fontSize: '1.25rem' }}>⚠</span>
      <div>
        <strong style={{ color: '#A32D2D' }}>Escrow is under dispute.</strong>
        <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontSize: '.85rem' }}>
          Awaiting resolution by the assigned resolver ({escrow.resolver.slice(0, 8)}…).
        </p>
      </div>
    </div>
  );
}
