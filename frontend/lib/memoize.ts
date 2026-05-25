export function memoize<T extends (...args: unknown[]) => unknown>(fn: T, maxSize = 100): T {
  const cache = new Map<string, unknown>();

  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    if (cache.size >= maxSize) cache.delete(cache.keys().next().value);
    cache.set(key, result);
    return result;
  }) as T;
}
