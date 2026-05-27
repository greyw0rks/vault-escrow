interface Props { href: string; children: React.ReactNode; style?: React.CSSProperties; }

export function ExternalLink({ href, children, style }: Props) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: 'var(--gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.25rem', ...style }}>
      {children}
      <span style={{ fontSize: '.75em', opacity: .7 }}>↗</span>
    </a>
  );
}
