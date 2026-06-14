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

# ── EscrowDetailSkeleton.tsx ──
mkdir -p components/ui
cat > components/ui/EscrowDetailSkeleton.tsx << 'FILEOF'
import { Skeleton } from './Skeleton';

export function EscrowDetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', width: '50%' }}>
          <Skeleton height={32} width="60%" />
          <Skeleton height={16} width="40%" />
        </div>
        <Skeleton height={40} width={120} />
      </div>
      <div style={{ display: 'flex', gap: '.75rem' }}>
        {[1,2,3].map(i => <Skeleton key={i} height={80} style={{ flex: 1 }} />)}
      </div>
      <Skeleton height={4} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
        {[1,2,3].map(i => <Skeleton key={i} height={72} />)}
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/EscrowDetailSkeleton.tsx" "Add EscrowDetailSkeleton: loading skeleton for escrow detail page"

# ── useEscrowError.ts ──
mkdir -p hooks
cat > hooks/useEscrowError.ts << 'FILEOF'
import { useState, useCallback } from 'react';
import { parseContractError } from '@/lib/errors';

export function useEscrowError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    if (!err) { setError(null); return; }
    const msg = err instanceof Error ? err.message : String(err);
    const codeMatch = msg.match(/\(err u(\d+)\)/);
    if (codeMatch) setError(parseContractError(Number(codeMatch[1])));
    else setError(msg);
  }, []);

  const clear = useCallback(() => setError(null), []);

  return { error, handleError, clear };
}
FILEOF
commit "hooks/useEscrowError.ts" "Add useEscrowError: parse and display contract error codes"

# ── throttle.ts ──
mkdir -p lib
cat > lib/throttle.ts << 'FILEOF'
export function throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) { lastCall = now; fn(...args); }
  }) as T;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}
FILEOF
commit "lib/throttle.ts" "Add throttle: function throttle for scroll and resize handlers"

echo ""
echo "🎯 July 17 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
