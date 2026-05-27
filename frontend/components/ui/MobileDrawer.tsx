'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props { open: boolean; onClose: () => void; }

const NAV_ITEMS = [
  { href: '/',           label: 'Home',       icon: 'o' },
  { href: '/dashboard',  label: 'Dashboard',  icon: '#' },
  { href: '/escrow/new', label: 'New Escrow', icon: '+' },
];

export function MobileDrawer({ open, onClose }: Props) {
  const pathname = usePathname();
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {open && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200 }} onClick={onClose} />}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 280, background: 'var(--surface)', borderRight: '1px solid var(--border)', zIndex: 201, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .25s ease', padding: '1.5rem 1rem' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gold)' }}>VaultSTX</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: pathname === item.href ? 'var(--gold)' : 'var(--text)', background: pathname === item.href ? 'rgba(239,159,39,.08)' : 'none', fontFamily: "'DM Sans',sans-serif" }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
