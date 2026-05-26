import type { Milestone } from '@/lib/contract';

const COLORS: Record<string, string> = {
  pending: 'var(--border)', submitted: '#EF9F27', approved: '#1D9E75', disputed: '#A32D2D',
};

export function MilestoneStatusDots({ milestones }: { milestones: Milestone[] }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {milestones.map((ms, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[ms.state] ?? 'var(--border)', flexShrink: 0 }} title={ms.state} />
      ))}
    </div>
  );
}
