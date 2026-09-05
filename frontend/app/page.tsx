'use client';

import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';

export default function HomePage() {
  const { connected, ready, connect, error } = useWallet();

  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">Trustless · On-Chain · Bitcoin-secured</p>
        <h1 className="hero-title">Escrow without<br /><em>intermediaries.</em></h1>
        <p className="hero-sub">
          Lock STX into milestone-based smart contracts. Work gets paid when delivered. Disputes
          resolved by a pre-agreed resolver — all enforced by Clarity code, not a company.
        </p>
        <div className="hero-cta">
          {/* Wait for the wallet check before choosing a CTA. This used to be a
              hardcoded `isSignedIn = false`, so a connected user was always
              shown "Get Started" and asked to reconnect. */}
          {!ready ? (
            <span className="btn-primary btn-lg" aria-busy="true" style={{ opacity: 0.6 }}>Loading…</span>
          ) : connected ? (
            <Link href="/escrow/new" className="btn-primary btn-lg">Create Escrow</Link>
          ) : (
            <button type="button" className="btn-primary btn-lg" onClick={connect}>Get Started</button>
          )}
          <Link href="/dashboard" className="btn-ghost btn-lg">View Escrows</Link>
        </div>
        {error && <p style={{ color: 'var(--red)', marginTop: '1rem', fontSize: '.875rem' }}>{error}</p>}
      </section>

      <hr className="hero-divider" />

      <div className="how">
        <div className="step">
          <div className="step-num">01</div>
          <h3>Client deposits STX</h3>
          <p>Lock funds and define milestone deliverables with exact amounts.</p>
        </div>
        <div className="step">
          <div className="step-num">02</div>
          <h3>Worker delivers</h3>
          <p>Work sequentially through milestones, submitting each when complete.</p>
        </div>
        <div className="step">
          <div className="step-num">03</div>
          <h3>Approve or dispute</h3>
          <p>Client approves to release STX. Either party can escalate to a resolver.</p>
        </div>
      </div>

      <footer>
        <span>VaultSTX · Proof of Ship · Stacks</span>
        <a href="https://github.com/greyw0rks/vaultstx" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </>
  );
}
