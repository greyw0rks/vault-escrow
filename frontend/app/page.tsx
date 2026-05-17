'use client';

import Link from 'next/link';
import { useConnect } from '@stacks/connect-react';

export default function HomePage() {
  const { authenticate } = useConnect();

  const isSignedIn = false;

  const openAuthRequest = () => {
    authenticate({ appDetails: { name: "VaultSTX", icon: "/logo.svg" } });
  };

  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">Trustless · On-Chain · Bitcoin-secured</p>
        <h1 className="hero-title">Escrow without<br /><em>intermediaries.</em></h1>
        <p className="hero-sub">Lock STX into milestone-based smart contracts. Work gets paid when delivered. Disputes resolved by a pre-agreed resolver — all enforced by Clarity code, not a company.</p>
        <div className="hero-cta">
          {isSignedIn
            ? <Link href="/escrow/new" className="btn-primary btn-lg">Create Escrow</Link>
            : <button className="btn-primary btn-lg" onClick={() => openAuthRequest()}>Get Started</button>}
          <Link href="/dashboard" className="btn-ghost btn-lg">View Escrows</Link>
        </div>
      </section>
      <hr className="hero-divider" />
      <div className="how">
        <div className="step"><div className="step-num">01</div><h3>Client deposits STX</h3><p>Lock funds and define milestone deliverables with exact amounts.</p></div>
        <div className="step"><div className="step-num">02</div><h3>Worker delivers</h3><p>Work sequentially through milestones, submitting each when complete.</p></div>
        <div className="step"><div className="step-num">03</div><h3>Approve or dispute</h3><p>Client approves to release STX. Either party can escalate to a resolver.</p></div>
      </div>
      <footer><span>VaultSTX · Proof of Ship · Stacks</span><a href="https://github.com/greyw0rks/vaultstx" target="_blank" rel="noreferrer">GitHub</a></footer>
    </>
  );
}
