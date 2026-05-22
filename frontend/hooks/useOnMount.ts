import { useEffect } from 'react';

export function useOnMount(fn: () => void | (() => void)) {
  useEffect(() => {
    return fn() ?? undefined;
  }, []);
}
