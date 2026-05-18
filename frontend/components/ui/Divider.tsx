export function Divider({ label }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1.5rem 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      {label && <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}
