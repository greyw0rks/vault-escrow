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

# ── AnimatedNumber.tsx ──
mkdir -p components/ui
cat > components/ui/AnimatedNumber.tsx << 'FILEOF'
'use client';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

interface Props { value: number; format?: (n: number) => string; duration?: number; }

export function AnimatedNumber({ value, format = n => n.toFixed(0), duration }: Props) {
  const animated = useAnimatedValue(value, duration);
  return <span>{format(animated)}</span>;
}
FILEOF
commit "components/ui/AnimatedNumber.tsx" "Add AnimatedNumber: smoothly animated numeric display"

# ── useEscrowRefresh.ts ──
mkdir -p hooks
cat > hooks/useEscrowRefresh.ts << 'FILEOF'
'use client';
import { useCallback, useState } from 'react';
import { useEscrowPolling } from './useEscrowPolling';

export function useEscrowRefresh(refetch: () => void, autoRefresh = true) {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try { await refetch(); } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, [refetch]);

  useEscrowPolling(refetch, 15_000, autoRefresh);

  return { refresh, refreshing, lastRefresh };
}
FILEOF
commit "hooks/useEscrowRefresh.ts" "Add useEscrowRefresh: manual and auto refresh for escrow data"

# ── local-escrow.ts ──
mkdir -p lib
cat > lib/local-escrow.ts << 'FILEOF'
import { storageGet, storageSet, storageDel } from './storage';
import type { NewEscrowForm } from './types';

const KEY = 'vault:draft-escrow-v2';

export function saveDraft(form: NewEscrowForm): void {
  storageSet(KEY, form);
}

export function loadDraft(): NewEscrowForm | null {
  return storageGet<NewEscrowForm | null>(KEY, null);
}

export function clearDraft(): void {
  storageDel(KEY);
}

export function hasDraft(): boolean {
  return loadDraft() !== null;
}
FILEOF
commit "lib/local-escrow.ts" "Add local-escrow: local draft escrow storage and retrieval"

echo ""
echo "🎯 July 9 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
