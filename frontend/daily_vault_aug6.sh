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

# -- QuickActions.tsx --
mkdir -p components/ui
cat > components/ui/QuickActions.tsx << 'FILEOF'
'use client';
import { useToggle } from '@/hooks/useToggle';

interface Action { label: string; icon: string; onClick: () => void; disabled?: boolean; }

export function QuickActions({ actions }: { actions: Action[] }) {
  const [open, toggle, , close] = useToggle(false);
  const enabled = actions.filter(a => !a.disabled);
  if (enabled.length === 0) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={toggle} className="btn-primary" style={{ padding: '.5rem 1rem', display: 'flex', alignItems: 'center', gap: '.375rem' }}>
        Actions <span style={{ fontSize: '.75rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + .375rem)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', minWidth: 200, zIndex: 50, overflow: 'hidden' }}>
          {enabled.map((action, i) => (
            <button key={i} onClick={() => { action.onClick(); close(); }}
              style={{ width: '100%', padding: '.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans',sans-serif", fontSize: '.875rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '.625rem', borderBottom: i < enabled.length - 1 ? '1px solid var(--border)' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--raised)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span>{action.icon}</span>{action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
FILEOF
commit "components/ui/QuickActions.tsx" "Add QuickActions: floating quick-action menu for escrow detail"

# -- useQuickActions.ts --
mkdir -p hooks
cat > hooks/useQuickActions.ts << 'FILEOF'
import { useMemo } from 'react';
import type { Escrow, Milestone } from '@/lib/contract';
import { useMilestoneActions } from './useMilestoneActions';
import type { Role } from '@/lib/types';

export function useQuickActions(
  role: Role,
  escrow: Escrow | null,
  milestone: Milestone | null,
  handlers: { submit: () => void; approve: () => void; dispute: () => void; resolveWorker: () => void; resolveClient: () => void },
) {
  const perms = useMilestoneActions(role, escrow, milestone);
  return useMemo(() => [
    { label: 'Submit for Review', icon: '📤', onClick: handlers.submit,        disabled: !perms.canSubmit },
    { label: 'Approve Milestone', icon: '✓',  onClick: handlers.approve,       disabled: !perms.canApprove },
    { label: 'Raise Dispute',     icon: '⚠',  onClick: handlers.dispute,       disabled: !perms.canDispute },
    { label: 'Release to Worker', icon: '→',  onClick: handlers.resolveWorker, disabled: !perms.canResolve },
    { label: 'Refund Client',     icon: '←',  onClick: handlers.resolveClient, disabled: !perms.canResolve },
  ], [perms, handlers]);
}
FILEOF
commit "hooks/useQuickActions.ts" "Add useQuickActions: build quick action list from escrow permissions"

# -- keymap.ts --
mkdir -p lib
cat > lib/keymap.ts << 'FILEOF'
export const KEYMAP = {
  SEARCH:      '/',
  NEW_ESCROW:  'n',
  DASHBOARD:   'd',
  REFRESH:     'r',
  ESCAPE:      'Escape',
  NEXT:        'j',
  PREV:        'k',
  CONFIRM:     'Enter',
} as const;

export type Key = typeof KEYMAP[keyof typeof KEYMAP];

export function formatKey(key: string): string {
  const MAP: Record<string, string> = { Escape: 'Esc', Enter: 'Enter', ArrowUp: 'Up', ArrowDown: 'Down' };
  return MAP[key] ?? key.toUpperCase();
}
FILEOF
commit "lib/keymap.ts" "Add keymap: keyboard shortcut definitions for the app"

echo ""
echo "🎯 August 6 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
