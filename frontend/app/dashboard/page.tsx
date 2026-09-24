'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import {
  fetchEscrowCount,
  fetchEscrowPage,
  fetchEscrowsForAddress,
  type Escrow,
} from '@/lib/contract';
import { SCAN_WINDOW } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Stat } from '@/components/Stat';
import { EscrowCard } from '@/components/EscrowCard';
import { cn } from '@/lib/cn';

type Tab = 'newest' | 'mine';

export default function Dashboard() {
  const { address, connected, refreshKey } = useApp();
  const [tab, setTab] = useState<Tab>('newest');
  const [count, setCount] = useState<number | null>(null);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  // Newest tab pages through chain; "mine" scans a window and filters by role.
  const loadNewest = useCallback(async (p: number) => {
    setLoading(true);
    const batch = await fetchEscrowPage(p);
    setEscrows((prev) => (p === 0 ? batch : [...prev, ...batch]));
    setDone(batch.length < 24);
    setLoading(false);
  }, []);

  const loadMine = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    const mine = await fetchEscrowsForAddress(address, SCAN_WINDOW);
    setEscrows(mine);
    setDone(true);
    setLoading(false);
  }, [address]);

  useEffect(() => {
    fetchEscrowCount().then(setCount).catch(() => setCount(0));
  }, [refreshKey]);

  // Reset + (re)load whenever the tab or a confirmed tx changes.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setPage(0);
    setEscrows([]);
    setDone(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    if (tab === 'newest') loadNewest(0);
    else loadMine();
  }, [tab, refreshKey, loadNewest, loadMine]);

  const active = escrows.filter((e) => e.state === 'active').length;
  const disputed = escrows.filter((e) => e.state === 'disputed').length;

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="tele mb-2">[ ESCROW REGISTRY ]</div>
          <h1 className="macro text-5xl md:text-6xl">DASHBOARD</h1>
        </div>
        <Link href="/escrow/new"><Button size="lg">NEW ESCROW +</Button></Link>
      </div>

      <div className="mb-8 gridlines grid-cols-2 md:grid-cols-4">
        <Stat label="TOTAL ESCROWS" value={count === null ? '····' : count} accent />
        <Stat label="ACTIVE (LOADED)" value={loading ? '··' : active} />
        <Stat label="DISPUTED (LOADED)" value={loading ? '··' : disputed} />
        <Stat label="LOADED" value={escrows.length} sub="ON THIS PAGE" />
      </div>

      {/* TABS */}
      <div className="mb-6 flex border-b-2 border-line">
        {([['newest', 'NEWEST'], ['mine', 'MY ESCROWS']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'border-r-2 border-line px-5 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-widest',
              tab === t ? 'bg-fg text-bg' : 'text-fg-2 hover:bg-panel-2 hover:text-fg',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'mine' && !connected ? (
        <p className="border-2 border-line bg-panel-2 p-8 text-center mono text-[0.7rem] uppercase tracking-widest text-dim">
          CONNECT A WALLET TO SCAN YOUR ESCROWS
        </p>
      ) : escrows.length === 0 && !loading ? (
        <p className="border-2 border-line bg-panel-2 p-8 text-center mono text-[0.7rem] uppercase tracking-widest text-dim">
          {tab === 'mine' ? `NO ESCROWS FOUND IN THE LAST ${SCAN_WINDOW}` : 'NO ESCROWS ON CHAIN YET'}
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {escrows.map((e) => <EscrowCard key={e.id} e={e} />)}
        </div>
      )}

      {tab === 'newest' && !done && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => {
              const next = page + 1;
              setPage(next);
              loadNewest(next);
            }}
          >
            {loading ? 'LOADING…' : 'LOAD MORE »'}
          </Button>
        </div>
      )}
    </div>
  );
}
