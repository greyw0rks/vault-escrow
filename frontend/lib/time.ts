export function msToHuman(ms: number): string {
  if (ms < 60_000) return Math.round(ms / 1000) + 's';
  if (ms < 3_600_000) return Math.round(ms / 60_000) + 'm';
  if (ms < 86_400_000) return Math.round(ms / 3_600_000) + 'h';
  return Math.round(ms / 86_400_000) + 'd';
}

export function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return Math.round(diff / 60_000) + 'm ago';
  if (diff < 86_400_000) return Math.round(diff / 3_600_000) + 'h ago';
  return Math.round(diff / 86_400_000) + 'd ago';
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
