export function NetworkBadge() {
  const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
  return (
    <span style={{
      fontFamily: "'JetBrains Mono',monospace", fontSize: '.625rem',
      padding: '.175rem .4rem', borderRadius: 4,
      background: isMainnet ? 'rgba(163,45,45,.15)' : 'rgba(124,106,247,.15)',
      color: isMainnet ? '#A32D2D' : '#7C6AF7',
      border: '1px solid ' + (isMainnet ? '#A32D2D44' : '#7C6AF744'),
      letterSpacing: '.04em', textTransform: 'uppercase',
    }}>
      {isMainnet ? 'mainnet' : 'testnet'}
    </span>
  );
}
