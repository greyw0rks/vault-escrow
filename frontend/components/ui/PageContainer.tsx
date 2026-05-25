interface Props { children: React.ReactNode; maxWidth?: number; }

export function PageContainer({ children, maxWidth = 900 }: Props) {
  return (
    <div style={{ maxWidth, margin: '0 auto', padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box' as const }}>
      {children}
    </div>
  );
}
