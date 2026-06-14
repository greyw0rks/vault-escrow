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

# -- ExternalLink.tsx --
mkdir -p components/ui
cat > components/ui/ExternalLink.tsx << 'FILEOF'
interface Props { href: string; children: React.ReactNode; style?: React.CSSProperties; }

export function ExternalLink({ href, children, style }: Props) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: 'var(--gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.25rem', ...style }}>
      {children}
      <span style={{ fontSize: '.75em', opacity: .7 }}>↗</span>
    </a>
  );
}
FILEOF
commit "components/ui/ExternalLink.tsx" "Add ExternalLink: styled external link with arrow indicator"

# -- useExternalLinks.ts --
mkdir -p hooks
cat > hooks/useExternalLinks.ts << 'FILEOF'
import { explorerLink } from '@/lib/links';
import { ENV } from '@/lib/env';

export function useExternalLinks() {
  const isMainnet = ENV.isMainnet;

  return {
    txLink:      (txId: string)      => explorerLink('tx',      txId,    isMainnet),
    addressLink: (address: string)   => explorerLink('address', address, isMainnet),
    contractLink: () => explorerLink('address', ENV.contractAddress, isMainnet),
  };
}
FILEOF
commit "hooks/useExternalLinks.ts" "Add useExternalLinks: typed external link builders for escrow context"

# -- constants-final.ts --
mkdir -p lib
cat > lib/constants-final.ts << 'FILEOF'
export const APP = {
  name:     'VaultSTX',
  version:  '0.1.0',
  network:  process.env.NEXT_PUBLIC_NETWORK ?? 'testnet',
  contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '',
} as const;

export const LIMITS = {
  MAX_MILESTONES:      10,
  MIN_DEPOSIT_STX:     1,
  MAX_DEPOSIT_STX:     1_000_000,
  MAX_DESC_LEN:        256,
  MIN_DESC_LEN:        3,
  SCAN_BATCH:          10,
  POLL_MS:             15_000,
  CACHE_TTL_MS:        30_000,
  PAGE_SIZE:           10,
} as const;

export const COLORS = {
  gold:    '#EF9F27',
  green:   '#1D9E75',
  red:     '#A32D2D',
  purple:  '#7C6AF7',
  muted:   '#5F5E5A',
} as const;
FILEOF
commit "lib/constants-final.ts" "Add constants-final: consolidated final constants for the app"

echo ""
echo "🎯 August 18 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
