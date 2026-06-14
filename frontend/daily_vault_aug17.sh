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

# -- Footer.tsx --
mkdir -p components/ui
cat > components/ui/Footer.tsx << 'FILEOF'
'use client';
import { BRAND } from '@/lib/brand';
import { AppStatus } from './AppStatus';
import { NetworkBadge } from './NetworkBadge';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)' }}>{BRAND.name}</span>
        <NetworkBadge />
      </div>
      <AppStatus />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href={BRAND.github} target="_blank" rel="noreferrer" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--muted)', textDecoration: 'none' }}>GitHub</a>
      </div>
    </footer>
  );
}
FILEOF
commit "components/ui/Footer.tsx" "Add Footer: site footer with brand links and status"

# -- useFooterData.ts --
mkdir -p hooks
cat > hooks/useFooterData.ts << 'FILEOF'
'use client';
import { useBlockHeight } from './useBlockHeight';
import { useNetworkStatus } from './useNetworkStatus';
import { BRAND } from '@/lib/brand';

export function useFooterData() {
  const height = useBlockHeight();
  const { online } = useNetworkStatus();
  return { height, online, brand: BRAND };
}
FILEOF
commit "hooks/useFooterData.ts" "Add useFooterData: aggregate data for footer display"

# -- links.ts --
mkdir -p lib
cat > lib/links.ts << 'FILEOF'
export const LINKS = {
  github:      'https://github.com/greyw0rks/vault-escrow',
  npm:         'https://www.npmjs.com/package/@greyw0rks/vault-escrow',
  hirosystems: 'https://docs.hiro.so',
  stacks:      'https://www.stacks.co',
  clarity:     'https://docs.stacks.co/clarity',
} as const;

export function explorerLink(type: 'tx' | 'address', value: string, mainnet = false): string {
  const base = mainnet ? 'https://explorer.hiro.so' : 'https://explorer.hiro.so/?chain=testnet';
  return type === 'tx' ? base + '/txid/' + value : base + '/address/' + value;
}
FILEOF
commit "lib/links.ts" "Add links: external link constants and helpers"

echo ""
echo "🎯 August 17 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
