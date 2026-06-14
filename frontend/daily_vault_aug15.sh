#!/usr/bin/env bash
set -e
cd ~/Vaultstx/frontend

COUNT=0
commit() {
  git add "$1"
  git commit -q -m "$2"
  COUNT=$((COUNT+1))
  echo "✅ $2"
}

# -- FeatureGate.tsx --
mkdir -p components/ui
cat > components/ui/FeatureGate.tsx << 'FILEOF'
import { isFeatureEnabled, type FeatureKey } from '@/lib/feature-flags-aug';

interface Props { feature: FeatureKey; children: React.ReactNode; fallback?: React.ReactNode; }

export function FeatureGate({ feature, children, fallback = null }: Props) {
  return isFeatureEnabled(feature) ? <>{children}</> : <>{fallback}</>;
}
FILEOF
commit "components/ui/FeatureGate.tsx" "Add FeatureGate: render children only when feature flag is enabled"

# -- useFeatureFlag.ts --
mkdir -p hooks
cat > hooks/useFeatureFlag.ts << 'FILEOF'
import { useMemo } from 'react';
import { isFeatureEnabled, type FeatureKey } from '@/lib/feature-flags-aug';

export function useFeatureFlag(key: FeatureKey): boolean {
  return useMemo(() => isFeatureEnabled(key), [key]);
}
FILEOF
commit "hooks/useFeatureFlag.ts" "Add useFeatureFlag: reactive feature flag hook"

# -- august-additions.ts --
mkdir -p lib
cat > lib/august-additions.ts << 'FILEOF'
// August 2026 additions barrel export
export * from './audit';
export * from './progress';
export * from './filters';
export * from './stats';
export * from './milestone-utils';
export * from './keymap';
export * from './perf';
export * from './debug';
export * from './layout';
export * from './accessibility';
export * from './focus';
export * from './motion';
export * from './health';
export * from './feature-flags-aug';
FILEOF
commit "lib/august-additions.ts" "Add august-additions: index of all August 2026 additions"

echo ""
echo "🎯 August 15 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
