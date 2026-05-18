interface Props { width?: string | number; height?: string | number; radius?: number; }

export function Skeleton({ width = '100%', height = 20, radius = 6 }: Props) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--raised) 25%, var(--border) 50%, var(--raised) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }}>
      <style>{'@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }'}</style>
    </div>
  );
}

export function EscrowCardSkeleton() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      <Skeleton height={18} width="40%" />
      <Skeleton height={14} width="70%" />
      <Skeleton height={4} />
    </div>
  );
}
