import { microToSTX, type Escrow } from '@/lib/contract';

export function EscrowStats({ escrows }: { escrows: Escrow[] }) {
  const active   = escrows.filter(e => e.state === 'active').length;
  const disputed = escrows.filter(e => e.state === 'disputed').length;
  const locked   = escrows.reduce((a, e) => a + e.totalAmount - e.released, 0n);

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
      {[
        { label: 'Total',    value: escrows.length },
        { label: 'Active',   value: active,   color: '#1D9E75' },
        { label: 'Disputed', value: disputed, color: '#A32D2D' },
        { label: 'Locked',   value: microToSTX(locked) + ' STX', color: 'var(--gold)' },
      ].map(({ label, value, color = 'var(--text)' }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color }}>{value}</span>
        </div>
      ))}
    </div>
  );
}
