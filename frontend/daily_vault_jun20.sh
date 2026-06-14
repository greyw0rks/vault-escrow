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

# ── InlineError.tsx ──
mkdir -p components/ui
cat > components/ui/InlineError.tsx << 'FILEOF'
export function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span style={{
      fontSize: '.75rem', color: '#A32D2D',
      fontFamily: "'DM Sans',sans-serif",
      display: 'flex', alignItems: 'center', gap: '.25rem',
    }}>
      ⚠ {message}
    </span>
  );
}
FILEOF
commit "components/ui/InlineError.tsx" "Add InlineError: inline form field error message"

# ── useLatest.ts ──
mkdir -p hooks
cat > hooks/useLatest.ts << 'FILEOF'
import { useRef, useEffect } from 'react';

export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => { ref.current = value; }, [value]);
  return ref;
}
FILEOF
commit "hooks/useLatest.ts" "Add useLatest: always-current ref for stale closure prevention"

# ── feature-flags.ts ──
mkdir -p lib
cat > lib/feature-flags.ts << 'FILEOF'
const FLAGS = {
  SHOW_STX_PRICE:   process.env.NEXT_PUBLIC_FF_STX_PRICE   !== 'false',
  SHOW_ACTIVITY:    process.env.NEXT_PUBLIC_FF_ACTIVITY     !== 'false',
  EXPORT_CSV:       process.env.NEXT_PUBLIC_FF_EXPORT_CSV   !== 'false',
  TABLE_VIEW:       process.env.NEXT_PUBLIC_FF_TABLE_VIEW   !== 'false',
  RECENT_ESCROWS:   process.env.NEXT_PUBLIC_FF_RECENT       !== 'false',
} as const;

export type Flag = keyof typeof FLAGS;

export function isEnabled(flag: Flag): boolean {
  return FLAGS[flag];
}
FILEOF
commit "lib/feature-flags.ts" "Add feature-flags: environment-gated feature toggle helpers"

echo ""
echo "🎯 June 20 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
