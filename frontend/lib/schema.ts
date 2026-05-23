type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseSTX(raw: string): Result<bigint> {
  const n = parseFloat(raw);
  if (isNaN(n) || n <= 0) return { ok: false, error: 'Enter a positive STX amount' };
  if (n > 1_000_000) return { ok: false, error: 'Amount too large' };
  return { ok: true, value: BigInt(Math.round(n * 1_000_000)) };
}

export function parsePrincipal(raw: string): Result<string> {
  const trimmed = raw.trim();
  if (!/^S[A-Z0-9]{28,41}$/.test(trimmed)) return { ok: false, error: 'Invalid Stacks address' };
  return { ok: true, value: trimmed };
}

export function parseDescription(raw: string): Result<string> {
  const trimmed = raw.trim();
  if (trimmed.length < 3) return { ok: false, error: 'Too short (min 3 chars)' };
  if (trimmed.length > 256) return { ok: false, error: 'Too long (max 256 chars)' };
  return { ok: true, value: trimmed };
}
