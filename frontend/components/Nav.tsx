'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '../hooks/useWallet';
import { NETWORK_NAME, truncatePrincipal } from '../lib/contract';

export default function Nav() {
  const pathname = usePathname();
  const { connected, address, ready, connect, disconnect } = useWallet();

  return (
    <nav>
      <Link href="/" className="nav-brand">
        <div className="nav-logo">
          <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="#1A1000" strokeWidth="1.5" />
            <circle cx="7" cy="7" r="1.5" fill="#1A1000" />
            <line x1="7" y1="2" x2="7" y2="0.5" stroke="#1A1000" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="7" y1="13.5" x2="7" y2="12" stroke="#1A1000" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="7" x2="0.5" y2="7" stroke="#1A1000" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="13.5" y1="7" x2="12" y2="7" stroke="#1A1000" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="nav-brand-name">VaultSTX</span>
      </Link>

      <div className="nav-links">
        <Link href="/dashboard" aria-current={pathname === '/dashboard' ? 'page' : undefined}
          style={{ color: pathname === '/dashboard' ? 'var(--gold)' : undefined }}>
          Dashboard
        </Link>
        <Link href="/escrow/new" aria-current={pathname === '/escrow/new' ? 'page' : undefined}
          style={{ color: pathname === '/escrow/new' ? 'var(--gold)' : undefined }}>
          New Escrow
        </Link>
      </div>

      <div className="nav-actions">
        {NETWORK_NAME !== 'mainnet' && <span className="address-pill">{NETWORK_NAME}</span>}
        {!ready ? (
          <span className="address-pill" aria-live="polite">…</span>
        ) : connected ? (
          <>
            <span className="address-pill">{truncatePrincipal(address, 8)}</span>
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '.35rem .875rem', fontSize: '.8125rem' }}
              onClick={disconnect}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button type="button" className="btn-primary" onClick={connect}>Connect Wallet</button>
        )}
      </div>
    </nav>
  );
}
