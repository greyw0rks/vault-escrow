'use client';
import { NewMilestoneRow } from './NewMilestoneRow';
import { microToSTX, stxToMicro } from '@/lib/contract';

interface Entry { description: string; amount: string; }
interface Props {
  milestones: Entry[];
  onAdd: (d: string, a: string) => void;
  onRemove: (i: number) => void;
  deposit: string;
}

export function MilestoneBuilderList({ milestones, onAdd, onRemove, deposit }: Props) {
  const total = milestones.reduce((acc, m) => acc + parseFloat(m.amount || '0'), 0);
  const dep = parseFloat(deposit || '0');
  const remaining = dep - total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      {milestones.map((m, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.75rem 1rem' }}>
          <span style={{ flex: 1, fontSize: '.9rem' }}>{m.description}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem', color: 'var(--gold)' }}>{m.amount} STX</span>
          <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1rem' }}>×</button>
        </div>
      ))}
      <NewMilestoneRow onAdd={onAdd} />
      {dep > 0 && (
        <div style={{ fontSize: '.8125rem', fontFamily: "'JetBrains Mono',monospace", color: remaining < 0 ? '#A32D2D' : remaining === 0 ? '#1D9E75' : 'var(--muted)' }}>
          {remaining === 0 ? '✓ Milestones match deposit' : 'Remaining: ' + remaining.toFixed(6) + ' STX'}
        </div>
      )}
    </div>
  );
}
