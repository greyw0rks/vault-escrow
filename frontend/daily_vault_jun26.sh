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

# ── AddressAvatar.tsx ──
mkdir -p components/ui
cat > components/ui/AddressAvatar.tsx << 'FILEOF'
interface Props { address: string; size?: number; }

function colorFromAddress(address: string): string {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return 'hsl(' + h + ', 55%, 45%)';
}

export function AddressAvatar({ address, size = 32 }: Props) {
  const color = colorFromAddress(address);
  const initials = address.slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '22', border: '1px solid ' + color + '55',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono',monospace",
      fontSize: size * 0.34 + 'px', color, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}
FILEOF
commit "components/ui/AddressAvatar.tsx" "Add AddressAvatar: deterministic color avatar from address"

# ── useEscrowCreate.ts ──
mkdir -p hooks
cat > hooks/useEscrowCreate.ts << 'FILEOF'
'use client';
import { useContractCall } from './useContractCall';
import { buildCreateEscrow, buildAddMilestone, buildActivateEscrow, stxToMicro } from '@/lib/contract';

interface MilestoneEntry { description: string; amount: string; }

export function useEscrowCreate() {
  const { call, loading, error, txId } = useContractCall();

  const createEscrow = (worker: string, resolver: string, deposit: string, onSuccess?: () => void) =>
    call(buildCreateEscrow(worker, resolver, stxToMicro(deposit)), onSuccess);

  const addMilestone = (escrowId: number, description: string, amount: string, onSuccess?: () => void) =>
    call(buildAddMilestone(escrowId, description, stxToMicro(amount)), onSuccess);

  const activate = (escrowId: number, onSuccess?: () => void) =>
    call(buildActivateEscrow(escrowId), onSuccess);

  return { createEscrow, addMilestone, activate, loading, error, txId };
}
FILEOF
commit "hooks/useEscrowCreate.ts" "Add useEscrowCreate: full escrow creation flow hook"

# ── schema.ts ──
mkdir -p lib
cat > lib/schema.ts << 'FILEOF'
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseSTX(raw: string): Result<bigint> {
  const n = parseFloat(raw);
  if (isNaN(n) || n <= 0) return { ok: false, error: 'Enter a positive STX amount' };
  if (n > 1_000_000) return { ok: false, error: 'Amount too large' };
  return { ok: true, value: BigInt(Math.round(n * 1_000_000)) };
}

export function parsePrincipal(raw: string): Result<string> {
  const trimmed = raw.trim();
  if (!/^S[A-Z0-9]{28,41}$/.test(trimmed)) return { ok: false, error: 'Invalid Stacks address' };
  return { ok: true, value: trimmed };
}

export function parseDescription(raw: string): Result<string> {
  const trimmed = raw.trim();
  if (trimmed.length < 3) return { ok: false, error: 'Too short (min 3 chars)' };
  if (trimmed.length > 256) return { ok: false, error: 'Too long (max 256 chars)' };
  return { ok: true, value: trimmed };
}
FILEOF
commit "lib/schema.ts" "Add schema: Zod-lite runtime validation schemas for forms"

echo ""
echo "🎯 June 26 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
