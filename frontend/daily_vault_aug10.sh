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

# -- VisuallyHidden.tsx --
mkdir -p components/ui
cat > components/ui/VisuallyHidden.tsx << 'FILEOF'
import { srOnly } from '@/lib/accessibility';

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span style={srOnly()}>{children}</span>;
}
FILEOF
commit "components/ui/VisuallyHidden.tsx" "Add VisuallyHidden: screen-reader accessible hidden text"

# -- useFocusTrap.ts --
mkdir -p hooks
cat > hooks/useFocusTrap.ts << 'FILEOF'
'use client';
import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus(); } }
    };

    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [active]);

  return ref;
}
FILEOF
commit "hooks/useFocusTrap.ts" "Add useFocusTrap: trap keyboard focus within modal dialogs"

# -- focus.ts --
mkdir -p lib
cat > lib/focus.ts << 'FILEOF'
export function focusFirst(container: HTMLElement): void {
  const el = container.querySelector<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');
  el?.focus();
}

export function focusById(id: string): void {
  document.getElementById(id)?.focus();
}
FILEOF
commit "lib/focus.ts" "Add focus: focus management utilities for accessible UI"

echo ""
echo "🎯 August 10 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
