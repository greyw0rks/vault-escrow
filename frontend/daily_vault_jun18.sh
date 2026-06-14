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

# ── SectionHeader.tsx ──
mkdir -p components/ui
cat > components/ui/SectionHeader.tsx << 'FILEOF'
interface Props { title: string; sub?: string; right?: React.ReactNode; }

export function SectionHeader({ title, sub, right }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
        {sub && <p style={{ margin: '.25rem 0 0', color: 'var(--muted)', fontSize: '.8125rem', fontFamily: "'DM Sans',sans-serif" }}>{sub}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
FILEOF
commit "components/ui/SectionHeader.tsx" "Add SectionHeader: section title with optional right content"

# ── useEscrowMeta.ts ──
mkdir -p hooks
cat > hooks/useEscrowMeta.ts << 'FILEOF'
import { useMemo } from 'react';
import type { Escrow } from '@/lib/contract';
import { microToSTX } from '@/lib/contract';

export function useEscrowMeta(escrow: Escrow | null) {
  return useMemo(() => {
    if (!escrow) return null;
    const releasedPct = escrow.totalAmount > 0n
      ? Math.round(Number(escrow.released) / Number(escrow.totalAmount) * 100)
      : 0;
    const remaining = escrow.totalAmount - escrow.released;
    const isComplete  = escrow.state === 'complete';
    const isDisputed  = escrow.state === 'disputed';
    const isActive    = escrow.state === 'active';
    return {
      releasedPct,
      remaining,
      remainingSTX: microToSTX(remaining),
      totalSTX:     microToSTX(escrow.totalAmount),
      releasedSTX:  microToSTX(escrow.released),
      isComplete, isDisputed, isActive,
    };
  }, [escrow]);
}
FILEOF
commit "hooks/useEscrowMeta.ts" "Add useEscrowMeta: derive display metadata from escrow state"

# ── regex.ts ──
mkdir -p lib
cat > lib/regex.ts << 'FILEOF'
export const PRINCIPAL_RE  = /^S[A-Z0-9]{28,41}$/;
export const TX_HASH_RE     = /^0x[a-fA-F0-9]{64}$/;
export const STX_AMOUNT_RE  = /^\d+(\.\d{1,6})?$/;
export const BLOCK_HEIGHT_RE = /^\d+$/;

export function isPrincipal(s: string): boolean  { return PRINCIPAL_RE.test(s); }
export function isTxHash(s: string): boolean      { return TX_HASH_RE.test(s); }
export function isSTXAmount(s: string): boolean   { return STX_AMOUNT_RE.test(s) && parseFloat(s) > 0; }
FILEOF
commit "lib/regex.ts" "Add regex: shared regex patterns for Stacks address validation"

echo ""
echo "🎯 June 18 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
