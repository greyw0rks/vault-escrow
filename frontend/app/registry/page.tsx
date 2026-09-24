'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import {
  fetchFactoryStats,
  fetchClientEscrowCount,
  fetchProviderEscrowCount,
  FACTORY_ID,
  explorerContract,
  type FactoryStats,
} from '@/lib/contract';
import { PRINCIPAL_RE } from '@/lib/config';
import { toSTX, toSTXFull, trunc } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Field } from '@/components/ui/field';
import { Stat } from '@/components/Stat';

export default function Registry() {
  const { address } = useApp();
  const [stats, setStats] = useState<FactoryStats | null>(null);
  const [query, setQuery] = useState('');
  const [lookup, setLookup] = useState<{ client: number; provider: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchFactoryStats().then(setStats).catch(() => setStats(null));
  }, []);

  async function run() {
    const target = query || address || '';
    if (!PRINCIPAL_RE.test(target)) return;
    setBusy(true);
    const [client, provider] = await Promise.all([
      fetchClientEscrowCount(target).catch(() => 0),
      fetchProviderEscrowCount(target).catch(() => 0),
    ]);
    setLookup({ client, provider });
    setBusy(false);
  }

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mb-8">
        <div className="tele mb-2">[ VAULTSTX-FACTORY / READ-ONLY REGISTRY ]</div>
        <h1 className="macro text-5xl md:text-6xl">REGISTRY</h1>
        <p className="mt-3 max-w-2xl text-sm text-fg-2">
          The factory contract is a separate on-chain escrow registry (client/provider model).
          It is surfaced here for discovery and protocol stats only — escrows are created and
          managed through the core VaultSTX escrow contract.
        </p>
      </div>

      <div className="mb-10 gridlines grid-cols-1 md:grid-cols-3">
        <Stat label="REGISTRY ESCROWS" value={stats ? stats.totalEscrows : '··'} accent />
        <Stat label="TOTAL VOLUME" value={stats ? toSTX(stats.totalVolume) : '····'} sub="LIFETIME uSTX" phosphor />
        <Stat label="NEXT ESCROW ID" value={stats ? stats.nextId : '··'} />
      </div>

      <div className="max-w-2xl">
        <div className="tele mb-3">[ ADDRESS LOOKUP ]</div>
        <div className="border-2 border-line bg-panel p-6">
          <Field label="STACKS PRINCIPAL" hint={query && !PRINCIPAL_RE.test(query) ? 'Not a valid principal.' : 'Count escrows registered to this address.'}>
            <Input value={query} onChange={(e) => setQuery(e.target.value.trim())} placeholder={address ?? 'SP…'} />
          </Field>
          <Button className="mt-4" disabled={busy || !PRINCIPAL_RE.test(query || address || '')} onClick={run}>
            {busy ? 'READING…' : 'QUERY REGISTRY »'}
          </Button>

          {lookup && (
            <dl className="mt-6 gridlines grid-cols-2 text-xs">
              <div className="bg-bg px-3 py-3">
                <dt className="mono text-[0.6rem] uppercase tracking-widest text-dim">AS CLIENT</dt>
                <dd className="macro mt-1 text-3xl">{lookup.client}</dd>
              </div>
              <div className="bg-bg px-3 py-3">
                <dt className="mono text-[0.6rem] uppercase tracking-widest text-dim">AS PROVIDER</dt>
                <dd className="macro mt-1 text-3xl">{lookup.provider}</dd>
              </div>
            </dl>
          )}
          {lookup && (
            <p className="mt-3 mono text-[0.65rem] uppercase tracking-widest text-dim">
              {trunc(query || address || '', 8, 8)} · TOTAL VOLUME REGISTRY-WIDE {stats ? toSTXFull(stats.totalVolume) : '—'} STX
            </p>
          )}
        </div>

        <a
          href={explorerContract(FACTORY_ID)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block mono text-[0.7rem] uppercase tracking-widest underline decoration-hazard decoration-2 underline-offset-2"
        >
          FACTORY CONTRACT » {FACTORY_ID || '— NOT CONFIGURED —'}
        </a>
      </div>
    </div>
  );
}
