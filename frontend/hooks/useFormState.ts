import { useState, useCallback } from 'react';

export function useFormState<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const set = useCallback((key: keyof T, value: string) => {
    setValues(v => ({ ...v, [key]: value }));
    setTouched(t => ({ ...t, [key]: true }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }, []);

  const reset = useCallback(() => { setValues(initial); setErrors({}); setTouched({}); }, [initial]);

  return { values, errors, touched, set, reset, setErrors };
}
