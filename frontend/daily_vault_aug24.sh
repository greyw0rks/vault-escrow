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

# -- FormField.tsx --
mkdir -p components/ui
cat > components/ui/FormField.tsx << 'FILEOF'
import { ValidationMessage } from './ValidationMessage';

interface Props {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, hint, required: req, children }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
      <label style={{ fontSize: '.8125rem', color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace", display: 'flex', gap: '.25rem' }}>
        {label}
        {req && <span style={{ color: '#A32D2D' }}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontFamily: "'DM Sans',sans-serif" }}>{hint}</span>}
      <ValidationMessage message={error} type="error" />
    </div>
  );
}
FILEOF
commit "components/ui/FormField.tsx" "Add FormField: labeled form field wrapper with validation"

# -- useFormField.ts --
mkdir -p hooks
cat > hooks/useFormField.ts << 'FILEOF'
import { useState, useCallback } from 'react';

type Validator = (v: string) => string | undefined;

export function useFormField(initial = '', validators: Validator[] = []) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const onChange = useCallback((v: string) => {
    setValue(v);
    if (touched) {
      for (const validate of validators) {
        const err = validate(v);
        if (err) { setError(err); return; }
      }
      setError(undefined);
    }
  }, [touched, validators]);

  const onBlur = useCallback(() => {
    setTouched(true);
    for (const validate of validators) {
      const err = validate(value);
      if (err) { setError(err); return; }
    }
    setError(undefined);
  }, [value, validators]);

  const reset = useCallback(() => { setValue(initial); setError(undefined); setTouched(false); }, [initial]);

  return { value, error, touched, onChange, onBlur, reset, isValid: !error && touched };
}
FILEOF
commit "hooks/useFormField.ts" "Add useFormField: single field state with validation"

# -- form-utils.ts --
mkdir -p lib
cat > lib/form-utils.ts << 'FILEOF'
export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

export function touchAll<T extends Record<string, unknown>>(fields: T): Record<keyof T, true> {
  return Object.keys(fields).reduce((acc, k) => ({ ...acc, [k]: true }), {} as Record<keyof T, true>);
}

export function getChangedFields<T extends Record<string, unknown>>(initial: T, current: T): Partial<T> {
  const changed: Partial<T> = {};
  for (const key of Object.keys(initial) as (keyof T)[]) {
    if (initial[key] !== current[key]) changed[key] = current[key];
  }
  return changed;
}

export function isFormDirty<T extends Record<string, unknown>>(initial: T, current: T): boolean {
  return Object.keys(getChangedFields(initial, current)).length > 0;
}
FILEOF
commit "lib/form-utils.ts" "Add form-utils: form state utility helpers"

echo ""
echo "🎯 August 24 vault commits: $COUNT"
git push origin main -q
echo "🚀 Pushed to origin/main"
