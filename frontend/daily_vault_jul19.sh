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

# ── LocalizedState.tsx ──
mkdir -p components/ui
cat > components/ui/LocalizedState.tsx << 'FILEOF'
import { t } from '@/lib/i18n';
import type { EscrowState } from '@/lib/contract';

export function LocalizedState({ state }: { state: EscrowState }) {
  return <span>{t(('escrow.state.' + state) as any)}</span>;
}
FILEOF
commit "components/ui/LocalizedState.tsx" "Add LocalizedState: render localized escrow state label"

# ── useEscrowCount.ts ──
mkdir -p hooks
cat > hooks/useEscrowCount.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';
import { useEscrowList } from './useEscrowList';

export function useEscrowCount() {
  const { escrows, loading } = useEscrowList();
  const counts = {
    total:     escrows.length,
    open:      escrows.filter(e => e.state === 'open').length,
    active:    escrows.filter(e => e.state === 'active').length,
    disputed:  escrows.filter(e => e.state === 'disputed').length,
    complete:  escrows.filter(e => e.state === 'complete').length,
    cancelled: escrows.filter(e => e.state === 'cancelled').length,
  };
  return { counts, loading };
}
FILEOF
commit "hooks/useEscrowCount.ts" "Add useEscrowCount: reactive escrow count with auto-refresh"

# ── runtime-check.ts ──
mkdir -p lib
cat > lib/runtime-check.ts << 'FILEOF'
export const IS_BROWSER = typeof window !== 'undefined';
export const IS_SERVER  = !IS_BROWSER;

export function supportsClipboard(): boolean {
  return IS_BROWSER && !!navigator.clipboard;
}

export function supportsWorker(): boolean {
  return IS_BROWSER && typeof Worker !== 'undefined';
}

export function supportsIntersectionObserver(): boolean {
  return IS_BROWSER && typeof IntersectionObserver !== 'undefined';
}

export function supportsWebCrypto(): boolean {
  return IS_BROWSER && !!crypto?.getRandomValues;
}
FILEOF
commit "lib/runtime-check.ts" "Add runtime-check: environment and browser capability checks"

echo ""
echo "🎯 July 19 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
