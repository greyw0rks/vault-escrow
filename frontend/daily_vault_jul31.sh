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

# ── AppBanner.tsx ──
mkdir -p components/ui
cat > components/ui/AppBanner.tsx << 'FILEOF'
'use client';
import { useToggle } from '@/hooks/useToggle';

interface Props { message: string; cta?: { label: string; href: string }; }

export function AppBanner({ message, cta }: Props) {
  const [dismissed, , , dismiss] = useToggle(false);
  if (dismissed) return null;
  return (
    <div style={{ background: 'var(--gold)', color: '#1A1000', padding: '.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', fontWeight: 500 }}>
      <span>{message}</span>
      {cta && <a href={cta.href} style={{ color: '#1A1000', fontWeight: 700, textDecoration: 'underline' }}>{cta.label}</a>}
      <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1000', fontSize: '1rem', marginLeft: 'auto', opacity: .7 }}>×</button>
    </div>
  );
}
FILEOF
commit "components/ui/AppBanner.tsx" "Add AppBanner: top-of-page promotional or status banner"

# ── useEscrowFavorites.ts ──
mkdir -p hooks
cat > hooks/useEscrowFavorites.ts << 'FILEOF'
'use client';
import { useLocalStorage } from './useLocalStorage';

export function useEscrowFavorites() {
  const [favorites, setFavorites] = useLocalStorage<number[]>('vault:favorites', []);

  const toggle = (id: number) => {
    setFavorites(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };

  const isFavorite = (id: number) => favorites.includes(id);
  const clear = () => setFavorites([]);

  return { favorites, toggle, isFavorite, clear };
}
FILEOF
commit "hooks/useEscrowFavorites.ts" "Add useEscrowFavorites: bookmark favorite escrows locally"

# ── CHANGELOG.md ──
mkdir -p lib
cat > lib/CHANGELOG.md << 'FILEOF'
# VaultSTX Changelog

## v0.1.0 — July 2026

### Added
- Milestone-based escrow creation and management
- Role-aware action panels for client, worker, and resolver
- Live STX/USD price ticker via CoinGecko
- Escrow list with search, filter, sort, and export
- Cards and table view modes
- In-memory TTL cache for contract reads
- Auto-save draft escrow form
- Transaction status polling
- Block height and network indicators
- Copy-to-clipboard on all addresses
- Recently viewed escrows
- Keyboard navigation support
- Stale data detection with manual refresh
- AppShell with offline detection
- Full TypeScript throughout

### Fixed
- useAuth replaced with isConnected/getUserData for @stacks/connect-react v3
- StacksMainnet/StacksTestnet replaced with STACKS_MAINNET/STACKS_TESTNET constants
- callReadOnlyFunction replaced with fetchCallReadOnlyFunction

### Infrastructure
- Next.js 14 App Router
- Deployed on Vercel
- Published to npm as @greyw0rks/vault-escrow
FILEOF
commit "lib/CHANGELOG.md" "Add CHANGELOG: VaultSTX frontend version history"

echo ""
echo "🎯 July 31 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
