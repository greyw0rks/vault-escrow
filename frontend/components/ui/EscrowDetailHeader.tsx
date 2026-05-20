import { EscrowStatusBadge } from './EscrowStatusBadge';
import { ShareButton } from './ShareButton';
import { microToSTX } from '@/lib/contract';
import type { Escrow } from '@/lib/contract';

export function EscrowDetailHeader({ escrow }: { escrow: Escrow }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
          <h1 style={{ margin: 0 }}>Escrow #{escrow.id}</h1>
          <EscrowStatusBadge state={escrow.state} />
        </div>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.875rem', fontFamily: "'JetBrains Mono',monospace" }}>
          Created at block #{escrow.createdAt.toLocaleString()}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', color: 'var(--gold)' }}>
          {microToSTX(escrow.totalAmount)} STX
        </div>
        <ShareButton escrowId={escrow.id} />
      </div>
    </div>
  );
}
