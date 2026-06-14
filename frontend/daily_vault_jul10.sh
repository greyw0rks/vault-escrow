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

# ── DraftBadge.tsx ──
mkdir -p components/ui
cat > components/ui/DraftBadge.tsx << 'FILEOF'
'use client';
import { hasDraft } from '@/lib/local-escrow';
import { useIsClient } from '@/hooks/useIsClient';

export function DraftBadge() {
  const isClient = useIsClient();
  if (!isClient || !hasDraft()) return null;
  return (
    <span style={{
      background: 'rgba(124,106,247,.15)', color: '#7C6AF7',
      border: '1px solid #7C6AF744',
      fontFamily: "'JetBrains Mono',monospace", fontSize: '.6875rem',
      padding: '.2rem .5rem', borderRadius: 20,
    }}>
      draft saved
    </span>
  );
}
FILEOF
commit "components/ui/DraftBadge.tsx" "Add DraftBadge: indicator for saved new-escrow draft"

# ── useEscrowDraft.ts ──
mkdir -p hooks
cat > hooks/useEscrowDraft.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';
import { saveDraft, loadDraft, clearDraft } from '@/lib/local-escrow';
import type { NewEscrowForm } from '@/lib/types';

const EMPTY: NewEscrowForm = { worker: '', resolver: '', deposit: '', milestones: [] };

export function useEscrowDraft() {
  const [draft, setDraft] = useState<NewEscrowForm>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadDraft();
    if (saved) setDraft(saved);
    setLoaded(true);
  }, []);

  const update = (updates: Partial<NewEscrowForm>) => {
    setDraft(d => {
      const next = { ...d, ...updates };
      saveDraft(next);
      return next;
    });
  };

  const clear = () => { clearDraft(); setDraft(EMPTY); };

  return { draft, update, clear, loaded };
}
FILEOF
commit "hooks/useEscrowDraft.ts" "Add useEscrowDraft: load save and clear new-escrow draft state"

# ── format-number.ts ──
mkdir -p lib
cat > lib/format-number.ts << 'FILEOF'
export function formatInt(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatDecimal(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(n: number, decimals = 1): string {
  return n.toFixed(decimals) + '%';
}

export function formatCurrency(n: number, symbol = '\$'): string {
  return symbol + formatDecimal(n, 2);
}
FILEOF
commit "lib/format-number.ts" "Add format-number: locale-aware number formatting helpers"

echo ""
echo "🎯 July 10 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
