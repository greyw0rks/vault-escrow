import { EscrowStatusBadge } from './EscrowStatusBadge';
import { ProgressRing } from './ProgressRing';
import { microToSTX } from '@/lib/contract';
import { bigPct } from '@/lib/bigint';
import type { Escrow } from '@/lib/contract';

export function EscrowSummaryCard({ escrow: e }: { escrow: Escrow }) {
  const pct = bigPct(e.released, e.totalAmount);
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <ProgressRing pct={pct} size={48} label={pct + '%'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem' }}>#{e.id}</span>
          <EscrowStatusBadge state={e.state} />
        </div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.125rem', color: 'var(--gold)' }}>
          {microToSTX(e.totalAmount)} STX
        </div>
        <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.125rem' }}>
          {e.milestoneCount} milestones · {microToSTX(e.released)} released
        </div>
      </div>
    </div>
  );
}
