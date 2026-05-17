'use client';
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useConnect } from '@stacks/connect-react';

export default function Nav() {
  const { authenticate } = useConnect();
  const pathname = usePathname();

  const isSignedIn = false;
  return (
    <nav>
      <Link href="/" className="nav-brand">
        <div className="nav-logo">
          <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="5" stroke="#1A1000" strokeWidth="1.5"/>
            <circle cx="7" cy="7" r="1.5" fill="#1A1000"/>
            <line x1="7" y1="2" x2="7" y2="0.5" stroke="#1A1000" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="7" y1="13.5" x2="7" y2="12" stroke="#1A1000" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="2" y1="7" x2="0.5" y2="7" stroke="#1A1000" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="13.5" y1="7" x2="12" y2="7" stroke="#1A1000" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="nav-brand-name">VaultSTX</span>
      </Link>

      <div className="nav-links">
        <Link href="/dashboard" style={{ color: pathname === '/dashboard' ? 'var(--gold)' : undefined }}>Dashboard</Link>
        <Link href="/escrow/new" style={{ color: pathname === '/escrow/new' ? 'var(--gold)' : undefined }}>New Escrow</Link>
      </div>

      <div className="nav-actions">
        {isSignedIn ? (
          <>
            <span className="address-pill">{address?.slice(0,8)}…{address?.slice(-4)}</span>
            <button className="btn-ghost" style={{ padding: '.35rem .875rem', fontSize: '.8125rem' }} onClick={signOut}>Disconnect</button>
          </>
        ) : (
          <button className="btn-primary" onClick={() => openAuthRequest()}>Connect Wallet</button>
        )}
      </div>
    </nav>
  );
}
