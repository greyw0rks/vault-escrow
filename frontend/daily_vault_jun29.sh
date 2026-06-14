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

# ── OfflineBanner.tsx ──
mkdir -p components/ui
cat > components/ui/OfflineBanner.tsx << 'FILEOF'
'use client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { offline } = useNetworkStatus();
  if (!offline) return null;
  return (
    <div style={{
      background: 'rgba(163,45,45,.15)', borderBottom: '1px solid #A32D2D44',
      padding: '.625rem 2rem', textAlign: 'center',
      fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', color: '#A32D2D',
    }}>
      ⚠ You are offline. Contract reads may be stale.
    </div>
  );
}
FILEOF
commit "components/ui/OfflineBanner.tsx" "Add OfflineBanner: network offline warning banner"

# ── useOptimisticUpdate.ts ──
mkdir -p hooks
cat > hooks/useOptimisticUpdate.ts << 'FILEOF'
'use client';
import { useState, useCallback } from 'react';

export function useOptimisticUpdate<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [optimistic, setOptimistic] = useState<T | null>(null);

  const display = optimistic ?? value;

  const apply = useCallback((next: T) => setOptimistic(next), []);
  const confirm = useCallback((confirmed: T) => { setValue(confirmed); setOptimistic(null); }, []);
  const revert = useCallback(() => setOptimistic(null), []);

  return { display, apply, confirm, revert, isOptimistic: optimistic !== null };
}
FILEOF
commit "hooks/useOptimisticUpdate.ts" "Add useOptimisticUpdate: apply optimistic state before tx confirms"

# ── middleware.ts ──
mkdir -p lib
cat > lib/middleware.ts << 'FILEOF'
import type { NextRequest } from 'next/server';

export function getAddressFromCookie(req: NextRequest): string | null {
  return req.cookies.get('stx-address')?.value ?? null;
}

export function isProtectedRoute(pathname: string): boolean {
  const PROTECTED = ['/escrow/new', '/dashboard'];
  return PROTECTED.some(r => pathname.startsWith(r));
}

export function redirectToHome(req: NextRequest) {
  return Response.redirect(new URL('/', req.url));
}
FILEOF
commit "lib/middleware.ts" "Add middleware: Next.js middleware helpers for auth and routing"

echo ""
echo "🎯 June 29 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
