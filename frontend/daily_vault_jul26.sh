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

# ── StickyNav.tsx ──
mkdir -p components/ui
cat > components/ui/StickyNav.tsx << 'FILEOF'
'use client';
import { useStickyHeader } from '@/hooks/useStickyHeader';

interface Props { children: React.ReactNode; }

export function StickyNav({ children }: Props) {
  const sticky = useStickyHeader();
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      transition: 'box-shadow .2s',
      boxShadow: sticky ? '0 2px 20px rgba(0,0,0,.3)' : 'none',
      background: 'var(--bg)',
    }}>
      {children}
    </div>
  );
}
FILEOF
commit "components/ui/StickyNav.tsx" "Add StickyNav: nav bar with scroll-based shadow elevation"

# ── useEscrowBadge.ts ──
mkdir -p hooks
cat > hooks/useEscrowBadge.ts << 'FILEOF'
import type { EscrowState } from '@/lib/contract';

const CONFIG: Record<EscrowState, { color: string; label: string; icon: string }> = {
  open:      { color: '#EF9F27', label: 'Open',      icon: '○' },
  active:    { color: '#1D9E75', label: 'Active',    icon: '●' },
  disputed:  { color: '#A32D2D', label: 'Disputed',  icon: '⚠' },
  complete:  { color: '#1D9E75', label: 'Complete',  icon: '✓' },
  cancelled: { color: '#5F5E5A', label: 'Cancelled', icon: '×' },
};

export function useEscrowBadge(state: EscrowState) {
  return CONFIG[state] ?? CONFIG.cancelled;
}
FILEOF
commit "hooks/useEscrowBadge.ts" "Add useEscrowBadge: get status color and label for escrow state"

# ── colors.ts ──
mkdir -p lib
cat > lib/colors.ts << 'FILEOF'
export const PALETTE = {
  gold:     '#EF9F27',
  goldDim:  '#EF9F2744',
  green:    '#1D9E75',
  greenDim: '#1D9E7544',
  red:      '#A32D2D',
  redDim:   '#A32D2D44',
  purple:   '#7C6AF7',
  purpleDim:'#7C6AF744',
  muted:    '#5F5E5A',
  dark:     '#1A1000',
  cream:    '#F5F0E8',
} as const;

export type ColorKey = keyof typeof PALETTE;

export function alpha(hex: string, opacity: number): string {
  return hex + Math.round(opacity * 255).toString(16).padStart(2, '0');
}
FILEOF
commit "lib/colors.ts" "Add colors: extended color palette constants for the app"

echo ""
echo "🎯 July 26 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
