'use client';
import Link from 'next/link';

interface Crumb { label: string; href?: string; }

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '.375rem', marginBottom: '1.5rem' }}>
      {crumbs.map((crumb, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}>
          {i > 0 && <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>›</span>}
          {crumb.href ? (
            <Link href={crumb.href} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--text)' }}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
