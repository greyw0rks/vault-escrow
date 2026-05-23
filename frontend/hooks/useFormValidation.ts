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
