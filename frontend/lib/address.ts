export function isMainnetAddress(address: string): boolean {
  return address.startsWith('SP') || address.startsWith('SM');
}

export function isTestnetAddress(address: string): boolean {
  return address.startsWith('ST') || address.startsWith('SN');
}

export function addressNetwork(address: string): 'mainnet' | 'testnet' | 'unknown' {
  if (isMainnetAddress(address)) return 'mainnet';
  if (isTestnetAddress(address)) return 'testnet';
  return 'unknown';
}

export function sameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
