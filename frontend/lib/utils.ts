// Number & string formatting for the VaultSTX telemetry UI.

const MICRO = 1_000_000n;

/** uSTX → STX, trimmed to at most `dp` decimals (default 2), grouped. */
export function toSTX(micro: bigint, dp = 2): string {
  const neg = micro < 0n;
  const abs = neg ? -micro : micro;
  const whole = abs / MICRO;
  const frac = abs % MICRO;
  const fracStr = frac.toString().padStart(6, '0').slice(0, dp).replace(/0+$/, '');
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}${wholeStr}${fracStr ? '.' + fracStr : ''}`;
}

/** uSTX → STX at full 6-decimal precision (no trimming). */
export function toSTXFull(micro: bigint): string {
  const whole = micro / MICRO;
  const frac = (micro % MICRO).toString().padStart(6, '0');
  return `${whole.toString()}.${frac}`;
}

/** STX decimal string → uSTX bigint. Throws on malformed input. */
export function stxToMicro(stx: string): bigint {
  const trimmed = stx.trim();
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === '' || trimmed === '.')
    throw new Error('Enter a valid STX amount');
  const [whole, frac = ''] = trimmed.split('.');
  const fracPadded = frac.padEnd(6, '0').slice(0, 6);
  return BigInt(whole || '0') * MICRO + BigInt(fracPadded || '0');
}

/** Middle-truncate a principal: SP1SY…S5QKK. */
export function trunc(addr: string, head = 5, tail = 5): string {
  if (!addr || addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

/** Integer percentage of a over b, clamped 0–100. */
export function pct(a: bigint, b: bigint): number {
  if (b <= 0n) return 0;
  return Math.min(100, Math.max(0, Number((a * 100n) / b)));
}

/** Zero-padded telemetry id: unitId('VLT', 7) → "VLT-0007". */
export function unitId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

/** ~blocks → rough wall-clock string (Stacks ≈ 10 min / block). */
export function blocksToTime(blocks: number): string {
  const mins = Math.abs(blocks) * 10;
  if (mins < 60) return `~${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `~${hrs}h`;
  return `~${Math.round(hrs / 24)}d`;
}
