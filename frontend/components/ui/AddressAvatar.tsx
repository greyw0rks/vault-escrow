interface Props { address: string; size?: number; }

function colorFromAddress(address: string): string {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return 'hsl(' + h + ', 55%, 45%)';
}

export function AddressAvatar({ address, size = 32 }: Props) {
  const color = colorFromAddress(address);
  const initials = address.slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '22', border: '1px solid ' + color + '55',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono',monospace",
      fontSize: size * 0.34 + 'px', color, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}
