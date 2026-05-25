'use client';
import Link from 'next/link';

interface Props { href: string; label: string; icon?: string; }

export function FloatingActionButton({ href, label, icon = '+' }: Props) {
  return (
    <Link href={href} style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      display: 'flex', alignItems: 'center', gap: '.5rem',
      background: 'var(--gold)', color: '#1A1000',
      borderRadius: 28, padding: '.75rem 1.25rem',
      fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '.9rem',
      textDecoration: 'none', boxShadow: '0 4px 20px rgba(239,159,39,.4)',
      transition: 'transform .15s, box-shadow .15s',
      zIndex: 100,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(239,159,39,.5)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(239,159,39,.4)'; }}>
      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{icon}</span>
      {label}
    </Link>
  );
}
