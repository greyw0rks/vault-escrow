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

# -- ConstantsBadge.tsx --
mkdir -p components/ui
cat > components/ui/ConstantsBadge.tsx << 'FILEOF'
'use client';
import { APP } from '@/lib/constants-final';

export function ConstantsBadge() {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <div style={{ position: 'fixed', top: 8, right: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.375rem .625rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '.625rem', color: 'var(--muted)', zIndex: 9999 }}>
      {APP.name} v{APP.version} · {APP.network}
    </div>
  );
}
FILEOF
commit "components/ui/ConstantsBadge.tsx" "Add ConstantsBadge: dev badge showing current app constants"

# -- useAppConstants.ts --
mkdir -p hooks
cat > hooks/useAppConstants.ts << 'FILEOF'
import { APP, LIMITS, COLORS } from '@/lib/constants-final';

export function useAppConstants() {
  return { APP, LIMITS, COLORS };
}
FILEOF
commit "hooks/useAppConstants.ts" "Add useAppConstants: access app-wide constants in components"

# -- format-date.ts --
mkdir -p lib
cat > lib/format-date.ts << 'FILEOF'
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000)     return 'just now';
  if (diff < 3_600_000)  return Math.round(diff / 60_000) + 'm ago';
  if (diff < 86_400_000) return Math.round(diff / 3_600_000) + 'h ago';
  return Math.round(diff / 86_400_000) + 'd ago';
}

export function isoDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
FILEOF
commit "lib/format-date.ts" "Add format-date: date and time formatting helpers"

echo ""
echo "🎯 August 19 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
