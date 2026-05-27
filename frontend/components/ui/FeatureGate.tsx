import { isFeatureEnabled, type FeatureKey } from '@/lib/feature-flags-aug';

interface Props { feature: FeatureKey; children: React.ReactNode; fallback?: React.ReactNode; }

export function FeatureGate({ feature, children, fallback = null }: Props) {
  return isFeatureEnabled(feature) ? <>{children}</> : <>{fallback}</>;
}
