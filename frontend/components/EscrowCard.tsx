import Link from 'next/link';
import type { Escrow } from '@/lib/contract';
import { EscrowBadge } from './ui/badge';
import { toSTX, trunc, unitId, pct } from '@/lib/utils';

/** Released-vs-total progress rail — ink fill on a line track. */
function FundRail({ released, total }: { released: bigint; total: bigint }) {
  const p = pct(released, total);
  return (
    <div className="border-2 border-line bg-panel-2">
      <div className="flex h-3">
        <div className="bg-fg" style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

export function EscrowCard({ e }: { e: Escrow }) {
  const displayTotal = e.state === 'open' ? e.deposited : e.totalAmount;
  return (
    <Link
      href={`/escrow/${e.id}`}
      className="group flex flex-col border-2 border-line bg-panel p-5 hover:bg-panel-2"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="mono text-[0.7rem] font-bold tracking-widest text-dim">
          {unitId('VLT', e.id)}
        </span>
        <EscrowBadge state={e.state} />
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="macro text-4xl leading-none group-hover:text-hazard">
          {toSTX(displayTotal)}
        </span>
        <span className="mono text-[0.7rem] uppercase tracking-widest text-dim">STX</span>
      </div>

      <div className="mt-1 mono text-[0.7rem] uppercase tracking-widest text-dim">
        {toSTX(e.released)} released · {e.milestoneCount} milestone{e.milestoneCount === 1 ? '' : 's'}
      </div>

      <div className="mt-4">
        <FundRail released={e.released} total={e.totalAmount} />
      </div>

      <hr className="rule my-4" />

      <dl className="grid grid-cols-3 gap-2 mono text-[0.65rem] uppercase tracking-widest">
        <div>
          <dt className="text-dim">CLIENT</dt>
          <dd className="text-fg">{trunc(e.client, 4, 4)}</dd>
        </div>
        <div>
          <dt className="text-dim">WORKER</dt>
          <dd className="text-fg">{trunc(e.worker, 4, 4)}</dd>
        </div>
        <div>
          <dt className="text-dim">RESOLVER</dt>
          <dd className="text-fg">{trunc(e.resolver, 4, 4)}</dd>
        </div>
      </dl>
    </Link>
  );
}
