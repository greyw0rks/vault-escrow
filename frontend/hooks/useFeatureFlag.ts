import { useMemo } from 'react';
import { isFeatureEnabled, type FeatureKey } from '@/lib/feature-flags-aug';

export function useFeatureFlag(key: FeatureKey): boolean {
  return useMemo(() => isFeatureEnabled(key), [key]);
}
