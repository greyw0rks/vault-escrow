interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function StatCard({ label, value, sub, color = 'var(--gold)' }: Props) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.125rem 1.25rem',
    }}>
      <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.375rem', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'JetBrains Mono',monospace" }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontFamily: "'Playfair Display',serif", color }}>{value}</div>
      {sub && <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.25rem' }}>{sub}</div>}
    </div>
  );
}
