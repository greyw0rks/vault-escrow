export function formatFull(address: string): string {
  return address;
}

export function formatShort(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 3) return address;
  return address.slice(0, head) + '\u2026' + address.slice(-tail);
}

export function formatMedium(address: string): string {
  return formatShort(address, 10, 6);
}

export function addressesEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
