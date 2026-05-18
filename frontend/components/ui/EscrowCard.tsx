import Link from 'next/link';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import { MilestoneProgressBar } from './MilestoneProgressBar';
import { microToSTX, truncatePrincipal, type Escrow } from '@/lib/contract';

interface Props {
  escrow: Escrow;
  address?: string | null;
}

export function EscrowCard({ escrow: e, address }: Props) {
  return (
    <Link href={`/escrow/${e.id}`}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
        textDecoration: 'none', color: 'var(--text)', display: 'block',
        transition: 'border-color .15s',
      }}
      onMouseEnter={el => (el.currentTarget.style.borderColor = 'var(--border-hi)')}
      onMouseLeave={el => (el.currentTarget.style.borderColor = 'var(--border)')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.875rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.25rem' }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 600 }}>
              Escrow #{e.id}
            </span>
            <EscrowStatusBadge state={e.state} />
            {e.client === address && (
              <span style={{ background: 'rgba(239,159,39,.1)', color: 'var(--gold)', fontSize: '.6875rem', padding: '.2rem .5rem', borderRadius: '20px', border: '1px solid var(--gold-dim)' }}>client</span>
            )}
            {e.worker === address && (
              <span style={{ background: 'rgba(29,158,117,.1)', color: '#1D9E75', fontSize: '.6875rem', padding: '.2rem .5rem', borderRadius: '20px', border: '1px solid #146B5088' }}>worker</span>
            )}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>
            {truncatePrincipal(e.client, 8)} → {truncatePrincipal(e.worker, 8)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: 'var(--gold)' }}>
            {microToSTX(e.totalAmount)} STX
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.125rem' }}>
            {e.milestoneCount} milestones
          </div>
        </div>
      </div>
      {e.milestoneCount > 0 && (
        <MilestoneProgressBar
          released={e.released}
          total={e.totalAmount}
          approved={0}
          count={e.milestoneCount}
        />
      )}
    </Link>
  );
}
