'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useConnect, isConnected, getUserData } from '@stacks/connect-react';
import {
  fetchEscrow, fetchAllMilestones,
  buildSubmitMilestone, buildApproveMilestone,
  buildRaiseDispute, buildResolveDispute,
  microToSTX, truncatePrincipal,
  type Escrow, type Milestone,
} from '@/lib/contract';

const STATE_LABELS: Record<string, string> = {
  open: 'Open', active: 'Active', disputed: 'Disputed', complete: 'Complete', cancelled: 'Cancelled',
};

const MS_LABELS: Record<string, string> = {
  pending: 'Pending', submitted: 'Submitted', approved: 'Approved', disputed: 'Disputed',
};

export default function EscrowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { doContractCall } = useConnect();

  const myAddress = isConnected() ? ((getUserData() as any)?.profile?.stxAddress?.testnet ?? null) : null;

  const [escrow, setEscrow]         = useState<Escrow | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading]       = useState(true);
  const [txLoading, setTxLoading]   = useState(false);
  const [error, setError]           = useState('');

  const isClient   = myAddress === escrow?.client;
  const isWorker   = myAddress === escrow?.worker;
  const isResolver = myAddress === escrow?.resolver;

  async function load() {
    const e = await fetchEscrow(Number(id));
    if (!e) { setError('Escrow not found'); setLoading(false); return; }
    const ms = await fetchAllMilestones(e);
    setEscrow(e);
    setMilestones(ms);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function callContract(txOptions: object) {
    setTxLoading(true);
    try {
      await doContractCall({
        ...(txOptions as any),
        onFinish: () => { load(); setTxLoading(false); },
        onCancel: () => setTxLoading(false),
      } as any);
    } catch (e: any) {
      setError(e.message);
      setTxLoading(false);
    }
  }

  if (loading) return <div className="loading">Loading escrow…</div>;
  if (!escrow) return <div className="error-page">{error}</div>;

  const progress = escrow.milestoneCount > 0
    ? Math.round((milestones.filter(m => m.state === 'approved').length / escrow.milestoneCount) * 100)
    : 0;

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

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-label">
        {milestones.filter(m => m.state === 'approved').length} of {escrow.milestoneCount} milestones complete
        · {microToSTX(escrow.released)} / {microToSTX(escrow.totalAmount)} STX released
      </p>

      <div className="milestones-list">
        {milestones.map((ms, i) => (
          <div key={i} className={`milestone-card ms-${ms.state} ${i === escrow.activeMilestone ? 'active' : ''}`}>
            <div className="ms-header">
              <div className="ms-index">{i + 1}</div>
              <div className="ms-info">
                <p className="ms-desc">{ms.description}</p>
                <span className="ms-amount">{microToSTX(ms.amount)} STX</span>
              </div>
              <span className={`ms-badge ms-badge-${ms.state}`}>{MS_LABELS[ms.state]}</span>
            </div>

            {i === escrow.activeMilestone && (
              <div className="ms-actions">
                {isWorker && ms.state === 'pending' && escrow.state === 'active' && (
                  <button className="btn-primary btn-sm" onClick={() => callContract(buildSubmitMilestone(escrow.id, i))} disabled={txLoading}>
                    Submit for review
                  </button>
                )}
                {isClient && ms.state === 'submitted' && escrow.state === 'active' && (
                  <>
                    <button className="btn-success btn-sm" onClick={() => callContract(buildApproveMilestone(escrow.id, i))} disabled={txLoading}>
                      Approve & release {microToSTX(ms.amount)} STX
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => callContract(buildRaiseDispute(escrow.id, i))} disabled={txLoading}>
                      Raise dispute
                    </button>
                  </>
                )}
                {isWorker && ms.state === 'submitted' && escrow.state === 'active' && (
                  <button className="btn-danger btn-sm" onClick={() => callContract(buildRaiseDispute(escrow.id, i))} disabled={txLoading}>
                    Raise dispute
                  </button>
                )}
                {isResolver && ms.state === 'disputed' && escrow.state === 'disputed' && (
                  <>
                    <p className="resolver-note">You are the resolver for this dispute.</p>
                    <button className="btn-success btn-sm" onClick={() => callContract(buildResolveDispute(escrow.id, i, true))} disabled={txLoading}>
                      Release to worker
                    </button>
                    <button className="btn-warning btn-sm" onClick={() => callContract(buildResolveDispute(escrow.id, i, false))} disabled={txLoading}>
                      Refund client
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
