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

# ── EnvWarning.tsx ──
mkdir -p components/ui
cat > components/ui/EnvWarning.tsx << 'FILEOF'
'use client';
import { useIsClient } from '@/hooks/useIsClient';
import { checkEnv } from '@/lib/env-check';

export function EnvWarning() {
  const isClient = useIsClient();
  if (!isClient) return null;
  const { ok, missing } = checkEnv();
  if (ok) return null;
  return (
    <div style={{ background: 'rgba(163,45,45,.15)', border: '1px solid #A32D2D44', borderRadius: 'var(--radius)', padding: '.875rem 1rem', marginBottom: '1rem' }}>
      <p style={{ margin: 0, color: '#A32D2D', fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem' }}>
        ⚠ Missing environment variables: {missing.join(', ')}
      </p>
    </div>
  );
}
FILEOF
commit "components/ui/EnvWarning.tsx" "Add EnvWarning: warn users when contract address is not configured"

# ── useEscrowStale.ts ──
mkdir -p hooks
cat > hooks/useEscrowStale.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';

export function useEscrowStale(lastFetched: Date | null, staleAfterMs = 60_000) {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (!lastFetched) return;
    const check = () => setStale(Date.now() - lastFetched.getTime() > staleAfterMs);
    check();
    const t = setInterval(check, 10_000);
    return () => clearInterval(t);
  }, [lastFetched, staleAfterMs]);

  return stale;
}
FILEOF
commit "hooks/useEscrowStale.ts" "Add useEscrowStale: detect when escrow data may be stale"

# ── signal.ts ──
mkdir -p lib
cat > lib/signal.ts << 'FILEOF'
type Subscriber<T> = (value: T) => void;

export class Signal<T> {
  private value: T;
  private subscribers = new Set<Subscriber<T>>();

  constructor(initial: T) { this.value = initial; }

  get(): T { return this.value; }

  set(next: T): void {
    this.value = next;
    this.subscribers.forEach(s => s(next));
  }

  subscribe(fn: Subscriber<T>): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }
}

export const escrowSignal = new Signal<number | null>(null);
FILEOF
commit "lib/signal.ts" "Add signal: lightweight reactive signal primitive"

echo ""
echo "🎯 July 21 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
