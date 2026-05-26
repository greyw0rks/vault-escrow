import type { Escrow } from '@/lib/contract';

export function MilestoneProgress({ escrow, approved }: { escrow: Escrow; approved: number }) {
  const pct = escrow.milestoneCount > 0
    ? Math.round((approved / escrow.milestoneCount) * 100) : 0;
  return (
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>
      {approved}/{escrow.milestoneCount} milestones · {pct}%
    </span>
  );
}
