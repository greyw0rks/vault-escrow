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

# -- STXDisplay.tsx --
mkdir -p components/ui
cat > components/ui/STXDisplay.tsx << 'FILEOF'
'use client';
import { useSTXPrice } from '@/hooks/useSTXPrice';
import { formatSTX, formatUSD } from '@/lib/number-format';

interface Props { micro: bigint; showUSD?: boolean; size?: 'sm' | 'md' | 'lg'; }

export function STXDisplay({ micro, showUSD = false, size = 'md' }: Props) {
  const { price } = useSTXPrice();
  const fontSize = size === 'sm' ? '.8125rem' : size === 'lg' ? '1.5rem' : '1rem';
  const usd = price ? Number(micro) / 1_000_000 * price : null;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '.375rem' }}>
      <span style={{ fontFamily: "'Playfair Display',serif", fontSize, color: 'var(--gold)' }}>{formatSTX(micro)}</span>
      {showUSD && usd !== null && (
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>
          ({formatUSD(usd)})
        </span>
      )}
    </span>
  );
}
FILEOF
commit "components/ui/STXDisplay.tsx" "Add STXDisplay: formatted STX amount with optional USD value"

# -- useSTXDisplay.ts --
mkdir -p hooks
cat > hooks/useSTXDisplay.ts << 'FILEOF'
import { useSTXPrice } from './useSTXPrice';
import { formatSTX, formatUSD, formatCompactSTX } from '@/lib/number-format';

export function useSTXDisplay(micro: bigint) {
  const { price } = useSTXPrice();
  const usd = price ? Number(micro) / 1_000_000 * price : null;

  return {
    stx:     formatSTX(micro),
    compact: formatCompactSTX(micro),
    usd:     usd !== null ? formatUSD(usd) : null,
    hasUSD:  usd !== null,
  };
}
FILEOF
commit "hooks/useSTXDisplay.ts" "Add useSTXDisplay: formatting hook for STX amounts with USD"

# -- math-utils.ts --
mkdir -p lib
cat > lib/math-utils.ts << 'FILEOF'
export function safeDivide(a: number, b: number, fallback = 0): number {
  return b === 0 ? fallback : a / b;
}

export function safeDivideBig(a: bigint, b: bigint, fallback = 0n): bigint {
  return b === 0n ? fallback : a / b;
}

export function roundTo(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

export function inRange(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

export function percentage(part: number, total: number): number {
  return total === 0 ? 0 : roundTo((part / total) * 100, 1);
}
FILEOF
commit "lib/math-utils.ts" "Add math-utils: additional math helpers for escrow calculations"

echo ""
echo "🎯 August 21 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
