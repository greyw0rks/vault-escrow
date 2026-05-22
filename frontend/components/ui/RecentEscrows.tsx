'use client';
import Link from 'next/link';
import { useRecentEscrows } from '@/hooks/useRecentEscrows';

export function RecentEscrows() {
  const { recent, clear } = useRecentEscrows();
  if (recent.length === 0) return null;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.625rem' }}>
        <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '.06em' }}>Recently viewed</span>
        <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '.75rem' }}>clear</button>
      </div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {recent.map(id => (
          <Link key={id} href={'/escrow/' + id} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem', color: 'var(--gold)', background: 'rgba(239,159,39,.08)', border: '1px solid var(--gold-dim)', borderRadius: 20, padding: '.2rem .625rem', textDecoration: 'none' }}>
            #{id}
          </Link>
        ))}
      </div>
    </div>
  );
}
