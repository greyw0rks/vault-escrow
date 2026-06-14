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

# -- EventLog.tsx --
mkdir -p components/ui
cat > components/ui/EventLog.tsx << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';
import { getLog, type LogEntry } from '@/lib/event-log';

const COLORS: Record<LogEntry['level'], string> = { info: 'var(--muted)', warn: '#EF9F27', error: '#A32D2D' };

export function EventLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  useEffect(() => {
    setEntries(getLog());
    const t = setInterval(() => setEntries(getLog()), 2000);
    return () => clearInterval(t);
  }, []);

  if (process.env.NODE_ENV !== 'development' || entries.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 8, right: 8, width: 320, maxHeight: 200, overflowY: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '.5rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '.625rem', zIndex: 9998 }}>
      {entries.map((e, i) => (
        <div key={i} style={{ color: COLORS[e.level], marginBottom: '.2rem' }}>
          [{new Date(e.timestamp).toISOString().slice(11, 19)}] {e.action}
        </div>
      ))}
    </div>
  );
}
FILEOF
commit "components/ui/EventLog.tsx" "Add EventLog: dev-mode structured event log display"

# -- useEventLog.ts --
mkdir -p hooks
cat > hooks/useEventLog.ts << 'FILEOF'
'use client';
import { useState, useEffect } from 'react';
import { getLog, clearLog, type LogEntry } from '@/lib/event-log';

export function useEventLog(refreshMs = 2000) {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    setEntries(getLog());
    const t = setInterval(() => setEntries(getLog()), refreshMs);
    return () => clearInterval(t);
  }, [refreshMs]);

  return { entries, clear: () => { clearLog(); setEntries([]); } };
}
FILEOF
commit "hooks/useEventLog.ts" "Add useEventLog: reactive event log hook for dev debugging"

# -- final-utils.ts --
mkdir -p lib
cat > lib/final-utils.ts << 'FILEOF'
export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function retry<T>(fn: () => Promise<T>, times = 3, delay = 500): Promise<T> {
  return fn().catch(err => times > 1 ? sleep(delay).then(() => retry(fn, times - 1, delay * 2)) : Promise.reject(err));
}

export function once<T extends (...args: unknown[]) => unknown>(fn: T): T {
  let called = false; let result: unknown;
  return ((...args) => { if (!called) { called = true; result = fn(...args); } return result; }) as T;
}

export function memoizeOne<T extends (...args: unknown[]) => unknown>(fn: T): T {
  let lastArgs: unknown[] | null = null; let lastResult: unknown;
  return ((...args) => {
    if (!lastArgs || args.some((a, i) => a !== lastArgs![i])) { lastArgs = args; lastResult = fn(...args); }
    return lastResult;
  }) as T;
}
FILEOF
commit "lib/final-utils.ts" "Add final-utils: miscellaneous utility functions for August wrap-up"

echo ""
echo "🎯 August 28 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
