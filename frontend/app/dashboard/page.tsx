'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useConnect, isConnected, getUserData } from '@stacks/connect-react';
import {
  fetchEscrow, buildApproveMilestone,
  microToSTX, truncatePrincipal,
  type Escrow,
} from '@/lib/contract';

const SCAN_COUNT = 20;

const STATE_COLORS: Record<string, string> = {
  open:      '#EF9F27',
  active:    '#1D9E75',
  disputed:  '#A32D2D',
  complete:  '#1D9E75',
  cancelled: '#5F5E5A',
};

const STATE_LABELS: Record<string, string> = {
  open:      'Open',
  active:    'Active',
  disputed:  'Disputed',
  complete:  'Complete',
  cancelled: 'Cancelled',
};

export default function DashboardPage() {
  const { authenticate } = useConnect();
  const [signedIn, setSignedIn] = useState(false);
  const [address, setAddress]   = useState<string | null>(null);
  const [escrows, setEscrows]   = useState<Escrow[]>([]);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState<'mine' | 'all'>('mine');

  useEffect(() => {
    const connected = isConnected();
    setSignedIn(connected);
    if (connected) {
      const data = getUserData() as any;
      setAddress(data?.profile?.stxAddress?.testnet ?? null);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const results: Escrow[] = [];
    for (let i = 1; i <= SCAN_COUNT; i++) {
      const e = await fetchEscrow(i);
      if (!e) break;
      results.push(e);
    }
    setEscrows(results);
    setLoading(false);
  }, []);

  useEffect(() => { if (signedIn) load(); }, [signedIn, load]);

  const filtered = tab === 'mine' && address
    ? escrows.filter(e => e.client === address || e.worker === address || e.resolver === address)
    : escrows;

  if (!signedIn) {
    return (
      <main className="center-page page">
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--muted)' }}>Connect your wallet to view your escrows.</p>
        <button className="btn-primary" onClick={() => authenticate({ appDetails: { name: "VaultSTX", icon: "/logo.svg" } })}>Connect Wallet</button>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">{address ? truncatePrincipal(address, 8) : ''}</p>
        </div>
        <Link href="/escrow/new" className="btn-primary">+ New Escrow</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.75rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total',    value: escrows.length },
          { label: 'Active',   value: escrows.filter(e => e.state === 'active').length },
          { label: 'Disputed', value: escrows.filter(e => e.state === 'disputed').length },
          { label: 'Complete', value: escrows.filter(e => e.state === 'complete').length },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.125rem 1.25rem' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.375rem', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'JetBrains Mono',monospace" }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontFamily: "'Playfair Display',serif", color: 'var(--gold)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '2px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3px', width: 'fit-content', marginBottom: '1.5rem' }}>
        {(['mine', 'all'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '.375rem 1.25rem', borderRadius: '4px', border: 'none', background: tab === t ? 'var(--gold)' : 'transparent', color: tab === t ? '#1A1000' : 'var(--muted)', fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
            {t === 'mine' ? 'My Escrows' : 'All'}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Scanning escrows...</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <p>{tab === 'mine' ? "You have no escrows yet." : "No escrows found."}</p>
          <Link href="/escrow/new" className="btn-primary">Create your first escrow</Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {filtered.map(e => (
          <Link key={e.id} href={`/escrow/${e.id}`}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', textDecoration: 'none', color: 'var(--text)', display: 'block', transition: 'border-color .15s' }}
            onMouseEnter={el => (el.currentTarget.style.borderColor = 'var(--border-hi)')}
            onMouseLeave={el => (el.currentTarget.style.borderColor = 'var(--border)')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.875rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.25rem' }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 600 }}>Escrow #{e.id}</span>
                  <span style={{ background: `${STATE_COLORS[e.state]}22`, color: STATE_COLORS[e.state], border: `1px solid ${STATE_COLORS[e.state]}44`, fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', padding: '.2rem .5rem', borderRadius: '20px' }}>
                    {STATE_LABELS[e.state]}
                  </span>
                  {e.client === address && <span style={{ background: 'rgba(239,159,39,.1)', color: 'var(--gold)', fontSize: '.6875rem', padding: '.2rem .5rem', borderRadius: '20px', border: '1px solid var(--gold-dim)' }}>client</span>}
                  {e.worker === address && <span style={{ background: 'rgba(29,158,117,.1)', color: '#1D9E75', fontSize: '.6875rem', padding: '.2rem .5rem', borderRadius: '20px', border: '1px solid #146B5088' }}>worker</span>}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>
                  {truncatePrincipal(e.client, 8)} → {truncatePrincipal(e.worker, 8)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: 'var(--gold)' }}>{microToSTX(e.totalAmount)} STX</div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.125rem' }}>
                  {microToSTX(e.released)} released · {e.milestoneCount} milestones
                </div>
              </div>
            </div>
            {e.milestoneCount > 0 && (
              <div style={{ height: '3px', background: 'var(--raised)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--gold)', width: `${Math.round((Number(e.released) / Number(e.totalAmount)) * 100)}%`, borderRadius: '2px' }} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
