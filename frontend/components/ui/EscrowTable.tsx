'use client';
import Link from 'next/link';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import { microToSTX, truncatePrincipal, type Escrow } from '@/lib/contract';

interface Props { escrows: Escrow[]; address?: string | null; }

export function EscrowTable({ escrows, address }: Props) {
  if (escrows.length === 0) return null;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['ID', 'State', 'Client', 'Worker', 'Amount', 'Milestones'].map(h => (
              <th key={h} style={{ padding: '.625rem .75rem', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {escrows.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '.625rem .75rem' }}><Link href={'/escrow/' + e.id} style={{ color: 'var(--gold)', textDecoration: 'none', fontFamily: "'JetBrains Mono',monospace" }}>#{e.id}</Link></td>
              <td style={{ padding: '.625rem .75rem' }}><EscrowStatusBadge state={e.state} /></td>
              <td style={{ padding: '.625rem .75rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem' }}>{truncatePrincipal(e.client)}</td>
              <td style={{ padding: '.625rem .75rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem' }}>{truncatePrincipal(e.worker)}</td>
              <td style={{ padding: '.625rem .75rem', color: 'var(--gold)' }}>{microToSTX(e.totalAmount)} STX</td>
              <td style={{ padding: '.625rem .75rem', color: 'var(--muted)' }}>{e.milestoneCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
