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

# ── MetaRow.tsx ──
mkdir -p components/ui
cat > components/ui/MetaRow.tsx << 'FILEOF'
interface Props {
  items: { label: string; value: React.ReactNode; mono?: boolean }[];
}

export function MetaRow({ items }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
      {items.map(({ label, value, mono }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
          <span style={{ fontSize: '.6875rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
          <span style={{ fontSize: '.875rem', fontFamily: mono ? "'JetBrains Mono',monospace" : "'DM Sans',sans-serif" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}
FILEOF
commit "components/ui/MetaRow.tsx" "Add MetaRow: key-value metadata row with optional mono font"

# ── useFormValidation.ts ──
mkdir -p hooks
cat > hooks/useFormValidation.ts << 'FILEOF'
import { useState, useCallback } from 'react';

type Validators<T> = Partial<Record<keyof T, (val: string) => string | undefined>>;

export function useFormValidation<T extends Record<string, string>>(validators: Validators<T>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = useCallback((values: T): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let valid = true;
    for (const key of Object.keys(validators) as (keyof T)[]) {
      const fn = validators[key];
      if (!fn) continue;
      const err = fn(values[key] ?? '');
      if (err) { newErrors[key] = err; valid = false; }
    }
    setErrors(newErrors);
    return valid;
  }, [validators]);

  const clear = useCallback(() => setErrors({}), []);

  return { errors, validate, clear, setErrors };
}
FILEOF
commit "hooks/useFormValidation.ts" "Add useFormValidation: run validators and collect field errors"

# ── time.ts ──
mkdir -p lib
cat > lib/time.ts << 'FILEOF'
export function msToHuman(ms: number): string {
  if (ms < 60_000) return Math.round(ms / 1000) + 's';
  if (ms < 3_600_000) return Math.round(ms / 60_000) + 'm';
  if (ms < 86_400_000) return Math.round(ms / 3_600_000) + 'h';
  return Math.round(ms / 86_400_000) + 'd';
}

export function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return Math.round(diff / 60_000) + 'm ago';
  if (diff < 86_400_000) return Math.round(diff / 3_600_000) + 'h ago';
  return Math.round(diff / 86_400_000) + 'd ago';
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
FILEOF
commit "lib/time.ts" "Add time: timestamp and duration formatting utilities"

echo ""
echo "🎯 June 19 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
