interface Props { children: React.ReactNode; style?: React.CSSProperties; }

export function GradientCard({ children, style }: Props) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--surface) 0%, rgba(239,159,39,.06) 100%)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      ...style,
    }}>
      {children}
    </div>
  );
}
