'use client';
import Link from 'next/link';

interface Props { href: string; label?: string; }

export function BackLink({ href, label = 'Back' }: Props) {
  return (
    <Link href={href} style={{
      display: 'inline-flex', alignItems: 'center', gap: '.375rem',
      color: 'var(--muted)', textDecoration: 'none',
      fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem',
      marginBottom: '1.5rem', transition: 'color .15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
      ← {label}
    </Link>
  );
}
