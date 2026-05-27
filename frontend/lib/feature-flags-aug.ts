export const FEATURES = {
  KEYBOARD_SHORTCUTS: true,
  AUDIT_LOG:          true,
  DETAIL_TABS:        true,
  MOBILE_DRAWER:      true,
  SCROLL_PROGRESS:    true,
  SETTINGS_PANEL:     true,
  HEALTH_DASHBOARD:   process.env.NODE_ENV === 'development',
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}
