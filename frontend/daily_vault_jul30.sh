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

# ── AppProviders.tsx ──
mkdir -p components/ui
cat > components/ui/AppProviders.tsx << 'FILEOF'
'use client';
import { Connect } from '@stacks/connect-react';
import { userSession } from '@/lib/userSession';

interface Props { children: React.ReactNode; }

export function AppProviders({ children }: Props) {
  return (
    <Connect authOptions={{ appDetails: { name: 'VaultSTX', icon: '/logo.svg' }, userSession }}>
      {children}
    </Connect>
  );
}
FILEOF
commit "components/ui/AppProviders.tsx" "Add AppProviders: combined React context providers wrapper"

# ── useAppInit.ts ──
mkdir -p hooks
cat > hooks/useAppInit.ts << 'FILEOF'
'use client';
import { useEffect } from 'react';
import { logEnvStatus } from '@/lib/env-check';
import { logger } from '@/lib/logger';
import { CONFIG } from '@/lib/config';

export function useAppInit() {
  useEffect(() => {
    logEnvStatus();
    logger.info('VaultSTX ' + CONFIG.app.version + ' initialized', {
      network: CONFIG.network.name,
      contract: CONFIG.network.contractAddress,
    });
  }, []);
}
FILEOF
commit "hooks/useAppInit.ts" "Add useAppInit: run app initialization checks on mount"

# ── userSession.ts ──
mkdir -p lib
cat > lib/userSession.ts << 'FILEOF'
import { AppConfig, UserSession } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });
FILEOF
commit "lib/userSession.ts" "Add lib/userSession: shared Stacks user session instance"

echo ""
echo "🎯 July 30 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
