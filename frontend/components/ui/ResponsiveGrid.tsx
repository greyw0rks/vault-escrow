interface Props {
  children: React.ReactNode;
  minColWidth?: number;
  gap?: string;
}

export function ResponsiveGrid({ children, minColWidth = 200, gap = '.75rem' }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(' + minColWidth + 'px, 1fr))',
      gap,
    }}>
      {children}
    </div>
  );
}
