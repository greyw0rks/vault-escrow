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

# ── Breadcrumbs.tsx ──
mkdir -p components/ui
cat > components/ui/Breadcrumbs.tsx << 'FILEOF'
'use client';
import Link from 'next/link';

interface Crumb { label: string; href?: string; }

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '.375rem', marginBottom: '1.5rem' }}>
      {crumbs.map((crumb, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}>
          {i > 0 && <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>›</span>}
          {crumb.href ? (
            <Link href={crumb.href} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--text)' }}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
FILEOF
commit "components/ui/Breadcrumbs.tsx" "Add Breadcrumbs: navigation breadcrumb trail component"

# ── useIsClient.ts ──
mkdir -p hooks
cat > hooks/useIsClient.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';

export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
}
FILEOF
commit "hooks/useIsClient.ts" "Add useIsClient: detect client-side rendering for SSR safety"

# ── memoize.ts ──
mkdir -p lib
cat > lib/memoize.ts << 'FILEOF'
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T, maxSize = 100): T {
  const cache = new Map<string, unknown>();

  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    if (cache.size >= maxSize) cache.delete(cache.keys().next().value);
    cache.set(key, result);
    return result;
  }) as T;
}
FILEOF
commit "lib/memoize.ts" "Add memoize: function memoization with configurable cache size"

echo ""
echo "🎯 July 3 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
