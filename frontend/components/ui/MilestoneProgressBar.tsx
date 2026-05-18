import { microToSTX } from '@/lib/contract';

interface Props {
  released: bigint;
  total: bigint;
  approved: number;
  count: number;
}

export function MilestoneProgressBar({ released, total, approved, count }: Props) {
  const pct = total > 0n ? Math.round((Number(released) / Number(total)) * 100) : 0;
  return (
    <div>
      <div style={{ height: '4px', background: 'var(--raised)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'var(--gold)',
          width: `${pct}%`,
          borderRadius: '2px',
          transition: 'width .3s ease',
        }} />
      </div>
      <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.375rem' }}>
        {approved} of {count} milestones · {microToSTX(released)} / {microToSTX(total)} STX released
      </p>
    </div>
  );
}
