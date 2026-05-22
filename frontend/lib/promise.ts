export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout after ' + ms + 'ms')), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function allSettledValues<T>(promises: Promise<T>[]): Promise<(T | null)[]> {
  const results = await Promise.allSettled(promises);
  return results.map(r => r.status === 'fulfilled' ? r.value : null);
}
