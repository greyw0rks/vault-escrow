const ENABLED = process.env.NEXT_PUBLIC_TELEMETRY === 'true';

export function captureError(err: Error, context?: Record<string, unknown>) {
  if (!ENABLED) return;
  console.error('[VaultSTX telemetry]', err.message, context ?? '');
}

export function captureTiming(label: string, ms: number) {
  if (!ENABLED) return;
  console.debug('[VaultSTX timing]', label, ms + 'ms');
}

export function withTiming<T>(label: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    captureTiming(label, Math.round(performance.now() - start));
  }
}
