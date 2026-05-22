interface Props { count: number; color?: string; }

export function CountBadge({ count, color = 'var(--gold)' }: Props) {
  if (count === 0) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 18, height: 18, padding: '0 5px',
      background: color + '22', color, border: '1px solid ' + color + '44',
      borderRadius: 20, fontFamily: "'JetBrains Mono',monospace",
      fontSize: '.6875rem', fontWeight: 600, lineHeight: 1,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}
