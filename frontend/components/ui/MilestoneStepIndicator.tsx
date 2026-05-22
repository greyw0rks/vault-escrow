interface Props { total: number; active: number; approved: number; }

export function MilestoneStepIndicator({ total, active, approved }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => {
        const isApproved = i < approved;
        const isActive   = i === active;
        const color = isApproved ? '#1D9E75' : isActive ? 'var(--gold)' : 'var(--border)';
        return (
          <div key={i} style={{
            width: isActive ? 10 : 8, height: isActive ? 10 : 8,
            borderRadius: '50%', background: color,
            transition: 'all .2s', flexShrink: 0,
          }} />
        );
      })}
    </div>
  );
}
