interface Props { label: string; value: React.ReactNode; mono?: boolean; }

export function InfoRow({ label, value, mono }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.625rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '.8125rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{label}</span>
      <span style={{ fontSize: '.875rem', fontFamily: mono ? "'JetBrains Mono',monospace" : undefined }}>{value}</span>
    </div>
  );
}
