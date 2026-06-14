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

# -- ToastProvider.tsx --
mkdir -p components/ui
cat > components/ui/ToastProvider.tsx << 'FILEOF'
'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import type { Toast } from '@/lib/toast';
import { createToast, type ToastType } from '@/lib/toast';
import { NotificationStack } from './NotificationStack';

interface ToastCtx {
  toasts: Toast[];
  add: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastCtx>({ toasts: [], add: () => {}, remove: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const toast = createToast(message, type);
    setToasts(ts => [...ts, toast]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== toast.id)), toast.ttl);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
      <NotificationStack notifications={toasts.map(t => ({ id: t.id, message: t.message, type: t.type === 'warning' ? 'info' : t.type }))} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
FILEOF
commit "components/ui/ToastProvider.tsx" "Add ToastProvider: context provider for global toast notifications"

# -- useToastNotify.ts --
mkdir -p hooks
cat > hooks/useToastNotify.ts << 'FILEOF'
'use client';
import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import type { Escrow } from '@/lib/contract';

export function useToastNotify(escrow: Escrow | null) {
  const { add } = useToast();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!escrow) return;
    if (prev.current && prev.current !== escrow.state) {
      const msgs: Record<string, [string, 'success' | 'error' | 'info']> = {
        active:    ['Escrow is now active.',  'success'],
        disputed:  ['A dispute was raised.',  'error'],
        complete:  ['Escrow is complete!',    'success'],
        cancelled: ['Escrow was cancelled.',  'info'],
      };
      const entry = msgs[escrow.state];
      if (entry) add(entry[0], entry[1]);
    }
    prev.current = escrow.state;
  }, [escrow?.state]);
}
FILEOF
commit "hooks/useToastNotify.ts" "Add useToastNotify: show toast on escrow contract events"

# -- event-log.ts --
mkdir -p lib
cat > lib/event-log.ts << 'FILEOF'
export interface LogEntry {
  timestamp: number;
  level:     'info' | 'warn' | 'error';
  action:    string;
  data?:     unknown;
}

const MAX_ENTRIES = 100;
let log: LogEntry[] = [];

export function logAction(action: string, data?: unknown, level: LogEntry['level'] = 'info') {
  log = [{ timestamp: Date.now(), level, action, data }, ...log].slice(0, MAX_ENTRIES);
}

export function getLog(): LogEntry[] { return [...log]; }
export function clearLog(): void     { log = []; }

export function logEscrowAction(escrowId: number, action: string, data?: unknown) {
  logAction('escrow:' + escrowId + ':' + action, data);
}
FILEOF
commit "lib/event-log.ts" "Add event-log: structured event logging for escrow actions"

echo ""
echo "🎯 August 27 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
