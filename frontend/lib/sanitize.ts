export function sanitizeAscii(input: string, maxLen = 256): string {
  return input
    .replace(/[^\x20-\x7E]/g, '')
    .slice(0, maxLen);
}

export function sanitizePrincipal(input: string): string {
  return input.trim().replace(/[^A-Z0-9a-z.]/g, '');
}

export function sanitizeAmount(input: string): string {
  return input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
}
