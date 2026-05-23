'use client';
import Link from 'next/link';

export function EmptyEscrows({ filtered = false }: { filtered?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', opacity: .25 }}>⬡</div>
      <div>
        <p style={{ margin: '0 0 .5rem', fontFamily: "'Playfair Display',serif", fontSize: '1.125rem' }}>
          {filtered ? 'No matching escrows' : 'No escrows yet'}
        </p>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.875rem', fontFamily: "'DM Sans',sans-serif" }}>
          {filtered ? 'Try adjusting your filters.' : 'Create your first escrow to get started.'}
        </p>
      </div>
      {!filtered && <Link href="/escrow/new" className="btn-primary">Create Escrow</Link>}
    </div>
  );
}
