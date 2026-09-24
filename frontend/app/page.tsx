'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import {
  fetchFactoryStats,
  fetchEscrowCount,
  fetchEscrowPage,
  type Escrow,
  type FactoryStats,
} from '@/lib/contract';
import { toSTX } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Stat } from '@/components/Stat';
import { EscrowCard } from '@/components/EscrowCard';

export default function Home() {
  const { connected, connect } = useApp();
  const [count, setCount] = useState<number | null>(null);
  const [stats, setStats] = useState<FactoryStats | null>(null);
  const [featured, setFeatured] = useState<Escrow[]>([]);

  useEffect(() => {
    fetchEscrowCount().then(setCount).catch(() => setCount(0));
    fetchFactoryStats().then(setStats).catch(() => setStats(null));
    fetchEscrowPage(0)
      .then((es) => setFeatured(es.slice(0, 3)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="border-b-2 border-line">
        <div className="hazard-stripe h-4" />
        <div className="grid gap-px bg-line lg:grid-cols-[1.6fr_1fr]">
          <div className="bg-bg px-6 py-14 md:px-10 md:py-20">
            <div className="tele mb-4">[ TRUSTLESS ESCROW UNIT / STACKS MAINNET ]</div>
            <h1 className="macro text-[clamp(3.5rem,11vw,10rem)]">
              LOCK<br />THE <span className="text-hazard">VAULT</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-snug text-fg-2">
              STX escrowed per milestone. Funds release only on approval — or a resolver
              settles the dispute. No custody, no middleman, all on-chain.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard"><Button size="lg">OPEN DASHBOARD »</Button></Link>
              {connected
                ? <Link href="/escrow/new"><Button size="lg" variant="outline">NEW ESCROW +</Button></Link>
                : <Button size="lg" variant="outline" onClick={connect}>CONNECT WALLET</Button>}
            </div>
          </div>

          <div className="grid grid-rows-3 gap-px bg-line">
            <Stat label="TOTAL ESCROWS" value={count === null ? '····' : count} accent />
            <Stat
              label="STX HELD / VOLUME"
              value={stats ? toSTX(stats.totalVolume) : '····'}
              sub="LIFETIME uSTX ESCROWED"
              phosphor
            />
            <Stat
              label="REGISTRY ESCROWS"
              value={stats ? stats.totalEscrows : '··'}
              sub="FACTORY-TRACKED"
            />
          </div>
        </div>
      </section>

      {/* PROTOCOL */}
      <section className="border-b-2 border-line px-6 py-12 md:px-10">
        <div className="tele mb-6">[ PROTOCOL / 03 STEPS ]</div>
        <div className="gridlines md:grid-cols-3">
          {[
            { n: '01', t: 'FUND', d: 'Client opens an escrow, names a worker and a resolver, and deposits STX. Add up to 20 milestones, then activate to lock funds.' },
            { n: '02', t: 'DELIVER', d: 'Worker submits each milestone. Client approves to release its STX — payment is atomic and on-chain.' },
            { n: '03', t: 'RESOLVE', d: 'Either party can dispute a submitted milestone. The named resolver decides who the locked STX goes to.' },
          ].map((s) => (
            <div key={s.n} className="p-6">
              <div className="macro text-6xl text-hazard">{s.n}</div>
              <div className="macro mt-3 text-2xl">{s.t}</div>
              <p className="mt-2 text-sm text-fg-2">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT */}
      {featured.length > 0 && (
        <section className="px-6 py-12 md:px-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="macro text-3xl">RECENT VAULTS</h2>
            <Link href="/dashboard" className="mono text-[0.7rem] font-bold uppercase tracking-widest underline decoration-hazard decoration-2 underline-offset-4">
              ALL ESCROWS »
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => <EscrowCard key={e.id} e={e} />)}
          </div>
        </section>
      )}
    </div>
  );
}
