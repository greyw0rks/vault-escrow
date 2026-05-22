import type { ActivityItem } from '@/hooks/useEscrowActivity';

const ICONS: Record<ActivityItem['type'], string> = {
  submitted: '📤',
  approved:  '✓',
  disputed:  '⚠',
};

const COLORS: Record<ActivityItem['type'], string> = {
  submitted: '#EF9F27',
  approved:  '#1D9E75',
  disputed:  '#A32D2D',
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return (
    <p style={{ color: 'var(--muted)', fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem' }}>No activity yet.</p>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
      {items.map((item, i) => {
        const color = COLORS[item.type];
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <span style={{ fontSize: '.875rem', width: 20, textAlign: 'center', flexShrink: 0 }}>{ICONS[item.type]}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '.875rem', color }}>{item.type}</span>
              <span style={{ fontSize: '.8125rem', color: 'var(--muted)', marginLeft: '.5rem' }}>milestone {item.milestoneIndex + 1}: {item.description.slice(0, 40)}</span>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', color: 'var(--muted)', flexShrink: 0 }}>#{item.block}</span>
          </div>
        );
      })}
    </div>
  );
}
