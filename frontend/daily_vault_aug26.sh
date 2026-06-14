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

# -- SubmitButton.tsx --
mkdir -p components/ui
cat > components/ui/SubmitButton.tsx << 'FILEOF'
'use client';
import type { SubmitStatus } from '@/lib/submit-utils';

interface Props {
  status: SubmitStatus;
  label?: string;
  loadingLabel?: string;
  successLabel?: string;
  onClick: () => void;
  disabled?: boolean;
}

export function SubmitButton({ status, label = 'Submit', loadingLabel = 'Submitting...', successLabel = 'Done!', onClick, disabled }: Props) {
  const isLoading = status.state === 'submitting';
  const isSuccess = status.state === 'success';
  const text = isLoading ? loadingLabel : isSuccess ? successLabel : label;
  const bg   = isSuccess ? '#1D9E75' : 'var(--gold)';

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading || isSuccess}
      style={{ background: bg, color: '#1A1000', border: 'none', borderRadius: 'var(--radius)', padding: '.625rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '.9375rem', cursor: disabled || isLoading || isSuccess ? 'not-allowed' : 'pointer', opacity: disabled ? .6 : 1, transition: 'all .2s' }}>
      {text}
    </button>
  );
}
FILEOF
commit "components/ui/SubmitButton.tsx" "Add SubmitButton: form submit button with loading and success states"

# -- useSubmit.ts --
mkdir -p hooks
cat > hooks/useSubmit.ts << 'FILEOF'
import { useState, useCallback } from 'react';
import { createSubmitStatus, toSubmitting, toSuccess, toError, type SubmitStatus } from '@/lib/submit-utils';

export function useSubmit(handler: () => Promise<void>) {
  const [status, setStatus] = useState<SubmitStatus>(createSubmitStatus());

  const submit = useCallback(async () => {
    setStatus(toSubmitting());
    try {
      await handler();
      setStatus(toSuccess());
    } catch (e: any) {
      setStatus(toError(e.message ?? 'Unknown error'));
    }
  }, [handler]);

  const reset = useCallback(() => setStatus(createSubmitStatus()), []);

  return { status, submit, reset };
}
FILEOF
commit "hooks/useSubmit.ts" "Add useSubmit: form submit handler with loading and error state"

# -- toast.ts --
mkdir -p lib
cat > lib/toast.ts << 'FILEOF'
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id:      string;
  message: string;
  type:    ToastType;
  ttl:     number;
}

export function createToast(message: string, type: ToastType = 'info', ttl = 5000): Toast {
  return { id: Math.random().toString(36).slice(2), message, type, ttl };
}

export function successToast(message: string): Toast { return createToast(message, 'success'); }
export function errorToast(message: string): Toast   { return createToast(message, 'error'); }
export function infoToast(message: string): Toast    { return createToast(message, 'info'); }
FILEOF
commit "lib/toast.ts" "Add toast: toast notification queue and display helpers"

echo ""
echo "🎯 August 26 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
