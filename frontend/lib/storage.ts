export function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch (_) { return fallback; }
}

export function storageSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

export function storageDel(key: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch (_) {}
}
