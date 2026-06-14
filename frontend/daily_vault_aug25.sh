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

# -- FormSection.tsx --
mkdir -p components/ui
cat > components/ui/FormSection.tsx << 'FILEOF'
interface Props { title: string; description?: string; children: React.ReactNode; }

export function FormSection({ title, description, children }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
        {description && <p style={{ margin: '.375rem 0 0', color: 'var(--muted)', fontSize: '.875rem', fontFamily: "'DM Sans',sans-serif" }}>{description}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
        {children}
      </div>
    </div>
  );
}
FILEOF
commit "components/ui/FormSection.tsx" "Add FormSection: grouped form section with title and divider"

# -- useFormDirty.ts --
mkdir -p hooks
cat > hooks/useFormDirty.ts << 'FILEOF'
import { useState, useEffect, useCallback } from 'react';
import { isFormDirty } from '@/lib/form-utils';

export function useFormDirty<T extends Record<string, unknown>>(initial: T, current: T) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDirty(isFormDirty(initial, current));
  }, [initial, current]);

  const reset = useCallback(() => setDirty(false), []);

  return { dirty, reset };
}
FILEOF
commit "hooks/useFormDirty.ts" "Add useFormDirty: track whether form has unsaved changes"

# -- submit-utils.ts --
mkdir -p lib
cat > lib/submit-utils.ts << 'FILEOF'
export type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export interface SubmitStatus {
  state: SubmitState;
  error: string | null;
}

export function createSubmitStatus(): SubmitStatus {
  return { state: 'idle', error: null };
}

export function toSubmitting(): SubmitStatus {
  return { state: 'submitting', error: null };
}

export function toSuccess(): SubmitStatus {
  return { state: 'success', error: null };
}

export function toError(error: string): SubmitStatus {
  return { state: 'error', error };
}

export function isSubmitting(s: SubmitStatus): boolean { return s.state === 'submitting'; }
export function isSuccess(s: SubmitStatus): boolean    { return s.state === 'success'; }
export function isError(s: SubmitStatus): boolean      { return s.state === 'error'; }
FILEOF
commit "lib/submit-utils.ts" "Add submit-utils: form submission helpers and state machine"

echo ""
echo "🎯 August 25 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
