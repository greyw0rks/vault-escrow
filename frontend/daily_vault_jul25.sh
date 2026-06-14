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

# ── RateLimitWarning.tsx ──
mkdir -p components/ui
cat > components/ui/RateLimitWarning.tsx << 'FILEOF'
'use client';
import { useEffect, useState } from 'react';
import { apiLimiter } from '@/lib/rate-limit';

export function RateLimitWarning() {
  const [remaining, setRemaining] = useState(30);

  useEffect(() => {
    const t = setInterval(() => setRemaining(apiLimiter.remaining()), 5000);
    return () => clearInterval(t);
  }, []);

  if (remaining > 5) return null;
  return (
    <div style={{ background: 'rgba(163,45,45,.12)', border: '1px solid #A32D2D33', borderRadius: 'var(--radius)', padding: '.625rem .875rem', fontSize: '.8125rem', color: '#A32D2D', fontFamily: "'JetBrains Mono',monospace" }}>
      ⚠ API rate limit: {remaining} calls remaining
    </div>
  );
}
FILEOF
commit "components/ui/RateLimitWarning.tsx" "Add RateLimitWarning: warn when API rate limit is near"

# ── useStickyHeader.ts ──
mkdir -p hooks
cat > hooks/useStickyHeader.ts << 'FILEOF'
'use client';
import { useState } from 'react';
import { useThrottledScroll } from './useThrottledScroll';

export function useStickyHeader(threshold = 60) {
  const [sticky, setSticky] = useState(false);
  useThrottledScroll(y => setSticky(y > threshold), 100);
  return sticky;
}
FILEOF
commit "hooks/useStickyHeader.ts" "Add useStickyHeader: detect scroll for sticky header behavior"

# ── query-string.ts ──
mkdir -p lib
cat > lib/query-string.ts << 'FILEOF'
export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
  return entries.length ? '?' + entries.join('&') : '';
}

export function parseQuery(search: string): Record<string, string> {
  const result: Record<string, string> = {};
  const params = new URLSearchParams(search);
  params.forEach((v, k) => { result[k] = v; });
  return result;
}
FILEOF
commit "lib/query-string.ts" "Add query-string: URL query string builder and parser"

echo ""
echo "🎯 July 25 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
