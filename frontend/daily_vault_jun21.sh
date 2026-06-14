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

# ── FeatureFlag.tsx ──
mkdir -p components/ui
cat > components/ui/FeatureFlag.tsx << 'FILEOF'
import { isEnabled, type Flag } from '@/lib/feature-flags';

interface Props { flag: Flag; children: React.ReactNode; fallback?: React.ReactNode; }

export function FeatureFlag({ flag, children, fallback = null }: Props) {
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
}
FILEOF
commit "components/ui/FeatureFlag.tsx" "Add FeatureFlag: conditionally render children by feature flag"

# ── useStaleWhileRevalidate.ts ──
mkdir -p hooks
cat > hooks/useStaleWhileRevalidate.ts << 'FILEOF'
'use client';
import { useState, useEffect, useCallback } from 'react';
import { cacheGet, cacheSet } from '@/lib/cache';

export function useStaleWhileRevalidate<T>(key: string, fetcher: () => Promise<T>, ttlMs = 30_000) {
  const [data, setData] = useState<T | null>(() => cacheGet<T>(key));
  const [loading, setLoading] = useState(!cacheGet<T>(key));

  const revalidate = useCallback(async () => {
    try {
      const fresh = await fetcher();
      cacheSet(key, fresh, ttlMs);
      setData(fresh);
    } catch (_) {} finally { setLoading(false); }
  }, [key, ttlMs]);

  useEffect(() => { revalidate(); }, [revalidate]);

  return { data, loading, revalidate };
}
FILEOF
commit "hooks/useStaleWhileRevalidate.ts" "Add useStaleWhileRevalidate: show cached data while fetching fresh"

# ── assert.ts ──
mkdir -p lib
cat > lib/assert.ts << 'FILEOF'
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error('[VaultSTX] Assertion failed: ' + message);
}

export function assertDefined<T>(value: T | null | undefined, message: string): T {
  if (value == null) throw new Error('[VaultSTX] Expected defined: ' + message);
  return value;
}

export function assertNonEmpty(str: string, field: string): void {
  assert(str.trim().length > 0, field + ' must not be empty');
}
FILEOF
commit "lib/assert.ts" "Add assert: runtime assertion helpers for contract preconditions"

echo ""
echo "🎯 June 21 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
