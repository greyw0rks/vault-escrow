'use client';
import type { EscrowState } from '@/lib/contract';

const STATES: (EscrowState | 'all')[] = ['all', 'open', 'active', 'disputed', 'complete', 'cancelled'];

interface Props {
  state: EscrowState | 'all';
  onChange: (s: EscrowState | 'all') => void;
}

export function FilterBar({ state, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {STATES.map(s => (
        <button key={s} onClick={() => onChange(s)} style={{
          padding: '.35rem .875rem', borderRadius: 20, border: '1px solid',
          borderColor: state === s ? 'var(--gold)' : 'var(--border)',
          background: state === s ? 'rgba(239,159,39,.12)' : 'transparent',
          color: state === s ? 'var(--gold)' : 'var(--muted)',
          fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem',
          cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.05em',
        }}>{s}</button>
      ))}
    </div>
  );
}
