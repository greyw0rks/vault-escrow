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

# -- AuditLog.tsx --
mkdir -p components/ui
cat > components/ui/AuditLog.tsx << 'FILEOF'
'use client';
import type { TimelineEvent } from '@/hooks/useEscrowTimeline';

export function AuditLog({ events }: { events: TimelineEvent[] }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem' }}>
      <div style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>Audit Log</div>
      {events.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No events recorded.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
          {events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem .75rem', background: 'var(--raised)', borderRadius: 4 }}>
              <span style={{ color: 'var(--text)' }}>{ev.label}</span>
              <span style={{ color: 'var(--muted)' }}>#{ev.block.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
FILEOF
commit "components/ui/AuditLog.tsx" "Add AuditLog: display escrow audit trail with block timestamps"

# -- useAuditLog.ts --
mkdir -p hooks
cat > hooks/useAuditLog.ts << 'FILEOF'
'use client';
import { useMemo } from 'react';
import { useEscrowTimeline } from './useEscrowTimeline';
import type { Escrow, Milestone } from '@/lib/contract';

export function useAuditLog(escrow: Escrow | null, milestones: Milestone[]) {
  const events = useEscrowTimeline(escrow, milestones);
  return useMemo(() => events.map(ev => ({
    ...ev,
    timestamp: 'Block #' + ev.block.toLocaleString(),
  })), [events]);
}
FILEOF
commit "hooks/useAuditLog.ts" "Add useAuditLog: fetch and format escrow audit log entries"

# -- audit.ts --
mkdir -p lib
cat > lib/audit.ts << 'FILEOF'
import type { TimelineEvent } from '@/hooks/useEscrowTimeline';

export function auditToText(events: TimelineEvent[]): string {
  return events.map(ev => ev.block + '\t' + ev.type + '\t' + ev.label).join('\n');
}

export function downloadAudit(events: TimelineEvent[], escrowId: number) {
  const content = 'Block\tType\tLabel\n' + auditToText(events);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'escrow-' + escrowId + '-audit.txt'; a.click();
  URL.revokeObjectURL(url);
}
FILEOF
commit "lib/audit.ts" "Add audit: escrow audit trail formatting and export helpers"

echo ""
echo "🎯 August 1 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
