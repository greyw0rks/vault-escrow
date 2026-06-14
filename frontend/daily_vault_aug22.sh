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

# -- AmountBreakdown.tsx --
mkdir -p components/ui
cat > components/ui/AmountBreakdown.tsx << 'FILEOF'
import { STXDisplay } from './STXDisplay';
import type { Escrow } from '@/lib/contract';

export function AmountBreakdown({ escrow }: { escrow: Escrow }) {
  const remaining = escrow.totalAmount - escrow.released;
  const pct = escrow.totalAmount > 0n ? Math.round(Number(escrow.released) * 100 / Number(escrow.totalAmount)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
      {[
        { label: 'Total locked',  value: escrow.totalAmount,  color: 'var(--gold)' },
        { label: 'Released',      value: escrow.released,     color: '#1D9E75' },
        { label: 'Remaining',     value: remaining,           color: 'var(--muted)' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '.8125rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{label}</span>
          <STXDisplay micro={value} showUSD size="sm" />
        </div>
      ))}
      <div style={{ height: 4, background: 'var(--raised)', borderRadius: 2, overflow: 'hidden', marginTop: '.25rem' }}>
        <div style={{ height: '100%', background: 'var(--gold)', width: pct + '%', borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem', color: 'var(--muted)', textAlign: 'right' }}>{pct}% released</span>
    </div>
  );
}
FILEOF
commit "components/ui/AmountBreakdown.tsx" "Add AmountBreakdown: visual breakdown of escrow amounts"

# -- useAmountBreakdown.ts --
mkdir -p hooks
cat > hooks/useAmountBreakdown.ts << 'FILEOF'
import { useMemo } from 'react';
import type { Escrow } from '@/lib/contract';
import { formatSTX } from '@/lib/number-format';
import { percentage } from '@/lib/math-utils';

export function useAmountBreakdown(escrow: Escrow | null) {
  return useMemo(() => {
    if (!escrow) return null;
    const remaining = escrow.totalAmount - escrow.released;
    const pct = percentage(Number(escrow.released), Number(escrow.totalAmount));
    return {
      total:     escrow.totalAmount,
      released:  escrow.released,
      remaining,
      pct,
      totalSTX:     formatSTX(escrow.totalAmount),
      releasedSTX:  formatSTX(escrow.released),
      remainingSTX: formatSTX(remaining),
    };
  }, [escrow]);
}
FILEOF
commit "hooks/useAmountBreakdown.ts" "Add useAmountBreakdown: compute escrow amount breakdown data"

# -- validation2.ts --
mkdir -p lib
cat > lib/validation2.ts << 'FILEOF'
export function isValidURL(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function isNonNegative(n: number): boolean { return n >= 0; }
export function isPositive(n: number): boolean    { return n > 0; }
export function isInteger(n: number): boolean      { return Number.isInteger(n); }
FILEOF
commit "lib/validation2.ts" "Add validation2: extended validation for August features"

echo ""
echo "🎯 August 22 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
