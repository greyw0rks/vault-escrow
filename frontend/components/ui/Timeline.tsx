import type { Milestone } from '@/lib/contract';
import { microToSTX } from '@/lib/contract';

const STATE_COLOR: Record<string, string> = {
  pending: 'var(--border)', submitted: '#EF9F27', approved: '#1D9E75', disputed: '#A32D2D',
};

export function Timeline({ milestones, active }: { milestones: Milestone[]; active: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {milestones.map((ms, i) => {
        const color = STATE_COLOR[ms.state];
        return (
          <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, border: '2px solid ' + color, marginTop: 4, flexShrink: 0 }} />
              {i < milestones.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 24, margin: '4px 0' }} />}
            </div>
            <div style={{ paddingBottom: i < milestones.length - 1 ? '1rem' : 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: '.9rem', fontWeight: i === active ? 600 : 400 }}>{ms.description}</p>
              <p style={{ margin: '.25rem 0 0', fontSize: '.75rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{microToSTX(ms.amount)} STX · {ms.state}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
