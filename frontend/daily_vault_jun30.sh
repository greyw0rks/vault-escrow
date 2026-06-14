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

# ── AppShell.tsx ──
mkdir -p components/ui
cat > components/ui/AppShell.tsx << 'FILEOF'
'use client';
import { OfflineBanner } from './OfflineBanner';
import { AppFooter } from './AppFooter';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface Props { children: React.ReactNode; }

export function AppShell({ children }: Props) {
  useScrollToTop();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <OfflineBanner />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <AppFooter />
    </div>
  );
}
FILEOF
commit "components/ui/AppShell.tsx" "Add AppShell: top-level layout wrapper with nav and footer"

# ── index.ts ──
mkdir -p hooks
cat > hooks/index.ts << 'FILEOF'
export * from './useAccountBalance';
export * from './useAsync';
export * from './useBlockHeight';
export * from './useCachedEscrow';
export * from './useClipboard';
export * from './useContractCall';
export * from './useContractRead';
export * from './useCountdown';
export * from './useDebounce';
export * from './useDraftEscrow';
export * from './useEscrow';
export * from './useEscrowActivity';
export * from './useEscrowApprove';
export * from './useEscrowById';
export * from './useEscrowCreate';
export * from './useEscrowDispute';
export * from './useEscrowEvents';
export * from './useEscrowFilter';
export * from './useEscrowList';
export * from './useEscrowMeta';
export * from './useEscrowParticipants';
export * from './useEscrowPolling';
export * from './useEscrowRole';
export * from './useEscrowSearch';
export * from './useEscrowStats';
export * from './useEscrowSubmit';
export * from './useExplorer';
export * from './useFocus';
export * from './useFormState';
export * from './useFormValidation';
export * from './useHover';
export * from './useInterval';
export * from './useKeyPress';
export * from './useLatest';
export * from './useLocalStorage';
export * from './useMediaQuery';
export * from './useMilestoneBuilder';
export * from './useNetworkStatus';
export * from './useNotifications';
export * from './useOnMount';
export * from './useOptimisticUpdate';
export * from './usePagination';
export * from './usePermissions';
export * from './usePrevious';
export * from './useRecentEscrows';
export * from './useScrollToTop';
export * from './useSortable';
export * from './useSTXPrice';
export * from './useStaleWhileRevalidate';
export * from './useToggle';
export * from './useTransactionStatus';
export * from './useTypedSearchParams';
export * from './useViewMode';
export * from './useWallet';
export * from './useWindowSize';
FILEOF
commit "hooks/index.ts" "Add hooks/index: barrel export for all custom hooks"

# ── README.md ──
mkdir -p lib
cat > lib/README.md << 'FILEOF'
# VaultSTX Library

Utility functions and hooks powering the VaultSTX escrow frontend.

## Structure

- `contract.ts` — Stacks contract read/write helpers
- `constants.ts` — App-wide config values
- `format.ts` — STX and address formatting
- `validation.ts` — Form input validators
- `errors.ts` — Contract error code mapping
- `types.ts` — Shared TypeScript interfaces
- `analytics.ts` — Event tracking
- `cache.ts` — In-memory TTL cache
- `storage.ts` — localStorage wrappers
- `logger.ts` — Structured logging
- `events.ts` — Client-side event bus
- `network.ts` — Stacks network config
- `permissions.ts` — Role-based action checks
- `stacks-api.ts` — Hiro API wrappers
- `schema.ts` — Runtime validation
- `math.ts` — Escrow financial math
- `bigint.ts` — BigInt arithmetic helpers

## Usage

\`\`\`ts
import { microToSTX, truncatePrincipal } from '@/lib/contract';
import { useWallet } from '@/hooks/useWallet';
\`\`\`
FILEOF
commit "lib/README.md" "Add lib/README: documentation for the VaultSTX utility library"

echo ""
echo "🎯 June 30 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
