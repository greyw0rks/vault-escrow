type EventName =
  | 'escrow_created'
  | 'milestone_submitted'
  | 'milestone_approved'
  | 'dispute_raised'
  | 'wallet_connected';

export function trackEvent(name: EventName, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try { console.debug('[VaultSTX]', name, props ?? ''); } catch (_) {}
}
