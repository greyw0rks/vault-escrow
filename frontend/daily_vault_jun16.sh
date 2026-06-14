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

# ── EmptyEscrows.tsx ──
mkdir -p components/ui
cat > components/ui/EmptyEscrows.tsx << 'FILEOF'
'use client';
import Link from 'next/link';

export function EmptyEscrows({ filtered = false }: { filtered?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', opacity: .25 }}>⬡</div>
      <div>
        <p style={{ margin: '0 0 .5rem', fontFamily: "'Playfair Display',serif", fontSize: '1.125rem' }}>
          {filtered ? 'No matching escrows' : 'No escrows yet'}
        </p>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.875rem', fontFamily: "'DM Sans',sans-serif" }}>
          {filtered ? 'Try adjusting your filters.' : 'Create your first escrow to get started.'}
        </p>
      </div>
      {!filtered && <Link href="/escrow/new" className="btn-primary">Create Escrow</Link>}
    </div>
  );
}
FILEOF
commit "components/ui/EmptyEscrows.tsx" "Add EmptyEscrows: illustrated empty state for no escrows found"

# ── useEscrowById.ts ──
mkdir -p hooks
cat > hooks/useEscrowById.ts << 'FILEOF'
'use client';
import { useParams } from 'next/navigation';
import { useEscrow } from './useEscrow';

export function useEscrowById() {
  const { id } = useParams<{ id: string }>();
  const escrowId = id ? Number(id) : null;
  return { ...useEscrow(escrowId), escrowId };
}
FILEOF
commit "hooks/useEscrowById.ts" "Add useEscrowById: fetch a single escrow by URL param id"

# ── url.ts ──
mkdir -p lib
cat > lib/url.ts << 'FILEOF'
export const ROUTES = {
  home:        '/',
  dashboard:   '/dashboard',
  newEscrow:   '/escrow/new',
  escrow: (id: number) => '/escrow/' + id,
} as const;

export function escrowUrl(id: number): string {
  return typeof window !== 'undefined'
    ? window.location.origin + ROUTES.escrow(id)
    : ROUTES.escrow(id);
}

export function isEscrowRoute(pathname: string): boolean {
  return /^\/escrow\/\d+/.test(pathname);
}
FILEOF
commit "lib/url.ts" "Add url: URL builder helpers for escrow and explorer links"

echo ""
echo "🎯 June 16 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
