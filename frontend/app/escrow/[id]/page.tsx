'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import {
  fetchEscrow,
  fetchMilestones,
  fetchRemaining,
  buildSubmitMilestone,
  buildApproveMilestone,
  buildRaiseDispute,
  buildResolveMilestone,
  buildActivateEscrow,
  buildCancelEscrow,
  explorerAddress,
  type Escrow,
  type Milestone,
} from '@/lib/contract';
import { toSTX, trunc, unitId } from '@/lib/utils';
import { EscrowBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MilestoneRow } from '@/components/MilestoneRow';

export default function EscrowDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { connected, address, submit, refreshKey } = useApp();

  const [e, setE] = useState<Escrow | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [remaining, setRemaining] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const esc = await fetchEscrow(id).catch(() => null);
    setE(esc);
    if (esc) {
      fetchMilestones(esc).then(setMilestones).catch(() => setMilestones([]));
      fetchRemaining(id).then(setRemaining).catch(() => setRemaining(0n));
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, refreshKey]);

  async function act(key: string, call: Parameters<typeof submit>[0], label: string) {
    setBusy(key);
    await submit(call, label);
    setBusy(null);
    setTimeout(load, 1500);
  }

  if (loading) {
    return <div className="px-6 py-24 text-center macro text-3xl md:px-10"><span className="blink">READING CHAIN…</span></div>;
  }
  if (!e) {
    return (
      <div className="px-6 py-24 text-center md:px-10">
        <div className="macro text-4xl">VAULT NOT FOUND</div>
        <p className="mt-2 mono text-[0.7rem] uppercase tracking-widest text-dim">{unitId('VLT', id)} DOES NOT EXIST ON CHAIN</p>
        <Link href="/dashboard"><Button className="mt-5" variant="outline">« BACK TO DASHBOARD</Button></Link>
      </div>
    );
  }

  const isClient = connected && address === e.client;
  const isWorker = connected && address === e.worker;
  const isResolver = connected && address === e.resolver;
  const role = isClient ? 'CLIENT' : isWorker ? 'WORKER' : isResolver ? 'RESOLVER' : 'OBSERVER';

  return (
    <div className="px-6 py-10 md:px-10">
      <Link href="/dashboard" className="mono text-[0.7rem] font-bold uppercase tracking-widest text-dim hover:text-hazard">
        « DASHBOARD
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="tele mb-2">{unitId('VLT', e.id)} / YOU ARE {role}</div>
          <h1 className="macro text-5xl md:text-6xl">
            {toSTX(e.state === 'open' ? e.deposited : e.totalAmount)}
            <span className="ml-2 text-2xl text-dim">STX</span>
          </h1>
        </div>
        <EscrowBadge state={e.state} className="text-sm" />
      </div>

      <hr className="rule my-6" />

      <div className="grid gap-px bg-line lg:grid-cols-[1.6fr_1fr]">
        {/* LEFT: milestone ledger */}
        <div className="space-y-3 bg-bg p-6">
          <div className="tele mb-1">[ MILESTONE LEDGER ]</div>
          {milestones.length === 0 ? (
            <p className="mono text-[0.7rem] uppercase tracking-widest text-dim">NO MILESTONES</p>
          ) : (
            milestones.map((m) => {
              const isActive = m.index === e.activeMilestone && e.state === 'active';
              const canSubmit = isWorker && e.state === 'active' && m.state === 'pending' && m.index === e.activeMilestone;
              const canApprove = isClient && e.state === 'active' && m.state === 'submitted';
              const canDispute = (isClient || isWorker) && e.state === 'active' && m.state === 'submitted';
              const canResolve = isResolver && e.state === 'disputed' && m.state === 'disputed';
              return (
                <MilestoneRow
                  key={m.index}
                  m={m}
                  active={isActive}
                  actions={
                    <>
                      {canSubmit && (
                        <Button size="sm" disabled={busy !== null}
                          onClick={() => act(`sub-${m.index}`, buildSubmitMilestone(id, m.index), `Submit MS-${m.index}`)}>
                          {busy === `sub-${m.index}` ? '···' : 'SUBMIT ▲'}
                        </Button>
                      )}
                      {canApprove && (
                        <Button size="sm" disabled={busy !== null}
                          onClick={() => act(`app-${m.index}`, buildApproveMilestone(id, m.index), `Approve MS-${m.index}`)}>
                          {busy === `app-${m.index}` ? '···' : 'APPROVE ✓'}
                        </Button>
                      )}
                      {canDispute && (
                        <Button size="sm" variant="hazard" disabled={busy !== null}
                          onClick={() => act(`dis-${m.index}`, buildRaiseDispute(id, m.index), `Dispute MS-${m.index}`)}>
                          {busy === `dis-${m.index}` ? '···' : 'DISPUTE !'}
                        </Button>
                      )}
                      {canResolve && (
                        <>
                          <Button size="sm" disabled={busy !== null}
                            onClick={() => act(`rw-${m.index}`, buildResolveMilestone(id, m.index, true), `Release MS-${m.index} to worker`)}>
                            {busy === `rw-${m.index}` ? '···' : 'PAY WORKER »'}
                          </Button>
                          <Button size="sm" variant="hazard" disabled={busy !== null}
                            onClick={() => act(`rc-${m.index}`, buildResolveMilestone(id, m.index, false), `Refund MS-${m.index} to client`)}>
                            {busy === `rc-${m.index}` ? '···' : 'REFUND CLIENT ✕'}
                          </Button>
                        </>
                      )}
                    </>
                  }
                />
              );
            })
          )}
        </div>

        {/* RIGHT: actions + metadata */}
        <div className="space-y-6 bg-bg p-6">
          {isClient && e.state === 'open' && (
            <div className="space-y-2">
              <div className="tele mb-1">[ CLIENT CONTROLS ]</div>
              <Button className="w-full" disabled={busy !== null || e.milestoneCount === 0}
                onClick={() => act('activate', buildActivateEscrow(id), 'Activate escrow')}>
                {busy === 'activate' ? 'AWAITING WALLET…' : 'ACTIVATE ESCROW »'}
              </Button>
              <Button className="w-full" variant="hazard" disabled={busy !== null}
                onClick={() => act('cancel', buildCancelEscrow(id), 'Cancel escrow')}>
                {busy === 'cancel' ? 'AWAITING WALLET…' : 'CANCEL + REFUND ✕'}
              </Button>
              {e.milestoneCount === 0 && (
                <p className="mono text-[0.65rem] uppercase tracking-widest text-dim">ADD A MILESTONE BEFORE ACTIVATING</p>
              )}
            </div>
          )}

          <div>
            <div className="tele mb-2">[ FUNDS ]</div>
            <dl className="gridlines grid-cols-2 text-xs">
              <Meta k="TOTAL" v={`${toSTX(e.totalAmount)}`} />
              <Meta k="DEPOSITED" v={`${toSTX(e.deposited)}`} />
              <Meta k="RELEASED" v={`${toSTX(e.released)}`} />
              <Meta k="REMAINING" v={`${toSTX(remaining)}`} phosphor />
            </dl>
          </div>

          <div>
            <div className="tele mb-2">[ PARTIES ]</div>
            <dl className="space-y-2 text-xs">
              {([['CLIENT', e.client], ['WORKER', e.worker], ['RESOLVER', e.resolver]] as const).map(([k, v]) => (
                <div key={k}>
                  <dt className="mono text-[0.6rem] uppercase tracking-widest text-dim">{k}</dt>
                  <dd>
                    <a href={explorerAddress(v)} target="_blank" rel="noreferrer"
                      className="mono break-all text-fg underline decoration-hazard decoration-2 underline-offset-2">
                      {trunc(v, 8, 8)}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="tele mb-2">[ METADATA ]</div>
            <dl className="gridlines grid-cols-2 text-xs">
              <Meta k="STATE" v={e.state.toUpperCase()} />
              <Meta k="ACTIVE MS" v={String(e.activeMilestone)} />
              <Meta k="MILESTONES" v={String(e.milestoneCount)} />
              <Meta k="CREATED @" v={String(e.createdAt)} />
            </dl>
          </div>

          {e.state === 'disputed' && (
            <Link href="/disputes" className="mono block text-[0.7rem] uppercase tracking-widest underline decoration-hazard decoration-2 underline-offset-2">
              » ESCALATE TO ARBITRATION CENTER
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v, phosphor }: { k: string; v: string; phosphor?: boolean }) {
  return (
    <div className="bg-bg px-3 py-2">
      <dt className="mono text-[0.6rem] uppercase tracking-widest text-dim">{k}</dt>
      <dd className={`mono mt-0.5 text-sm font-bold ${phosphor ? 'phosphor' : 'text-fg'}`}>{v}</dd>
    </div>
  );
}
