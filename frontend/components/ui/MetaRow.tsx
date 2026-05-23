interface Props {
  items: { label: string; value: React.ReactNode; mono?: boolean }[];
}

export function MetaRow({ items }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
      {items.map(({ label, value, mono }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
          <span style={{ fontSize: '.6875rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
          <span style={{ fontSize: '.875rem', fontFamily: mono ? "'JetBrains Mono',monospace" : "'DM Sans',sans-serif" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}
