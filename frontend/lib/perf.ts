export class PerfTimer {
  private start: number;
  private marks: { label: string; ms: number }[] = [];

  constructor() { this.start = performance.now(); }

  mark(label: string) {
    this.marks.push({ label, ms: Math.round(performance.now() - this.start) });
  }

  report(): string {
    return this.marks.map(m => m.label + ': ' + m.ms + 'ms').join(', ');
  }

  total(): number {
    return Math.round(performance.now() - this.start);
  }
}

export function measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t = performance.now();
  return fn().finally(() => {
    console.debug('[VaultSTX perf]', label, Math.round(performance.now() - t) + 'ms');
  });
}
