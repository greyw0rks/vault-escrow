import { microToSTX, type Milestone } from '@/lib/contract';

const MS_COLORS: Record<string, string> = {
  pending: '#5F5E5A', submitted: '#EF9F27', approved: '#1D9E75', disputed: '#A32D2D',
};

interface Props { milestone: Milestone; index: number; active?: boolean; }

export function MilestoneCard({ milestone: ms, index, active }: Props) {
  const color = MS_COLORS[ms.state];
  return (
    <div style={{
      background: active ? 'var(--raised)' : 'var(--surface)',
      border: '1px solid ' + (active ? 'var(--border-hi)' : 'var(--border)'),
      borderRadius: 'var(--radius)', padding: '.875rem 1rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: color + '22', border: '1px solid ' + color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color, flexShrink: 0 }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 500 }}>{ms.description}</p>
        <p style={{ margin: '.25rem 0 0', fontSize: '.75rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{microToSTX(ms.amount)} STX</p>
      </div>
      <span style={{ background: color + '22', color, border: '1px solid ' + color + '44', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', padding: '.2rem .5rem', borderRadius: '20px', flexShrink: 0 }}>
        {ms.state}
      </span>
    </div>
  );
}
