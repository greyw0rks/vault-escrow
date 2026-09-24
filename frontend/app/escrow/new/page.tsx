'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  buildCreateEscrow,
  buildAddMilestone,
  buildActivateEscrow,
} from '@/lib/contract';
import { PRINCIPAL_RE, MAX_MILESTONES, MS_DESC_MAX } from '@/lib/config';
import { stxToMicro, toSTX, unitId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/field';
import { ConnectWall } from '@/components/ConnectWall';
import { MilestoneBadge } from '@/components/ui/badge';

interface Draft {
  description: string;
  amount: bigint;
}

type Phase = 'parties' | 'milestones';

export default function NewEscrow() {
  const router = useRouter();
  const { connected, address, submit } = useApp();

  const [phase, setPhase] = useState<Phase>('parties');
  const [escrowId, setEscrowId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  // Party step
  const [worker, setWorker] = useState('');
  const [resolver, setResolver] = useState('');
  const [deposit, setDeposit] = useState('');

  // Milestone step
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [msDesc, setMsDesc] = useState('');
  const [msAmount, setMsAmount] = useState('');

  if (!connected) {
    return (
      <div className="px-6 py-10 md:px-10">
        <ConnectWall message="CONNECT A STACKS WALLET TO OPEN AN ESCROW" />
      </div>
    );
  }

  const workerOk = PRINCIPAL_RE.test(worker) && worker !== address;
  const resolverOk = PRINCIPAL_RE.test(resolver) && resolver !== address && resolver !== worker;
  let depositMicro = 0n;
  try { depositMicro = deposit ? stxToMicro(deposit) : 0n; } catch { /* invalid */ }
  const partiesOk = workerOk && resolverOk && depositMicro > 0n;

  const totalMilestones = drafts.reduce((s, d) => s + d.amount, 0n);

  async function createEscrow() {
    setBusy(true);
    const res = await submit(buildCreateEscrow(worker, resolver, depositMicro), 'Create escrow');
    setBusy(false);
    if (res?.status === 'success' && res.okId !== null) {
      setEscrowId(res.okId);
      setPhase('milestones');
    }
  }

  async function addMilestone() {
    let amt = 0n;
    try { amt = stxToMicro(msAmount); } catch { return; }
    if (escrowId === null || !msDesc || amt <= 0n) return;
    setBusy(true);
    const res = await submit(buildAddMilestone(escrowId, msDesc, amt), `Add milestone ${drafts.length}`);
    setBusy(false);
    if (res?.status === 'success') {
      setDrafts((d) => [...d, { description: msDesc, amount: amt }]);
      setMsDesc('');
      setMsAmount('');
    }
  }

  async function activate() {
    if (escrowId === null) return;
    setBusy(true);
    const res = await submit(buildActivateEscrow(escrowId), 'Activate escrow');
    setBusy(false);
    if (res?.status === 'success') router.push(`/escrow/${escrowId}`);
  }

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mb-8">
        <div className="tele mb-2">[ ESCROW / NEW ]</div>
        <h1 className="macro text-5xl md:text-6xl">OPEN A VAULT</h1>
      </div>

      {/* STEP RAIL */}
      <div className="mb-8 flex gap-px bg-line">
        {(['parties', 'milestones'] as const).map((p, i) => (
          <div
            key={p}
            className={`flex-1 bg-panel px-4 py-3 mono text-[0.7rem] font-bold uppercase tracking-widest ${
              phase === p ? 'text-hazard' : 'text-dim'
            }`}
          >
            {i + 1} / {p === 'parties' ? 'PARTIES + DEPOSIT' : 'MILESTONES + ACTIVATE'}
          </div>
        ))}
      </div>

      {phase === 'parties' ? (
        <div className="max-w-2xl space-y-5 border-2 border-line bg-panel p-6">
          <Field label="WORKER PRINCIPAL" hint={worker && !workerOk ? 'Invalid principal, or same as you.' : 'Who gets paid on approval.'}>
            <Input value={worker} onChange={(e) => setWorker(e.target.value.trim())} placeholder="SP…" />
          </Field>
          <Field label="RESOLVER PRINCIPAL" hint={resolver && !resolverOk ? 'Invalid, or same as you / the worker.' : 'Neutral party who settles disputes.'}>
            <Input value={resolver} onChange={(e) => setResolver(e.target.value.trim())} placeholder="SP…" />
          </Field>
          <Field label="INITIAL DEPOSIT (STX)" hint="Locked immediately. You can top up to cover milestones at activation.">
            <Input value={deposit} onChange={(e) => setDeposit(e.target.value)} inputMode="decimal" placeholder="0.000000" />
          </Field>
          <Button disabled={!partiesOk || busy} onClick={createEscrow}>
            {busy ? 'BROADCASTING…' : 'CREATE + DEPOSIT »'}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-5 border-2 border-line bg-panel p-6">
            <div className="mono text-[0.7rem] uppercase tracking-widest text-dim">
              ESCROW {escrowId !== null ? unitId('VLT', escrowId) : '—'} CREATED
            </div>
            <Field
              label="MILESTONE DESCRIPTION"
              count={`${msDesc.length}/${MS_DESC_MAX}`}
              hint={`Up to ${MAX_MILESTONES} milestones. ${drafts.length} added.`}
            >
              <Textarea
                rows={3}
                maxLength={MS_DESC_MAX}
                value={msDesc}
                onChange={(e) => setMsDesc(e.target.value)}
                placeholder="Deliver the …"
              />
            </Field>
            <Field label="MILESTONE AMOUNT (STX)">
              <Input value={msAmount} onChange={(e) => setMsAmount(e.target.value)} inputMode="decimal" placeholder="0.000000" />
            </Field>
            <Button
              variant="outline"
              disabled={busy || !msDesc || !msAmount || drafts.length >= MAX_MILESTONES}
              onClick={addMilestone}
            >
              {busy ? 'WORKING…' : 'ADD MILESTONE +'}
            </Button>
          </div>

          <div className="border-2 border-line bg-panel p-6">
            <div className="tele mb-3">LEDGER PREVIEW</div>
            {drafts.length === 0 ? (
              <p className="mono text-[0.7rem] uppercase tracking-widest text-dim">NO MILESTONES ADDED YET</p>
            ) : (
              <ol className="space-y-2">
                {drafts.map((d, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 border-b border-line pb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="mono text-[0.6rem] tracking-widest text-dim">{unitId('MS', i)}</span>
                        <MilestoneBadge state="pending" />
                      </div>
                      <p className="mt-1 break-words text-xs text-fg-2">{d.description}</p>
                    </div>
                    <span className="mono shrink-0 text-sm text-fg">{toSTX(d.amount)}</span>
                  </li>
                ))}
              </ol>
            )}
            <hr className="rule my-4" />
            <dl className="mono space-y-1 text-xs">
              <div className="flex justify-between"><dt className="text-dim">MILESTONE TOTAL</dt><dd>{toSTX(totalMilestones)} STX</dd></div>
              <div className="flex justify-between"><dt className="text-dim">DEPOSITED</dt><dd>{toSTX(depositMicro)} STX</dd></div>
            </dl>
            <Button
              className="mt-5 w-full"
              disabled={busy || drafts.length === 0}
              onClick={activate}
            >
              {busy ? 'BROADCASTING…' : 'ACTIVATE ESCROW »'}
            </Button>
            <p className="mt-2 mono text-[0.65rem] uppercase tracking-widest text-dim">
              Activation locks funds & tops up any shortfall vs. milestone total.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
