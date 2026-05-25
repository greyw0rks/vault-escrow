export function nanoid(size = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (const byte of bytes) result += chars[byte % chars.length];
  return result;
}

export function shortId(): string { return nanoid(8); }

export function prefixedId(prefix: string): string {
  return prefix + '_' + nanoid(10);
}
