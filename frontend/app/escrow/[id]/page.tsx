'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWallet } from '../../../hooks/useWallet';
import {
  buildActivateEscrow, buildAddMilestone, buildApproveMilestone, buildCancelEscrow,
  buildRaiseDispute, buildResolveDispute, buildSubmitMilestone,
  explorerTxUrl, fetchAllMilestones, fetchEscrow, microToSTX, truncatePrincipal,
  type ContractCall, type Escrow, type EscrowState, type Milestone, type MilestoneState,
} from '../../../lib/contract';
import { callContract, isUserCancel, waitForTx } from '../../../lib/wallet';

const STATE_LABELS: Record<EscrowState, string> = {
  open: 'Open', active: 'Active', disputed: 'Disputed', complete: 'Complete', cancelled: 'Cancelled',
};

const MS_LABELS: Record<MilestoneState, string> = {
  pending: 'Pending', submitted: 'Submitted', approved: 'Approved', disputed: 'Disputed',
};

export default function EscrowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const escrowId = Number(id);
  const { address, connected, ready, connect } = useWallet();

  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [lastTx, setLastTx] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const e = await fetchEscrow(escrowId);
      if (!e) { setError(`Escrow #${escrowId} does not exist on this contract.`); setEscrow(null); return; }
      setEscrow(e);
      setMilestones(await fetchAllMilestones(e));
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [escrowId]);

  useEffect(() => { if (Number.isFinite(escrowId)) load(); }, [escrowId, load]);

  /** Submit, wait for the block, then re-read so the UI reflects chain state. */
  const run = useCallback(async (label: string, call: ContractCall) => {
    setError('');
    setBusy(label);
    try {
      const txid = await callContract(call);
      if (!txid) { setBusy(''); return; }
      setLastTx(txid);
      const outcome = await waitForTx(txid);
      if (outcome.status !== 'success') {
        setError(`${label} did not succeed (${outcome.status}${outcome.repr ? ` ${outcome.repr}` : ''})`);
      }
      await load();
    } catch (err) {
      if (!isUserCancel(err)) setError((err as Error).message);
    } finally {
      setBusy('');
    }
  }, [load]);

  if (loading && !escrow) return <div className="loading">Loading escrow #{escrowId}…</div>;

  if (!escrow) {
    return (
      <main className="center-page page">
        <h1>Escrow #{escrowId}</h1>
        <p style={{ color: 'var(--red)' }}>{error || 'Not found.'}</p>
        <Link href="/dashboard" className="btn-ghost">Back to dashboard</Link>
      </main>
    );
  }

  const isClient = connected && address === escrow.client;
  const isWorker = connected && address === escrow.worker;
  const isResolver = connected && address === escrow.resolver;
  const approved = milestones.filter((m) => m.state === 'approved').length;
  const progress = escrow.milestoneCount > 0 ? Math.round((approved / escrow.milestoneCount) * 100) : 0;

  return (
    <main className="detail-page">
      <div className="detail-header">
        <div>
          <h1>Escrow #{escrow.id}</h1>
          <span className={`state-badge state-${escrow.state}`}>{STATE_LABELS[escrow.state]}</span>
        </div>
        <div className="amount-display">
          <span className="amount-label">Total locked</span>
          <span className="amount-value">{microToSTX(escrow.totalAmount)} STX</span>
        </div>
      </div>

      {ready && !connected && (
        <div className="empty-state" style={{ marginBottom: '1.5rem' }}>
          <p>Connect a wallet to act on this escrow.</p>
          <button type="button" className="btn-primary" onClick={connect}>Connect Wallet</button>
        </div>
      )}

      {error && (
        <div className="empty-state" style={{ borderColor: 'var(--red)', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--red)' }}>{error}</p>
        </div>
      )}

      {busy && (
        <div className="loading" aria-live="polite" style={{ marginBottom: '1.5rem' }}>
          {busy} — waiting for the block. Stacks blocks take ~10 minutes.
        </div>
      )}

      <div className="parties-row">
        <div className="party">
          <span className="party-role">Client</span>
          <code>{truncatePrincipal(escrow.client)}</code>
          {isClient && <span className="you-badge">you</span>}
        </div>
        <div className="arrow">→</div>
        <div className="party">
          <span className="party-role">Worker</span>
          <code>{truncatePrincipal(escrow.worker)}</code>
          {isWorker && <span className="you-badge">you</span>}
        </div>
        <div className="party">
          <span className="party-role">Resolver</span>
          <code>{truncatePrincipal(escrow.resolver)}</code>
          {isResolver && <span className="you-badge">you</span>}
        </div>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-label">
        {approved} of {escrow.milestoneCount} milestone{escrow.milestoneCount === 1 ? '' : 's'} complete
        · {microToSTX(escrow.released)} / {microToSTX(escrow.totalAmount)} STX released
      </p>

      {escrow.state === 'open' && (isClient || isWorker) && (
        <div className="oracle-panel" style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginBottom: '.75rem' }}>
            This escrow is still open, so milestones can be added and no STX is locked yet.
          </p>
          {isClient && (
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn-primary btn-sm" disabled={!!busy || escrow.milestoneCount === 0}
                onClick={() => run('Locking STX', buildActivateEscrow(escrow.id))}>
                Activate and lock {microToSTX(escrow.totalAmount)} STX
              </button>
              <button type="button" className="btn-danger btn-sm" disabled={!!busy}
                onClick={() => run('Cancelling escrow', buildCancelEscrow(escrow.id))}>
                Cancel escrow
              </button>
            </div>
          )}
        </div>
      )}

      <div className="milestones-list">
        {milestones.length === 0 && (
          <div className="empty-state"><p>No milestones have been added to this escrow yet.</p></div>
        )}

        {milestones.map((ms, i) => {
          const isActiveMilestone = i === escrow.activeMilestone;
          return (
            <div key={i} className={`milestone-card ms-${ms.state} ${isActiveMilestone ? 'active' : ''}`}>
              <div className="ms-header">
                <div className="ms-index">{i + 1}</div>
                <div className="ms-info">
                  <p className="ms-desc">{ms.description}</p>
                  <span className="ms-amount">{microToSTX(ms.amount)} STX</span>
                </div>
                <span className={`ms-badge ms-badge-${ms.state}`}>{MS_LABELS[ms.state]}</span>
              </div>

              {/* The contract only accepts action on the active milestone, so no
                  other row gets buttons that would be rejected on chain. */}
              {isActiveMilestone && (
                <div className="ms-actions">
                  {isWorker && ms.state === 'pending' && escrow.state === 'active' && (
                    <button type="button" className="btn-primary btn-sm" disabled={!!busy}
                      onClick={() => run('Submitting milestone', buildSubmitMilestone(escrow.id, i))}>
                      Submit for review
                    </button>
                  )}

                  {isClient && ms.state === 'submitted' && escrow.state === 'active' && (
                    <>
                      <button type="button" className="btn-success btn-sm" disabled={!!busy}
                        onClick={() => run('Approving milestone', buildApproveMilestone(escrow.id, i))}>
                        Approve &amp; release {microToSTX(ms.amount)} STX
                      </button>
                      <button type="button" className="btn-danger btn-sm" disabled={!!busy}
                        onClick={() => run('Raising dispute', buildRaiseDispute(escrow.id, i))}>
                        Raise dispute
                      </button>
                    </>
                  )}

                  {isWorker && ms.state === 'submitted' && escrow.state === 'active' && (
                    <button type="button" className="btn-danger btn-sm" disabled={!!busy}
                      onClick={() => run('Raising dispute', buildRaiseDispute(escrow.id, i))}>
                      Raise dispute
                    </button>
                  )}

                  {isResolver && ms.state === 'disputed' && escrow.state === 'disputed' && (
                    <>
                      <p className="resolver-note">You are the resolver for this dispute.</p>
                      <button type="button" className="btn-success btn-sm" disabled={!!busy}
                        onClick={() => run('Releasing to worker', buildResolveDispute(escrow.id, i, true))}>
                        Release to worker
                      </button>
                      <button type="button" className="btn-warning btn-sm" disabled={!!busy}
                        onClick={() => run('Refunding client', buildResolveDispute(escrow.id, i, false))}>
                        Refund client
                      </button>
                    </>
                  )}

                  {!connected && ms.state !== 'approved' && (
                    <p className="resolver-note">Connect a wallet to act on this milestone.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lastTx && (
        <p style={{ marginTop: '2rem', fontSize: '.75rem' }}>
          <a href={explorerTxUrl(lastTx)} target="_blank" rel="noreferrer"
            style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--gold)' }}>
            Last transaction {lastTx.slice(0, 10)}…{lastTx.slice(-6)} ↗
          </a>
        </p>
      )}
    </main>
  );
}
