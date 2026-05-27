export function motionSafe(animation: string, fallback = 'none'): string {
  if (typeof window === 'undefined') return fallback;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? fallback : animation;
}

export function transition(duration = 200, easing = 'ease'): string {
  return motionSafe('all ' + duration + 'ms ' + easing);
}
