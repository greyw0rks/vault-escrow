interface Props { title: string; sub?: string; right?: React.ReactNode; }

export function SectionHeader({ title, sub, right }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
        {sub && <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontSize: '.8125rem', fontFamily: "'DM Sans',sans-serif" }}>{sub}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
