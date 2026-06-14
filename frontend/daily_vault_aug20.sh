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

# -- DateDisplay.tsx --
mkdir -p components/ui
cat > components/ui/DateDisplay.tsx << 'FILEOF'
'use client';
import { formatDate, formatRelative } from '@/lib/format-date';
import { Tooltip } from './Tooltip';

interface Props { date: Date; relative?: boolean; }

export function DateDisplay({ date, relative = false }: Props) {
  const main = relative ? formatRelative(date) : formatDate(date);
  const tip  = relative ? formatDate(date) : formatRelative(date);
  return (
    <Tooltip content={tip}>
      <time dateTime={date.toISOString()} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8125rem', color: 'var(--muted)', cursor: 'help' }}>
        {main}
      </time>
    </Tooltip>
  );
}
FILEOF
commit "components/ui/DateDisplay.tsx" "Add DateDisplay: formatted date display with relative time tooltip"

# -- useDateFormat.ts --
mkdir -p hooks
cat > hooks/useDateFormat.ts << 'FILEOF'
import { formatDate, formatDateTime, formatRelative, isoDate } from '@/lib/format-date';

export function useDateFormat() {
  return { formatDate, formatDateTime, formatRelative, isoDate };
}
FILEOF
commit "hooks/useDateFormat.ts" "Add useDateFormat: formatting helpers for dates in components"

# -- number-format.ts --
mkdir -p lib
cat > lib/number-format.ts << 'FILEOF'
export function formatSTX(micro: bigint, decimals = 2): string {
  const stx = Number(micro) / 1_000_000;
  if (stx === 0) return '0 STX';
  if (stx < 0.01) return stx.toFixed(6) + ' STX';
  return stx.toFixed(decimals).replace(/\.?0+$/, '') + ' STX';
}

export function formatUSD(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatCompactSTX(micro: bigint): string {
  const stx = Number(micro) / 1_000_000;
  if (stx >= 1_000_000) return (stx / 1_000_000).toFixed(1) + 'M STX';
  if (stx >= 1_000)     return (stx / 1_000).toFixed(1)     + 'K STX';
  return stx.toFixed(2) + ' STX';
}
FILEOF
commit "lib/number-format.ts" "Add number-format: number formatting utilities for escrow amounts"

echo ""
echo "🎯 August 20 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
