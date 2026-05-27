'use client';
import { BRAND } from '@/lib/brand';
import { AppStatus } from './AppStatus';
import { NetworkBadge } from './NetworkBadge';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>{BRAND.name}</span>
        <NetworkBadge />
      </div>
      <AppStatus />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href={BRAND.github} target="_blank" rel="noreferrer" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)', textDecoration: 'none' }}>GitHub</a>
      </div>
    </footer>
  );
}
