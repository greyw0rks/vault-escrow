'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import {
  fetchDisputeStats,
  fetchDisputePage,
  buildOpenDispute,
  buildResolveDispute,
  buildWithdrawDispute,
  type Dispute,
  type DisputeStats,
} from '@/lib/contract';
import { PRINCIPAL_RE, DISPUTE_REASON_MAX, DISPUTE_NOTES_MAX } from '@/lib/config';
import { stxToMicro, toSTX, trunc, unitId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/field';
import { DisputeBadge } from '@/components/ui/badge';
import { Stat } from '@/components/Stat';
import { ConnectWall } from '@/components/ConnectWall';

export default function DisputesPage() {
  const { connected, address, submit, refreshKey } = useApp();
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, list] = await Promise.all([
      fetchDisputeStats().catch(() => null),
      fetchDisputePage(0).catch(() => [] as Dispute[]),
    ]);
    setStats(s);
    setDisputes(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, refreshKey]);

  const isArbitrator = connected && !!stats && address === stats.arbitrator;

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mb-8">
        <div className="tele mb-2">[ VAULTSTX-DISPUTE / ARBITRATION LAYER ]</div>
        <h1 className="macro text-5xl md:text-6xl">DISPUTE CENTER</h1>
      </div>

      <div className="mb-8 gridlines grid-cols-2 md:grid-cols-4">
        <Stat label="TOTAL DISPUTES" value={stats ? stats.total : '··'} accent />
        <Stat label="RESOLVED" value={stats ? stats.resolved : '··'} />
        <Stat label="ARBITRATION FEE" value={stats ? toSTX(stats.fee) : '··'} sub="STX PER FILING" />
        <Stat label="ARBITRATOR" value={stats ? trunc(stats.arbitrator, 4, 4) : '····'} sub={isArbitrator ? 'THAT IS YOU' : 'NEUTRAL PARTY'} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* OPEN A DISPUTE */}
        <div>
          <div className="tele mb-3">[ FILE A DISPUTE ]</div>
          {connected ? (
            <OpenDisputeForm submit={submit} onDone={load} fee={stats?.fee ?? 0n} />
          ) : (
            <ConnectWall message="CONNECT A WALLET TO FILE OR RESOLVE A DISPUTE" />
          )}
        </div>

        {/* LEDGER */}
        <div>
          <div className="tele mb-3">[ DISPUTE LEDGER ]</div>
          {loading ? (
            <p className="mono text-[0.7rem] uppercase tracking-widest text-dim blink">READING CHAIN…</p>
          ) : disputes.length === 0 ? (
            <p className="border-2 border-line bg-panel-2 p-8 text-center mono text-[0.7rem] uppercase tracking-widest text-dim">
              NO DISPUTES FILED YET
            </p>
          ) : (
            <div className="space-y-4">
              {disputes.map((d) => (
                <DisputeItem
                  key={d.id}
                  d={d}
                  address={address}
                  isArbitrator={isArbitrator}
                  busy={busy}
                  setBusy={setBusy}
                  submit={submit}
                  onDone={load}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-bg px-3 py-2">
      <dt className="mono text-[0.6rem] uppercase tracking-widest text-dim">{k}</dt>
      <dd className="mono mt-0.5 text-sm font-bold text-fg">{v}</dd>
    </div>
  );
}

type SubmitFn = ReturnType<typeof useApp>['submit'];

function parseMicro(s: string): bigint | null {
  try { return stxToMicro(s); } catch { return null; }
}

function OpenDisputeForm({ submit, onDone, fee }: { submit: SubmitFn; onDone: () => void; fee: bigint }) {
  const [escrowId, setEscrowId] = useState('');
  const [client, setClient] = useState('');
  const [provider, setProvider] = useState('');
  const [disputed, setDisputed] = useState('');
  const [clientClaim, setClientClaim] = useState('');
  const [providerClaim, setProviderClaim] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const d = parseMicro(disputed);
  const cc = parseMicro(clientClaim);
  const pc = parseMicro(providerClaim);
  const sumsOk = d !== null && cc !== null && pc !== null && cc + pc === d && d > 0n;
  const ok =
    /^\d+$/.test(escrowId) &&
    PRINCIPAL_RE.test(client) &&
    PRINCIPAL_RE.test(provider) &&
    sumsOk &&
    reason.length > 0;

  async function file() {
    if (!ok || d === null || cc === null || pc === null) return;
    setBusy(true);
    const res = await submit(
      buildOpenDispute(Number(escrowId), client, provider, d, cc, pc, reason),
      'Open dispute',
    );
    setBusy(false);
    if (res?.status === 'success') {
      setEscrowId(''); setClient(''); setProvider(''); setDisputed('');
      setClientClaim(''); setProviderClaim(''); setReason('');
      setTimeout(onDone, 1500);
    }
  }

  return (
    <div className="space-y-4 border-2 border-line bg-panel p-6">
      <Field label="ESCROW ID" hint="The escrow this dispute concerns.">
        <Input value={escrowId} onChange={(e) => setEscrowId(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="0" />
      </Field>
      <Field label="CLIENT PRINCIPAL">
        <Input value={client} onChange={(e) => setClient(e.target.value.trim())} placeholder="SP…" />
      </Field>
      <Field label="PROVIDER PRINCIPAL">
        <Input value={provider} onChange={(e) => setProvider(e.target.value.trim())} placeholder="SP…" />
      </Field>
      <Field label="DISPUTED AMOUNT (STX)">
        <Input value={disputed} onChange={(e) => setDisputed(e.target.value)} inputMode="decimal" placeholder="0.000000" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="CLIENT CLAIM (STX)">
          <Input value={clientClaim} onChange={(e) => setClientClaim(e.target.value)} inputMode="decimal" placeholder="0" />
        </Field>
        <Field label="PROVIDER CLAIM (STX)">
          <Input value={providerClaim} onChange={(e) => setProviderClaim(e.target.value)} inputMode="decimal" placeholder="0" />
        </Field>
      </div>
      {!sumsOk && (disputed || clientClaim || providerClaim) && (
        <p className="mono text-[0.65rem] uppercase tracking-widest text-hazard">CLAIMS MUST SUM TO THE DISPUTED AMOUNT</p>
      )}
      <Field label="REASON" count={`${reason.length}/${DISPUTE_REASON_MAX}`}>
        <Textarea rows={3} maxLength={DISPUTE_REASON_MAX} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Milestone 2 was never delivered…" />
      </Field>
      <Button disabled={!ok || busy} onClick={file} className="w-full">
        {busy ? 'BROADCASTING…' : `FILE DISPUTE » PAYS ${toSTX(fee)} STX`}
      </Button>
      <p className="mono text-[0.6rem] uppercase tracking-widest text-dim">
        Caller must be the named client or provider. The arbitration fee is non-refundable.
      </p>
    </div>
  );
}

function DisputeItem({
  d, address, isArbitrator, busy, setBusy, submit, onDone,
}: {
  d: Dispute;
  address: string | null;
  isArbitrator: boolean;
  busy: string | null;
  setBusy: (v: string | null) => void;
  submit: SubmitFn;
  onDone: () => void;
}) {
  const [clientAward, setClientAward] = useState('');
  const [providerAward, setProviderAward] = useState('');
  const [notes, setNotes] = useState('');

  const ca = parseMicro(clientAward);
  const pa = parseMicro(providerAward);
  const awardsOk = ca !== null && pa !== null && ca + pa === d.disputedAmount;
  const isOpener = address === d.opener;

  async function resolve() {
    if (!awardsOk || ca === null || pa === null) return;
    setBusy(`res-${d.id}`);
    const res = await submit(buildResolveDispute(d.id, ca, pa, notes), `Resolve dispute ${d.id}`);
    setBusy(null);
    if (res?.status === 'success') setTimeout(onDone, 1500);
  }

  async function withdraw() {
    setBusy(`wd-${d.id}`);
    const res = await submit(buildWithdrawDispute(d.id), `Withdraw dispute ${d.id}`);
    setBusy(null);
    if (res?.status === 'success') setTimeout(onDone, 1500);
  }

  return (
    <div className="border-2 border-line bg-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mono text-[0.65rem] font-bold tracking-widest text-dim">
            {unitId('DSP', d.id)} · ESCROW {unitId('VLT', d.escrowId)}
          </div>
          <div className="macro mt-1 text-3xl">{toSTX(d.disputedAmount)} <span className="text-lg text-dim">STX</span></div>
        </div>
        <DisputeBadge state={d.state} />
      </div>

      <p className="mt-3 break-words text-sm text-fg-2">{d.reason || '—'}</p>

      <dl className="mt-4 gridlines grid-cols-2 text-xs">
        <Meta k="CLIENT CLAIM" v={toSTX(d.clientClaim)} />
        <Meta k="PROVIDER CLAIM" v={toSTX(d.providerClaim)} />
        {d.state === 'resolved' && <Meta k="CLIENT AWARD" v={toSTX(d.clientAward)} />}
        {d.state === 'resolved' && <Meta k="PROVIDER AWARD" v={toSTX(d.providerAward)} />}
      </dl>

      {d.state === 'resolved' && d.notes && (
        <p className="mt-3 border-l-2 border-line pl-3 text-xs text-fg-2">RULING: {d.notes}</p>
      )}

      {d.state === 'open' && isArbitrator && (
        <div className="mt-4 space-y-3 border-t-2 border-line pt-4">
          <div className="tele">[ ARBITRATOR RULING ]</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CLIENT AWARD (STX)"><Input value={clientAward} onChange={(e) => setClientAward(e.target.value)} inputMode="decimal" placeholder="0" /></Field>
            <Field label="PROVIDER AWARD (STX)"><Input value={providerAward} onChange={(e) => setProviderAward(e.target.value)} inputMode="decimal" placeholder="0" /></Field>
          </div>
          {!awardsOk && (clientAward || providerAward) && (
            <p className="mono text-[0.65rem] uppercase tracking-widest text-hazard">AWARDS MUST SUM TO {toSTX(d.disputedAmount)} STX</p>
          )}
          <Field label="RESOLUTION NOTES" count={`${notes.length}/${DISPUTE_NOTES_MAX}`}>
            <Textarea rows={2} maxLength={DISPUTE_NOTES_MAX} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <Button className="w-full" disabled={!awardsOk || busy !== null} onClick={resolve}>
            {busy === `res-${d.id}` ? 'BROADCASTING…' : 'RECORD RULING »'}
          </Button>
        </div>
      )}

      {d.state === 'open' && isOpener && !isArbitrator && (
        <Button className="mt-4 w-full" variant="hazard" disabled={busy !== null} onClick={withdraw}>
          {busy === `wd-${d.id}` ? 'BROADCASTING…' : 'WITHDRAW DISPUTE ✕'}
        </Button>
      )}
    </div>
  );
}



