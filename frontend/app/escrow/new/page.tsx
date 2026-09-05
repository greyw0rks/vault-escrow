'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '../../../hooks/useWallet';
import {
  buildActivateEscrow, buildAddMilestone, buildCreateEscrow,
  explorerTxUrl, microToSTX, stxToMicro,
} from '../../../lib/contract';
import { callContract, isUserCancel, parseOkUint, waitForTx } from '../../../lib/wallet';

type Step = 'parties' | 'milestones' | 'activate' | 'done';

interface MilestoneInput { description: string; amount: string }

const PRINCIPAL = /^S[PTMN][0-9A-HJKMNP-Z]{37,40}$/;
const MAX_MILESTONES = 20;      // MAX-MILESTONES in vaultstx-escrow.clar
const MAX_DESCRIPTION = 200;    // (string-ascii 200)

export default function NewEscrowPage() {
  const { connected, ready, address, connect } = useWallet();

  const [step, setStep] = useState<Step>('parties');
  const [worker, setWorker] = useState('');
  const [resolver, setResolver] = useState('');
  const [escrowId, setEscrowId] = useState<number | null>(null);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([{ description: '', amount: '' }]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [txids, setTxids] = useState<string[]>([]);

  const totalStx = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const depositMicro = stxToMicro(String(totalStx));

  const setRow = (i: number, field: keyof MilestoneInput, value: string) =>
    setMilestones((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const partiesValid =
    PRINCIPAL.test(worker) && PRINCIPAL.test(resolver) &&
    worker !== address && resolver !== worker && totalStx > 0;

  const milestonesValid =
    milestones.length > 0 &&
    milestones.length <= MAX_MILESTONES &&
    milestones.every((m) => m.description.trim() && m.description.length <= MAX_DESCRIPTION && stxToMicro(m.amount) > 0n);

  /** Submit one call, wait for it to mine, and surface a failed Clarity response. */
  async function submit(label: string, call: Parameters<typeof callContract>[0]) {
    setBusy(label);
    const txid = await callContract(call);
    if (!txid) { setBusy(''); return null; }
    setTxids((t) => [...t, txid]);
    const outcome = await waitForTx(txid);
    setBusy('');
    if (outcome.status !== 'success') {
      setError(`${label} did not succeed on chain (${outcome.status}${outcome.repr ? ` ${outcome.repr}` : ''})`);
      return null;
    }
    return outcome;
  }

  async function handleCreate() {
    setError('');
    try {
      // create-escrow returns (ok escrow-id), so the id comes from the mined
      // transaction result rather than being guessed client-side.
      const outcome = await submit('Creating escrow', buildCreateEscrow(worker, resolver, depositMicro));
      if (!outcome) return;
      const id = parseOkUint(outcome.repr);
      if (id === null) { setError(`Could not read the new escrow id from ${outcome.repr ?? 'an empty result'}`); return; }
      setEscrowId(id);
      setStep('milestones');
    } catch (e) {
      if (!isUserCancel(e)) setError((e as Error).message);
      setBusy('');
    }
  }

  async function handleAddMilestones() {
    if (escrowId === null) return;
    setError('');
    try {
      for (const [i, ms] of milestones.entries()) {
        const outcome = await submit(
          `Adding milestone ${i + 1} of ${milestones.length}`,
          buildAddMilestone(escrowId, ms.description.trim(), stxToMicro(ms.amount)),
        );
        if (!outcome) return;
      }
      setStep('activate');
    } catch (e) {
      if (!isUserCancel(e)) setError((e as Error).message);
      setBusy('');
    }
  }

  async function handleActivate() {
    if (escrowId === null) return;
    setError('');
    try {
      const outcome = await submit('Locking STX', buildActivateEscrow(escrowId));
      if (outcome) setStep('done');
    } catch (e) {
      if (!isUserCancel(e)) setError((e as Error).message);
      setBusy('');
    }
  }

  if (ready && !connected) {
    return (
      <main className="center-page page">
        <h1>New Escrow</h1>
        <p style={{ color: 'var(--muted)' }}>Connect a wallet to create an escrow.</p>
        <button type="button" className="btn-primary" onClick={connect}>Connect Wallet</button>
      </main>
    );
  }

  const STEPS: Step[] = ['parties', 'milestones', 'activate', 'done'];

  return (
    <main className="page" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <div>
          <h1>New Escrow</h1>
          <p className="sub">
            {escrowId === null
              ? 'Three transactions: create, add milestones, then lock the STX.'
              : `Escrow #${escrowId}`}
          </p>
        </div>
      </div>

      <div className="progress-steps" style={{ display: 'flex', gap: '.5rem', marginBottom: '2rem' }}>
        {STEPS.map((s, i) => {
          const done = STEPS.indexOf(step) > i;
          const active = step === s;
          return (
            <div key={s} style={{ flex: 1 }}>
              <div style={{
                height: 3, borderRadius: 2,
                background: done || active ? 'var(--gold)' : 'var(--raised)',
                opacity: done ? 0.55 : 1,
              }} />
              <span style={{
                display: 'block', marginTop: '.4rem', fontSize: '.6875rem',
                fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase',
                letterSpacing: '.06em',
                color: active ? 'var(--gold)' : 'var(--muted)',
              }}>
                {s}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{
          background: 'var(--raised)', border: '1px solid var(--red)',
          borderRadius: 'var(--radius)', padding: '.75rem 1rem', marginBottom: '1.25rem',
          color: 'var(--red)', fontSize: '.875rem',
        }}>
          {error}
        </div>
      )}

      {busy && (
        <div className="loading" style={{ marginBottom: '1.25rem' }} aria-live="polite">
          {busy} — waiting for the transaction to be mined. Stacks blocks take ~10 minutes.
        </div>
      )}

      {step === 'parties' && (
        <div className="form-card">
          <label className="field">
            <span>Worker</span>
            <input value={worker} onChange={(e) => setWorker(e.target.value.trim())} placeholder="SP… address that will be paid" />
            {worker && !PRINCIPAL.test(worker) && <small style={{ color: 'var(--red)' }}>Not a Stacks address.</small>}
            {worker === address && worker && <small style={{ color: 'var(--red)' }}>The contract rejects escrows with yourself.</small>}
          </label>

          <label className="field">
            <span>Resolver</span>
            <input value={resolver} onChange={(e) => setResolver(e.target.value.trim())} placeholder="SP… address that settles disputes" />
            {resolver && !PRINCIPAL.test(resolver) && <small style={{ color: 'var(--red)' }}>Not a Stacks address.</small>}
            {resolver && resolver === worker && <small style={{ color: 'var(--red)' }}>Resolver and worker must differ.</small>}
          </label>

          <p style={{ fontSize: '.8125rem', color: 'var(--muted)', margin: '.5rem 0 1.25rem' }}>
            The deposit is the sum of the milestone amounts you set on the next step, so add those
            first if you have not decided the total.
          </p>

          {milestones.map((m, i) => (
            <div key={i} className="review-row" style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem' }}>
              <input
                style={{ flex: 3 }}
                value={m.description}
                maxLength={MAX_DESCRIPTION}
                onChange={(e) => setRow(i, 'description', e.target.value)}
                placeholder={`Milestone ${i + 1} deliverable`}
              />
              <input
                style={{ flex: 1 }}
                value={m.amount}
                inputMode="decimal"
                onChange={(e) => setRow(i, 'amount', e.target.value)}
                placeholder="STX"
              />
              {milestones.length > 1 && (
                <button type="button" className="btn-ghost" onClick={() => setMilestones((r) => r.filter((_, idx) => idx !== i))}>
                  ×
                </button>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.5rem' }}>
            <button
              type="button"
              className="btn-ghost"
              disabled={milestones.length >= MAX_MILESTONES}
              onClick={() => setMilestones((r) => [...r, { description: '', amount: '' }])}
            >
              + Milestone
            </button>
            <span className="total-row" style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: 'var(--gold)' }}>
              {totalStx > 0 ? `${microToSTX(depositMicro)} STX` : '—'}
            </span>
          </div>

          <button type="button" className="btn-primary" disabled={!partiesValid || !milestonesValid || !!busy} onClick={handleCreate}>
            Create escrow
          </button>
        </div>
      )}

      {step === 'milestones' && (
        <div className="form-card">
          <p style={{ marginBottom: '1rem' }}>
            Escrow #{escrowId} exists. Each milestone is its own transaction, signed in order.
          </p>
          <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
            {milestones.map((m, i) => (
              <li key={i} className="milestone-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '.625rem 0', borderBottom: '1px solid var(--border)' }}>
                <span>{i + 1}. {m.description}</span>
                <span style={{ color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace" }}>{m.amount} STX</span>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-primary" disabled={!!busy} onClick={handleAddMilestones}>
            Add {milestones.length} milestone{milestones.length === 1 ? '' : 's'}
          </button>
        </div>
      )}

      {step === 'activate' && (
        <div className="form-card">
          <p style={{ marginBottom: '.75rem' }}>
            Milestones are recorded. Activating transfers {microToSTX(depositMicro)} STX into the
            contract, where it stays until a milestone is approved or the escrow is cancelled.
          </p>
          <button type="button" className="btn-primary" disabled={!!busy} onClick={handleActivate}>
            Lock {microToSTX(depositMicro)} STX
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="form-card">
          <h2 style={{ marginBottom: '.5rem' }}>Escrow #{escrowId} is live</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.25rem' }}>
            The worker can submit the first milestone now.
          </p>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            <Link href={`/escrow/${escrowId}`} className="btn-primary">Open escrow</Link>
            <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          </div>
        </div>
      )}

      {txids.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <p style={{ fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'JetBrains Mono',monospace", marginBottom: '.5rem' }}>
            Transactions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
            {txids.map((t) => (
              <a key={t} href={explorerTxUrl(t)} target="_blank" rel="noreferrer"
                style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--gold)' }}>
                {t.slice(0, 12)}…{t.slice(-8)} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
