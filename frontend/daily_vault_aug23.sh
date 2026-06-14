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

# -- ValidationMessage.tsx --
mkdir -p components/ui
cat > components/ui/ValidationMessage.tsx << 'FILEOF'
interface Props { message?: string; type?: 'error' | 'warning' | 'success'; }

const COLORS = { error: '#A32D2D', warning: '#EF9F27', success: '#1D9E75' };
const ICONS  = { error: '⚠', warning: '!', success: '✓' };

export function ValidationMessage({ message, type = 'error' }: Props) {
  if (!message) return null;
  const color = COLORS[type];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.375rem', marginTop: '.25rem' }}>
      <span style={{ color, fontSize: '.75rem' }}>{ICONS[type]}</span>
      <span style={{ color, fontSize: '.75rem', fontFamily: "'DM Sans',sans-serif" }}>{message}</span>
    </div>
  );
}
FILEOF
commit "components/ui/ValidationMessage.tsx" "Add ValidationMessage: inline validation feedback component"

# -- useValidation.ts --
mkdir -p hooks
cat > hooks/useValidation.ts << 'FILEOF'
import { useState, useCallback } from 'react';

type Rule = (v: string) => string | undefined;

export function useValidation(rules: Record<string, Rule[]>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((values: Record<string, string>): boolean => {
    const newErrors: Record<string, string> = {};
    for (const [field, fieldRules] of Object.entries(rules)) {
      for (const rule of fieldRules) {
        const err = rule(values[field] ?? '');
        if (err) { newErrors[field] = err; break; }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rules]);

  const clearField = useCallback((field: string) => {
    setErrors(e => { const next = { ...e }; delete next[field]; return next; });
  }, []);

  return { errors, validate, clearField };
}
FILEOF
commit "hooks/useValidation.ts" "Add useValidation: form field validation with typed rules"

# -- rules.ts --
mkdir -p lib
cat > lib/rules.ts << 'FILEOF'
export const required = (msg = 'Required'): ((v: string) => string | undefined) =>
  (v: string) => v.trim() ? undefined : msg;

export const minLength = (min: number, msg?: string): ((v: string) => string | undefined) =>
  (v: string) => v.length >= min ? undefined : (msg ?? 'Min ' + min + ' characters');

export const maxLength = (max: number, msg?: string): ((v: string) => string | undefined) =>
  (v: string) => v.length <= max ? undefined : (msg ?? 'Max ' + max + ' characters');

export const pattern = (regex: RegExp, msg = 'Invalid format'): ((v: string) => string | undefined) =>
  (v: string) => regex.test(v) ? undefined : msg;

export const minValue = (min: number, msg?: string): ((v: string) => string | undefined) =>
  (v: string) => parseFloat(v) >= min ? undefined : (msg ?? 'Min value: ' + min);
FILEOF
commit "lib/rules.ts" "Add rules: reusable validation rule factories"

echo ""
echo "🎯 August 23 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
