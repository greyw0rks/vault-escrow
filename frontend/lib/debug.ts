const IS_DEV = process.env.NODE_ENV === 'development';

export function devLog(label: string, ...args: unknown[]) {
  if (IS_DEV) console.log('[VaultSTX]', label, ...args);
}

export function devWarn(label: string, ...args: unknown[]) {
  if (IS_DEV) console.warn('[VaultSTX]', label, ...args);
}

export function devTable(label: string, data: object[]) {
  if (IS_DEV) { console.group('[VaultSTX] ' + label); console.table(data); console.groupEnd(); }
}

export function devTime<T>(label: string, fn: () => T): T {
  if (!IS_DEV) return fn();
  console.time('[VaultSTX] ' + label);
  const result = fn();
  console.timeEnd('[VaultSTX] ' + label);
  return result;
}
