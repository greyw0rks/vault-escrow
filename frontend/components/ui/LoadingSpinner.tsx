export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '.75rem', padding: '3rem', color: 'var(--muted)',
      fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem',
    }}>
      <div style={{
        width: 28, height: 28,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--gold)',
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {label}
    </div>
  );
}
