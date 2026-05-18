export function isValidPrincipal(addr: string): boolean {
  return /^S[A-Z0-9]{28,41}\$/.test(addr);
}

export function isValidSTXAmount(val: string): boolean {
  const n = parseFloat(val);
  return !isNaN(n) && n > 0 && n <= 1_000_000;
}

export function isValidDescription(val: string): boolean {
  return val.trim().length >= 3 && val.trim().length <= 256;
}

export function validateEscrowForm(worker: string, resolver: string, deposit: string) {
  const errors: Record<string, string> = {};
  if (!isValidPrincipal(worker)) errors.worker = 'Invalid Stacks address';
  if (!isValidPrincipal(resolver)) errors.resolver = 'Invalid Stacks address';
  if (!isValidSTXAmount(deposit)) errors.deposit = 'Enter a valid STX amount';
  return errors;
}
