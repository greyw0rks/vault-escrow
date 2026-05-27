import Link from 'next/link';

export function NavBrand() {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '.625rem', textDecoration: 'none' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#1A1000', fontWeight: 700, flexShrink: 0 }}>V</div>
      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.125rem', color: 'var(--text)', fontWeight: 600 }}>VaultSTX</span>
    </Link>
  );
}
