import type { EscrowState } from '@/lib/contract';

const COLORS: Record<EscrowState, string> = {
  open:      '#EF9F27',
  active:    '#1D9E75',
  disputed:  '#A32D2D',
  complete:  '#1D9E75',
  cancelled: '#5F5E5A',
};

const LABELS: Record<EscrowState, string> = {
  open:      'Open',
  active:    'Active',
  disputed:  'Disputed',
  complete:  'Complete',
  cancelled: 'Cancelled',
};

export function EscrowStatusBadge({ state }: { state: EscrowState }) {
  const color = COLORS[state];
  return (
    <span style={{
      background: color + '22', color,
      border: '1px solid ' + color + '44',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '.6875rem', padding: '.2rem .5rem', borderRadius: '20px',
    }}>
      {LABELS[state]}
    </span>
  );
}
