import type { Milestone } from '@/lib/contract';
import { MilestoneBadge } from './ui/badge';
import { toSTX, unitId } from '@/lib/utils';
import { cn } from '@/lib/cn';

/** One milestone in the escrow ledger. `active` marks the current work item;
 *  `actions` is a role-aware slot filled by the detail page. */
export function MilestoneRow({
  m, active, actions,
}: {
  m: Milestone;
  active?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn('bg-panel p-4', active && 'border-l-2 border-hazard')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="mono text-[0.65rem] font-bold tracking-widest text-dim">
              {unitId('MS', m.index)}
            </span>
            <MilestoneBadge state={m.state} />
          </div>
          <p className="mt-1.5 break-words text-sm text-fg-2">{m.description || '—'}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="mono text-lg font-bold text-fg">{toSTX(m.amount)}</div>
          <div className="mono text-[0.6rem] uppercase tracking-widest text-dim">STX</div>
        </div>
      </div>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
