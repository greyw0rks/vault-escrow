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

# ── NewEscrowFAB.tsx ──
mkdir -p components/ui
cat > components/ui/NewEscrowFAB.tsx << 'FILEOF'
'use client';
import { FloatingActionButton } from './FloatingActionButton';
import { useWallet } from '@/hooks/useWallet';

export function NewEscrowFAB() {
  const { connected } = useWallet();
  if (!connected) return null;
  return <FloatingActionButton href="/escrow/new" label="New Escrow" icon="+" />;
}
FILEOF
commit "components/ui/NewEscrowFAB.tsx" "Add NewEscrowFAB: floating action button for new escrow creation"

# ── useThrottledScroll.ts ──
mkdir -p hooks
cat > hooks/useThrottledScroll.ts << 'FILEOF'
'use client';
import { useEffect } from 'react';
import { throttle } from '@/lib/throttle';

export function useThrottledScroll(handler: (y: number) => void, delay = 100) {
  useEffect(() => {
    const throttled = throttle((e: Event) => handler(window.scrollY), delay);
    window.addEventListener('scroll', throttled as EventListener, { passive: true });
    return () => window.removeEventListener('scroll', throttled as EventListener);
  }, [handler, delay]);
}
FILEOF
commit "hooks/useThrottledScroll.ts" "Add useThrottledScroll: throttled scroll event handler hook"

# ── rate-limit.ts ──
mkdir -p lib
cat > lib/rate-limit.ts << 'FILEOF'
interface RateLimiter {
  allow(): boolean;
  remaining(): number;
  reset(): void;
}

export function createRateLimiter(maxCalls: number, windowMs: number): RateLimiter {
  let calls: number[] = [];

  return {
    allow() {
      const now = Date.now();
      calls = calls.filter(t => now - t < windowMs);
      if (calls.length >= maxCalls) return false;
      calls.push(now);
      return true;
    },
    remaining() {
      const now = Date.now();
      calls = calls.filter(t => now - t < windowMs);
      return Math.max(0, maxCalls - calls.length);
    },
    reset() { calls = []; },
  };
}

export const apiLimiter = createRateLimiter(30, 60_000);
FILEOF
commit "lib/rate-limit.ts" "Add rate-limit: client-side rate limiter for API calls"

echo ""
echo "🎯 July 24 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
