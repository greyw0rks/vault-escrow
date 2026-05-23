import { isEnabled, type Flag } from '@/lib/feature-flags';

interface Props { flag: Flag; children: React.ReactNode; fallback?: React.ReactNode; }

export function FeatureFlag({ flag, children, fallback = null }: Props) {
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
}
