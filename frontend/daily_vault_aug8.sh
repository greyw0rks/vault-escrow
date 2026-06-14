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

# -- ScrollProgress.tsx --
mkdir -p components/ui
cat > components/ui/ScrollProgress.tsx << 'FILEOF'
'use client';
import { useState } from 'react';
import { useThrottledScroll } from '@/hooks/useThrottledScroll';

function getScrollPct(): number {
  const el = document.documentElement;
  return (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
}

export function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useThrottledScroll(() => setPct(getScrollPct()), 50);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 999, background: 'var(--border)' }}>
      <div style={{ height: '100%', background: 'var(--gold)', width: pct + '%', transition: 'width .1s linear' }} />
    </div>
  );
}
FILEOF
commit "components/ui/ScrollProgress.tsx" "Add ScrollProgress: thin scroll progress bar at top of page"

# -- useRenderCount.ts --
mkdir -p hooks
cat > hooks/useRenderCount.ts << 'FILEOF'
import { useRef } from 'react';

export function useRenderCount(): number {
  const count = useRef(0);
  count.current++;
  return count.current;
}
FILEOF
commit "hooks/useRenderCount.ts" "Add useRenderCount: count component re-renders for debugging"

# -- debug.ts --
mkdir -p lib
cat > lib/debug.ts << 'FILEOF'
const IS_DEV = process.env.NODE_ENV === 'development';

export function devLog(label: string, ...args: unknown[]) {
  if (IS_DEV) console.log('[VaultSTX]', label, ...args);
}

export function devWarn(label: string, ...args: unknown[]) {
  if (IS_DEV) console.warn('[VaultSTX]', label, ...args);
}

export function devTable(label: string, data: object[]) {
  if (IS_DEV) { console.group('[VaultSTX] ' + label); console.table(data); console.groupEnd(); }
}

export function devTime<T>(label: string, fn: () => T): T {
  if (!IS_DEV) return fn();
  console.time('[VaultSTX] ' + label);
  const result = fn();
  console.timeEnd('[VaultSTX] ' + label);
  return result;
}
FILEOF
commit "lib/debug.ts" "Add debug: development debugging helpers and log formatters"

echo ""
echo "🎯 August 8 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
