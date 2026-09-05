'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '../../hooks/useWallet';
import { useEscrows } from '../../hooks/useEscrows';
import {
  CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK_NAME, explorerContractUrl,
  microToSTX, truncatePrincipal,
  type Escrow, type EscrowState,
} from '../../lib/contract';

const STATE_COLORS: Record<EscrowState, string> = {
  open: 'var(--gold)',
  active: 'var(--green)',
  disputed: 'var(--red)',
  complete: 'var(--green)',
  cancelled: 'var(--muted)',
};

const STATE_LABELS: Record<EscrowState, string> = {
  open: 'Open',
  active: 'Active',
  disputed: 'Disputed',
  complete: 'Complete',
  cancelled: 'Cancelled',
};

/** Widen the read window when filtering by address, since matches are sparse. */
const MINE_SCAN = 120;

export default function DashboardPage() {
  const { connected, ready, address, connect } = useWallet();
  const [tab, setTab] = useState<'mine' | 'all'>('all');
  const { escrows, total, loading, error, hasMore, loadMore } = useEscrows(tab === 'mine' ? MINE_SCAN : 24);

  const mine = useMemo(
    () => escrows.filter((e) => e.client === address || e.worker === address || e.resolver === address),
    [escrows, address],
  );
  const shown = tab === 'mine' ? mine : escrows;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">
            {connected ? truncatePrincipal(address, 8) : 'Not connected'} ·{' '}
            <a href={explorerContractUrl()} target="_blank" rel="noreferrer" style={{ color: 'var(--muted)' }}>
              {truncatePrincipal(CONTRACT_ADDRESS, 6)}.{CONTRACT_NAME}
            </a>{' '}
            on {NETWORK_NAME}
          </p>
        </div>
        {connected
          ? <Link href="/escrow/new" className="btn-primary">+ New Escrow</Link>
          : ready && <button type="button" className="btn-primary" onClick={connect}>Connect Wallet</button>}
      </div>

      {error && (
        <div className="empty-state" style={{ borderColor: 'var(--red)' }}>
          <p style={{ color: 'var(--red)' }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.75rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'On chain', value: total },
          { label: 'Active', value: shown.filter((e) => e.state === 'active').length },
          { label: 'Disputed', value: shown.filter((e) => e.state === 'disputed').length },
          { label: 'Complete', value: shown.filter((e) => e.state === 'complete').length },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.125rem 1.25rem' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.375rem', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'JetBrains Mono',monospace" }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontFamily: "'Playfair Display',serif", color: 'var(--gold)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '2px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3px', width: 'fit-content', marginBottom: '1.5rem' }}>
        {(['all', 'mine'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            disabled={t === 'mine' && !connected}
            style={{
              padding: '.375rem 1.25rem', borderRadius: '4px', border: 'none',
              background: tab === t ? 'var(--gold)' : 'transparent',
              color: tab === t ? '#1A1000' : 'var(--muted)',
              fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem',
              fontWeight: tab === t ? 600 : 400,
              cursor: t === 'mine' && !connected ? 'not-allowed' : 'pointer',
              opacity: t === 'mine' && !connected ? 0.5 : 1,
            }}
          >
            {t === 'mine' ? 'My Escrows' : 'Newest'}
          </button>
        ))}
      </div>

      {loading && shown.length === 0 && <div className="loading">Reading escrows from {NETWORK_NAME}…</div>}

      {!loading && shown.length === 0 && (
        <div className="empty-state">
          <p>
            {tab === 'mine'
              ? `No escrows for this address in the newest ${MINE_SCAN}.`
              : 'No escrows found on this contract.'}
          </p>
          {connected && <Link href="/escrow/new" className="btn-primary">Create an escrow</Link>}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        {shown.map((e) => <EscrowRow key={e.id} escrow={e} address={address} />)}

        {tab === 'all' && hasMore && shown.length > 0 && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="btn-ghost"
            style={{ marginTop: '.5rem', padding: '.75rem' }}
          >
            {loading ? 'Loading…' : `Load more (${shown.length} of ${total})`}
          </button>
        )}
      </div>
    </main>
  );
}

const CONTRACT_NAME_SUFFIX = 'vaultstx-escrow';

function EscrowRow({ escrow: e, address }: { escrow: Escrow; address: string }) {
  const releasedPct = e.totalAmount > 0n
    ? Math.min(100, Math.round((Number(e.released) / Number(e.totalAmount)) * 100))
    : 0;

  return (
    <Link
      href={`/escrow/${e.id}`}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
        textDecoration: 'none', color: 'var(--text)', display: 'block',
        transition: 'border-color .15s',
      }}
      onMouseEnter={(el) => (el.currentTarget.style.borderColor = 'var(--border-hi)')}
      onMouseLeave={(el) => (el.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.875rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 600 }}>Escrow #{e.id}</span>
            <span style={{
              background: 'var(--raised)', color: STATE_COLORS[e.state],
              border: `1px solid ${STATE_COLORS[e.state]}`,
              fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem',
              padding: '.2rem .5rem', borderRadius: '20px',
            }}>
              {STATE_LABELS[e.state]}
            </span>
            {e.client === address && <span className="address-pill">client</span>}
            {e.worker === address && <span className="address-pill">worker</span>}
            {e.resolver === address && <span className="address-pill">resolver</span>}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>
            {truncatePrincipal(e.client, 8)} → {truncatePrincipal(e.worker, 8)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: 'var(--gold)' }}>
            {microToSTX(e.totalAmount)} STX
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.125rem' }}>
            {microToSTX(e.released)} released · {e.milestoneCount} milestone{e.milestoneCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {e.milestoneCount > 0 && (
        <div
          style={{ height: '3px', background: 'var(--raised)', borderRadius: '2px', overflow: 'hidden' }}
          role="progressbar"
          aria-valuenow={releasedPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ height: '100%', background: 'var(--gold)', width: `${releasedPct}%`, borderRadius: '2px' }} />
        </div>
      )}
    </Link>
  );
}
