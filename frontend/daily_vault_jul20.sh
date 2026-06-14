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

# ── EscrowCountBadge.tsx ──
mkdir -p components/ui
cat > components/ui/EscrowCountBadge.tsx << 'FILEOF'
'use client';
import { useEscrowCount } from '@/hooks/useEscrowCount';
import { CountBadge } from './CountBadge';

export function EscrowCountBadge({ state }: { state?: 'active' | 'disputed' }) {
  const { counts } = useEscrowCount();
  const count = state ? counts[state] : counts.total;
  return <CountBadge count={count} color={state === 'disputed' ? '#A32D2D' : 'var(--gold)'} />;
}
FILEOF
commit "components/ui/EscrowCountBadge.tsx" "Add EscrowCountBadge: live escrow count badge for nav"

# ── useEscrowSocket.ts ──
mkdir -p hooks
cat > hooks/useEscrowSocket.ts << 'FILEOF'
'use client';
import { useEffect, useRef, useCallback } from 'react';

type MessageHandler = (data: unknown) => void;

export function useEscrowSocket(url: string | null, onMessage: MessageHandler) {
  const ws = useRef<WebSocket | null>(null);
  const handler = useRef(onMessage);
  useEffect(() => { handler.current = onMessage; }, [onMessage]);

  const connect = useCallback(() => {
    if (!url) return;
    ws.current = new WebSocket(url);
    ws.current.onmessage = (e) => {
      try { handler.current(JSON.parse(e.data)); } catch (_) {}
    };
    ws.current.onerror = () => ws.current?.close();
    ws.current.onclose = () => setTimeout(connect, 5000);
  }, [url]);

  useEffect(() => {
    connect();
    return () => ws.current?.close();
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
FILEOF
commit "hooks/useEscrowSocket.ts" "Add useEscrowSocket: WebSocket connection for real-time updates"

# ── env-check.ts ──
mkdir -p lib
cat > lib/env-check.ts << 'FILEOF'
const REQUIRED_VARS = [
  'NEXT_PUBLIC_CONTRACT_ADDRESS',
] as const;

const OPTIONAL_VARS = [
  'NEXT_PUBLIC_NETWORK',
  'NEXT_PUBLIC_TELEMETRY',
] as const;

export function checkEnv(): { ok: boolean; missing: string[] } {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  return { ok: missing.length === 0, missing };
}

export function logEnvStatus() {
  const { ok, missing } = checkEnv();
  if (!ok) console.warn('[VaultSTX] Missing env vars:', missing.join(', '));
  else console.debug('[VaultSTX] Environment OK');
}
FILEOF
commit "lib/env-check.ts" "Add env-check: validate required environment variables on startup"

echo ""
echo "🎯 July 20 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
